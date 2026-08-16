# AUDIT CRITIQUE — PROBLÈMES IDENTIFIÉS

## 1. PROBLÈME 37 vs 38 OFFRES ❌ CRITIQUE

### Analyse Exacte

**KPI "Offres publiées" (37):**
- Fonction: `getPublishedOffersCount()`
- Requête: `SELECT COUNT(id) FROM job_offers WHERE status='published'`
- Filtres appliqués: entreprise, contrat, ville, pays
- Filtres NON appliqués: dates

**Tableau "Détails des Offres" (38):**
- Fonction: `getApplicationsByOffer()`
- Requête: `SELECT * FROM job_offers` (SANS filtre de statut)
- Total retourné: COUNT de TOUTES les offres, pas seulement les publiées
- Filtres appliqués: entreprise, contrat, ville, pays, offset/limit
- Filtres NON appliqués au statut de l'offre

### Root Cause

**`getApplicationsByOffer()` ne filtre PAS sur status='published'**

```typescript
// ACTUELLEMENT (INCORRECT):
let query = supabase.from("job_offers").select(...)
// Aucun .eq("status", "published")
// Donc ramène 38 offres (publiées + non publiées)

// DEVRAIT ÊTRE (CORRECT):
let query = supabase.from("job_offers").select(...)
  .eq("status", "published")
// Pour rester cohérent avec le KPI qui compte 37 offres publiées
```

### Correction Requise

Ajouter `.eq("status", "published")` dans `getApplicationsByOffer()` pour que le tableau affiche uniquement les offres publiées, cohérent avec le KPI.

---

## 2. STATUTS DE CANDIDATURE RÉELS À AUDITER ⚠️

### Actuel (Affiché dans l'UI)
- Soumis
- Examiné
- Présélectionné
- Rejeté
- Accepté
- Retiré

### Problème

Ces statuts sont **codés en dur** dans le sélecteur du filtre UI.
Il faut vérifier que ces statuts existent **réellement** dans job_applications.status.

### Action Requise

Récupérer les valeurs DISTINCTES de `job_applications.status` et mettre à jour le sélecteur UI pour n'afficher que les statuts réels.

**Valeurs possibles réelles:** ?

---

## 3. FUSION ENTREPRISES NON DOCUMENTÉE ⚠️

### Actuel
Les entreprises sont groupées par la valeur de `job_offers.company` exactement comme stockée.

### Risque
Si `QuanticoRH` et `QUANTICO RH` existent, elles seront affichées séparément:
```
QuanticoRH → 2
QUANTICO RH → 1
```

### Politique Décidée
✅ CONSERVER les valeurs exactes telles que stockées
❌ PAS de normalisation automatique (LOWER/TRIM/etc)
✅ Afficher "Non renseignée" si company=NULL

---

## 4. LOCALISATION NON RENSEIGNÉE ⚠️

### Actuel
Les valeurs NULL/vides ne sont pas regroupées explicitement.

### Correction Requise
Regrouper sous "Non renseignée" ou "Localisation non renseignée" et compter dans le total.

---

## 5. DATES: applied_at vs publish_at ⚠️

### Distinction Critique

**Filtres sur CANDIDATURES (applied_at):**
- Total candidatures
- Candidats uniques
- Candidatures par offre
- Candidatures par entreprise
- Candidatures par contrat
- Candidatures par localisation
- Tendance temporelle
- Statuts candidature

**Filtres sur OFFRES (publish_at):**
- Offres publiées
- Offres expirées (si expires_at présent)

### Actuel
Le preset de date est appliqué globalement à `applied_at`.
Cela peut causer une incohérence: les KPI "Offres publiées" ne respectent pas le filtre de date.

### Correction Requise
Clarifier la logique:
- Si "Offres publiées" doit respecter le filtre de date → comparer `publish_at`
- Si "Offres publiées" doit être total → pas de filtre de date

Probablement: "Offres publiées" = offres existantes, pas filtrées par date.

---

## 6. CALCUL POURCENTAGE AVEC previous=0 ❌ INCORRECT

### Actuel
```
current=7, previous=0
Affiche: +7 (+100%)
```

### Problème
Impossible d'avoir +100% si previous=0.
Mathématiquement: (7-0)/0 = undefined

### Correction Requise
```typescript
if (previous === 0) {
  if (current === 0) {
    // Sans changement
    return { change: 0, changePercent: 0, isPositive: true }
  } else {
    // Nouveau volume
    return { change: current, changePercent: undefined, isPositive: true }
  }
} else {
  // Calcul normal
  changePercent = ((current - previous) / previous) * 100
}
```

Afficher: "—" ou "Nouveau volume" pour le pourcentage si previous=0.

---

## 7. JOINTURES SQL: DOUBLE-COMPTAGE POTENTIEL ⚠️

### Risque dans getApplicationsByOffer()
```sql
SELECT jo.*, ja.candidate_id, ja.status
FROM job_offers jo
LEFT JOIN job_applications ja ON ja.job_offer_id = jo.id
```

Sans GROUP BY, une offre avec 3 candidatures ramène 3 lignes.
Le COUNT() côté React comptera ces 3 lignes = OK (3 candidatures).
Mais le COUNT(ja.candidate_id DISTINCT) doit être utilisé pour candidats uniques.

### Audit Requis
Vérifier que dans getApplicationsByOffer(), le calcul des candidats uniques est correct:
```typescript
const candidateIds = new Set(
  (applications as any[])
    .map((application: any) => application.candidate_id)
    .filter(Boolean)
);
```
✅ Set automatique élimine les doublons.

Mais vérifier aussi que `applicationCount` est bien le nombre de candidatures (pas de doublons):
```typescript
applicationCount: applications.length
```
✅ Correct, car les applications sont déjà filtrées.

---

## 8. FILTRES NON APPLIQUÉS PARTOUT ⚠️

### Problème Potentiel
Certaines requêtes ne reçoivent pas tous les filtres.

Par exemple, `getPublishedOffersCount()` n'applique PAS le filtre de dates.

### Audit Requis
Vérifier que chaque requête applique les filtres de la même manière:
- dateFrom/dateTo (si applicable)
- company
- contractType
- locationCity
- locationCountry
- applicationStatus
- jobOfferId
- Filtre status de l'offre (si applicable)

---

## 9. ANOMALIES ET COMPARAISONS ⚠️

### Logique de getPreviousPeriod()
Doit calculer une période exactement équivalente à la période actuelle.

### Risques
- Décalage de 1 jour
- Timezone (UTC vs local)
- Bornes inclusives vs exclusives

### Audit Requis
Tester avec des cas réels:
- Aujourd'hui vs hier
- 7 jours vs 7 jours précédents
- Ce mois vs mois précédent

---

## 10. RPC SQL À AUDITER 🔍

Les 10 RPC SQL existantes doivent être vérifiées:
1. analytics_offres_kpis
2. analytics_offres_evolution
3. analytics_offres_by_offer
4. analytics_offres_by_company
5. analytics_offres_by_contract
6. analytics_offres_by_location
7. analytics_offres_status_breakdown
8. analytics_offres_offer_performance
9. analytics_offres_offers_without_applications
10. analytics_offres_top_companies

Vérifier dans chacune:
- Filtres appliqués correctement
- COUNT vs COUNT DISTINCT
- Jointures sans double-comptage
- Valeurs NULL gérées
- Bornes de dates correctes

---

## Résumé des Actions Requises

| N° | Problème | Sévérité | Action |
|---|----------|----------|--------|
| 1 | 37 vs 38 offres | CRITIQUE | Ajouter `.eq("status", "published")` à `getApplicationsByOffer()` |
| 2 | Statuts fictifs | HAUTE | Récupérer statuts réels, dynamiser le sélecteur UI |
| 3 | Fusion entreprises | MOYEN | Conserver valeurs exactes + documenter |
| 4 | Localisation NULL | MOYEN | Regrouper sous "Non renseignée" |
| 5 | applied_at vs publish_at | MOYEN | Clarifier logique filtres par type |
| 6 | Pourcentage 100% | MOYEN | Corriger calcul si previous=0 |
| 7 | Double-comptage | FAIBLE | Vérifier RPC et jointures |
| 8 | Filtres incomplets | MOYEN | Auditer chaque fonction API |
| 9 | Comparaisons dates | MOYEN | Tester getPreviousPeriod() |
| 10 | RPC SQL | HAUTE | Audit complet des 10 RPC |

---

## Données à Vérifier

Avant toute correction, récupérer depuis Supabase:
1. `SELECT DISTINCT status FROM job_applications` → Liste des statuts réels
2. `SELECT DISTINCT company FROM job_offers` → Pattern d'entreprises
3. `SELECT COUNT(*) FROM job_offers WHERE status='published'` → Vérifier 37 vs 38
4. `SELECT COUNT(*) FROM job_offers` → Total offres
5. `SELECT DISTINCT location_city FROM job_offers WHERE location_city IS NOT NULL` → Villes
6. `SELECT DISTINCT location_country FROM job_offers WHERE location_country IS NOT NULL` → Pays
