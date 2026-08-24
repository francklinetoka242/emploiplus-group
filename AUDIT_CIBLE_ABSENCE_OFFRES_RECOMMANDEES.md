# AUDIT CIBLÉ — ABSENCE D’OFFRES RECOMMANDÉES MALGRÉ LA PRÉSENCE DU CV

## OBJECTIF

Auditer uniquement le fonctionnement des recommandations d’offres du candidat.

Problème observé :

Le candidat possède actuellement un CV.

La section Dashboard affiche :

- « Offres recommandées pour votre profil »
- « Suggestions automatiques basées sur votre CV et votre profil »
- « Aucune recommandation disponible pour le moment. »

Avant l’ajout du CV, le système indiquait correctement qu’un CV était nécessaire.

Je veux déterminer avec certitude si :

A. le CV est présent mais non analysable ;
B. le CV est présent et analysable mais aucune offre ne correspond suffisamment ;
C. le matching retourne une liste vide à cause d’un problème technique ;
D. le CV/profil n’est pas correctement transmis au matching ;
E. une erreur est masquée et transformée en « aucune recommandation disponible » ;
F. le problème vient uniquement de l’affichage du Dashboard.

IMPORTANT :

- AUDIT UNIQUEMENT.
- NE MODIFIE AUCUN CODE.
- NE CRÉE AUCUNE MIGRATION.
- NE CHANGE PAS LE SCORE DE MATCHING.
- NE CHANGE PAS LES SEUILS.
- NE CHANGE PAS LE COMPORTEMENT DU DASHBOARD.
- Ne déduis pas qu’il n’y a aucune offre correspondante simplement parce que le tableau retourné est vide.
- Vérifie le chemin complet des données.

---

# 0. VÉRIFIER LE CANDIDAT RÉEL ET LES DONNÉES SUPABASE ACCESSIBLES

## 0.1 Chemin réel du candidat utilisé par le Dashboard

Le Dashboard ne lit pas un candidat “hardcodé” : il récupère le candidat courant depuis Supabase via l’auth utilisateur.

Le flux exact est :

- `auth.user.id` → [src/features/authentication/hooks/useAuthContext.ts](src/features/authentication/hooks/useAuthContext.ts) / session active ;
- puis `getCurrentCandidate()` dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) ;
- cette fonction appelle `supabase.auth.getUser()` ;
- si l’utilisateur est connecté, elle appelle `getCandidateProfileByUserId(user.id)` ;
- cette fonction fait un `maybeSingle()` sur `public.candidates` avec le filtre `user_id = auth.user.id` ;
- le profil est ensuite exposé à `useCandidate()` dans [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) ;
- le Dashboard consomme ce profil dans [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx).

Le point clé est que le Dashboard dépend de l’état actuel de la session Supabase et du profil candidat associé à cet utilisateur, pas d’un cache local de démonstration.

## 0.2 Champs réellement sélectionnés depuis `candidates`

Les fonctions de profil sélectionnent explicitement :

- `id`
- `user_id`
- `first_name`
- `last_name`
- `email`
- `phone`
- `avatar_url`
- `bio`
- `headline`
- `location_city`
- `location_country`
- `date_of_birth`
- `status`
- `cv_text`
- `embedding_vector`
- `cv_url`
- `cv_last_updated_at`
- `created_at`
- `updated_at`

Voir [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts).

## 0.3 Ce qu’on peut vérifier sans base de données live

À partir du code, on peut établir avec certitude ce qui suit :

- `cv_url` n’est pas un indicateur fiable de CV analysable ;
- `cv_text` et `embedding_vector` sont les champs critiques pour le matching ;
- `cv_last_updated_at` n’est utilisé que pour les notifications et l’état “CV ancien”, pas pour décider du matching ;
- le matching est strictement conditionné par `hasAnalyzableCandidateCv()` dans [src/features/candidates/api/cvApi.ts](src/features/candidates/api/cvApi.ts).

## 0.4 Vérification concrète des valeurs attendues

Le code attend exactement ceci :

```text
cv_url              : PRESENT / ABSENT
cv_text             : PRESENT / ABSENT / VIDE
embedding_vector    : PRESENT / ABSENT / INVALIDE
cv_last_updated_at  : valeur réelle ou null
```

La règle métier est :

```text
CV analysable = cv_url présent ET cv_text non vide ET embedding_vector non vide
```

La condition est appliquée ici :

- [src/features/candidates/api/cvApi.ts](src/features/candidates/api/cvApi.ts)

## 0.5 Ce qu’on ne peut pas confirmer depuis le dépôt seul

Dans ce workspace, il n’y a pas de snapshot live de la table `public.candidates` ni de la base de données Supabase exploitable directement en lecture depuis l’éditeur.

La source ne contient pas les valeurs réelles du candidat courant dans un fichier de données.

Donc, sans un accès Supabase authentifié ou un export SQL, je ne peux pas affirmer de manière factuelle :

- `cv_url` est bien présent ou absent pour le candidat actuel ;
- `cv_text` est exactement rempli ou vide ;
- `embedding_vector` a une valeur valide ou est null ;
- `cv_last_updated_at` contient telle date exacte.

## 0.6 Requête SQL de vérification si l’accès Supabase est disponible

Si l’accès à la base est disponible, la vérification la plus directe est :

```sql
SELECT
  id,
  user_id,
  cv_url,
  cv_text,
  embedding_vector,
  cv_last_updated_at
FROM public.candidates
WHERE user_id = '<auth.user.id>';
```

Et la condition de décision métier correspondante est :

```sql
SELECT
  cv_url IS NOT NULL AND trim(cv_url) <> '' AS has_cv_url,
  cv_text IS NOT NULL AND trim(cv_text) <> '' AS has_cv_text,
  embedding_vector IS NOT NULL AS has_embedding,
  cv_url IS NOT NULL AND trim(cv_url) <> ''
  AND cv_text IS NOT NULL AND trim(cv_text) <> ''
  AND embedding_vector IS NOT NULL AS is_analysable;
```

## 0.7 Diagnostic de valeur sans accès live

Le code établit déjà une conclusion fiable même sans lire la base :

- le Dashboard ne s’appuie pas sur “un CV uploadé visuellement” seulement ;
- il s’appuie sur une condition stricte de CV analysable ;
- si `cv_text` ou `embedding_vector` est absent, le candidat est traité comme non analysable ;
- dans ce cas, le code retourne un tableau vide et l’UI affiche le message générique.

Ainsi, la vérité du code est :

- `cv_url` seul n’est pas une preuve de CV exploitable ;
- le Diagnostic probable est A, avec possibilité de E si l’erreur d’extraction a été masquée dans le pipeline.

---

# 1. CHEMIN COMPLET À AUDITER

Trace précisément :

auth.user.id
→ candidat
→ données profil
→ CV
→ cv_url
→ cv_text
→ embedding_vector
→ hasCandidateCv()
→ hasAnalyzableCandidateCv()
→ getRecommendedJobs()
→ récupération des offres
→ filtrage des offres
→ calcul du score
→ seuil éventuel
→ liste finale des recommandations
→ CandidateDashboardPage
→ affichage « Aucune recommandation disponible ».

Identifie le fichier et la fonction responsables de chaque étape.

## Résultat

Le chemin complet est bien matérialisé dans les fichiers suivants :

- Profil candidat chargé avec les champs CV : [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- Définition du test “CV présent” / “CV analysable” : [src/features/candidates/api/cvApi.ts](src/features/candidates/api/cvApi.ts)
- Pipeline upload/parse/extract : [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
- Matching recommandé : [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)
- Affichage Dashboard : [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)
- RPC SQL de matching : [supabase/migrations/20260824010000_harden_candidate_job_matching.sql](supabase/migrations/20260824010000_harden_candidate_job_matching.sql)

### Étapes réelles du flux

1. auth.user.id
2. `getCurrentCandidate()` / `getCandidateProfileByUserId()`
3. lecture de `candidates.cv_url`, `cv_text`, `embedding_vector`
4. `hasCandidateCv()`
5. `hasAnalyzableCandidateCv()`
6. `getRecommendedJobs()`
7. récupération des offres publiées
8. appel RPC `match_job_offers_for_candidate`
9. filtrage et score
10. `return []` uniquement si candidat non analysable
11. Dashboard affiche “Aucune recommandation disponible”

---

# 2. VÉRIFIER LA PRÉSENCE RÉELLE DU CV

Vérifie comment le système détermine qu’un CV existe.

Vérifie notamment :

- candidates.cv_url
- candidates.cv_text
- candidates.embedding_vector
- éventuels autres champs utilisés par le pipeline CV
- Supabase Storage
- candidateDocuments
- états React
- cache navigateur éventuel

Détermine clairement :

CV présent ?
CV absent ?
CV URL présente ?
CV texte présent ?
Embedding présent ?

Ne considère pas qu’un CV est « analysable » uniquement parce que cv_url existe.

## Résultat

La définition de présence est dans [src/features/candidates/api/cvApi.ts](src/features/candidates/api/cvApi.ts).

Le code exact dit :

- `hasCandidateCv(candidate)` = `Boolean(candidate?.cv_url?.trim())`
- il ne vérifie ni `cv_text`, ni `embedding_vector`

Autrement dit :

- un CV est considéré “présent” uniquement si `cv_url` est non vide ;
- ce n’est pas un test d’analyse.

### Potentiel état réel du CV

La logique d’upload dans [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts) montre que `cv_url` peut rester présent même si l’extraction du texte a échoué.

Le flux concret :

- `uploadAndProcessCandidateCV()` téléverse le fichier dans Storage ;
- puis appelle `processCandidateCvUpload()` ;
- si l’extraction échoue, le catch fait :
  - `await updateCandidateCvText(candidateId, "", path ?? newCv.url);`

Cela signifie que le système peut avoir :

- CV URL présent ✅
- CV texte absent ❌
- embedding absent ❌

C’est exactement le scénario A.

---

# 3. VÉRIFIER L’ÉTAT D’ANALYSE DU CV

Vérifie exactement la fonction :

`hasAnalyzableCandidateCv()`

Détermine si elle exige :

cv_url
+
cv_text
+
embedding_vector

ou autre chose.

Vérifie également le pipeline :

upload CV
→ extraction texte
→ stockage cv_text
→ génération embedding
→ stockage embedding_vector
→ refresh candidat

Détermine si le CV peut être présent visuellement mais encore inutilisable pour le matching.

## Résultat

La fonction est dans [src/features/candidates/api/cvApi.ts](src/features/candidates/api/cvApi.ts).

Le code exact :

- `hasAnalyzableCandidateCv(candidate)` = `Boolean(hasCandidateCv(candidate) && candidate?.cv_text?.trim() && candidate?.embedding_vector)`

Donc elle exige bien :

- `cv_url`
- `cv_text` non vide
- `embedding_vector` non vide

### Pipeline réel du CV

Le pipeline est dans :

- [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)

Les fonctions concernées :

- `extractTextFromPdf(file)`
- `updateCandidateCvText(candidateId, cvText, cvUrl)`
- `processCandidateCvUpload(candidateId, file, cvUrl)`

Le code de `updateCandidateCvText` fait :

- `cv_text: normalizedText || null`
- `embedding_vector: normalizedText ? createEmbeddingVectorString(normalizedText) : null`
- `cv_last_updated_at: normalizedText ? new Date().toISOString() : null`

Conclusion :

- le CV peut être visible dans le Storage / avoir une URL ;
- mais tant que `cv_text` et `embedding_vector` ne sont pas correctement générés, il est inutilisable pour le matching.

Donc oui, le CV peut être présent visuellement mais non analysable.

---

# 4. AUDITER getRecommendedJobs()

Analyse intégralement :

`getRecommendedJobs()`

Détermine :

- quelles données candidat sont envoyées ;
- quelles données CV sont utilisées ;
- quelles offres sont récupérées ;
- si les offres sont filtrées avant le scoring ;
- si les offres doivent posséder un embedding ;
- si le candidat doit posséder un embedding ;
- si un RPC Supabase est utilisé ;
- si une API externe est appelée ;
- si une erreur peut être transformée en tableau vide ;
- si une exception est silencieusement ignorée.

IMPORTANT :

Distingue impérativement :

```text
return []
```

## Résultat

La fonction est dans [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts).

### 4.1 Données candidat envoyées

La fonction récupère le profil du candidat avec :

- `headline`
- `bio`
- `location_city`
- `location_country`
- `cv_text`
- `embedding_vector`

Puis il charge aussi :

- `candidate_skills`
- `candidate_experience`
- `candidate_education`
- `candidate_languages`
- `candidate_preferences`

### 4.2 Données CV utilisées

Il vérifie explicitement :

- `if (!hasAnalyzableCandidateCv(candidateData)) return [];`

Donc la décision de l’usage du CV est strictement basée sur :

- `cv_url`
- `cv_text`
- `embedding_vector`

### 4.3 Offres récupérées

La fonction exécute deux flux en parallèle :

- RPC : `supabase.rpc("match_job_offers_for_candidate", ...)`
- sélection SQL de job offers :
  - `.from("job_offers")`
  - `.eq("status", "published")`
  - `.or(...)` sur `publish_at` / `deadline` / `expires_at`
  - `.order("publish_at", { ascending: false })`
  - `.limit(1000)`

### 4.4 Filtrage avant scoring

Oui, les offres sont filtrées côté SQL avant le scoring puisque le code récupère uniquement les offres publiées et non expirées.

### 4.5 Embedding des offres et du candidat

Le candidat doit avoir `embedding_vector` non vide pour être considéré comme matchable.

Les offres doivent aussi avoir `embedding_vector` non vide, et le RPC SQL le vérifie avec :

- `job_offers.embedding_vector IS NOT NULL`

### 4.6 RPC / API externe

Le code appelle bien un RPC Supabase :

- `supabase.rpc("match_job_offers_for_candidate", {...})`

Il n’y a pas de logique d’API externe dans cette fonction.

### 4.7 Erreur transformée en tableau vide

Oui, mais pas de manière générique. La garde-fou explicite est :

- `if (!hasAnalyzableCandidateCv(candidateData)) return [];`

Cela retourne un tableau vide sans erreur, si le candidat n’a pas de CV analysable.

### 4.8 Exception silencieusement ignorée

Le code ne “silencie” pas une exception en sa propre logique ; plutôt il journalise les warnings :

- si RPC error : `console.warn("RPC matching signal unavailable; using structured scoring only:", rpcError.message);`

Puis il continue.

La vraie “silence” se trouve dans la logique de garde-fou : un candidat non analysable est simplement rejeté sans message explicite dans le matching, ce qui produit un tableau vide tout en empêchant l’affichage des recommandations.

---

# 5. AUDIT SQL DE MATCHING

Le RPC important est :

- [supabase/migrations/20260824010000_harden_candidate_job_matching.sql](supabase/migrations/20260824010000_harden_candidate_job_matching.sql)

Le code SQL dit :

```sql
WITH cand AS (
  SELECT embedding_vector
  FROM public.candidates
  WHERE id = candidate_id
    AND embedding_vector IS NOT NULL
), offers AS (
  SELECT job_offers.*,
    1 - (cand.embedding_vector <=> job_offers.embedding_vector) AS similarity
  FROM public.job_offers, cand
  WHERE job_offers.embedding_vector IS NOT NULL
    AND job_offers.status = 'published'
    AND (job_offers.publish_at IS NULL OR job_offers.publish_at <= NOW())
    AND (job_offers.deadline IS NULL OR job_offers.deadline >= NOW())
    AND (job_offers.expires_at IS NULL OR job_offers.expires_at >= NOW())
)
SELECT ...
FROM offers o
WHERE o.similarity >= match_threshold
ORDER BY o.similarity DESC
LIMIT match_count OFFSET match_offset;
```

## Conclusion SQL

Le RPC exige :

- le candidat a un `embedding_vector` non nul ;
- les offres ont un `embedding_vector` non nul ;
- les offres sont publiées et non expirées ;

Il ne retourne pas “liste vide parce qu’il n’y a pas d’offres” sans vérification préalable. Le point important est que le code JS du client a une validation encore plus stricte avant même le scoring : `hasAnalyzableCandidateCv(candidateData)`.

---

# 6. VÉRIFICATION DU DASHBOARD

Le Dashboard est dans [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx).

Il fait ceci :

- `const hasCvUploaded = hasCandidateCv(profile);`
- `const hasAnalyzableCv = hasAnalyzableCandidateCv(profile);`
- `if (!hasCvUploaded || !hasAnalyzableCv) { setRecommendedJobs([]); return; }`

Ensuite, dans le JSX :

- si `profile?.id && !hasCandidateCv(profile)` → message “Vous n’avez pas encore téléversé de CV…”
- sinon → message “Aucune recommandation disponible pour le moment.”

## Conclusion

Le dashboard fonctionne comme un reflet du garde-fou du backend/front. Il ne crée pas le problème ; il affiche le résultat de données non analysables.

---

# 7. RÉPONSE AUX SCÉNARIOS

## A. CV présent mais non analysable
Oui. C’est le scénario principal disponible dans le code.

## B. CV présent et analysable mais aucune offre ne correspond suffisamment
Non démontré par ce flux. Le code démontre un scénario de refus plus tôt : CV non analysable.

## C. matching retourne une liste vide à cause d’un problème technique
Pas comme cause principale. Le code recourt à un warning RPC mais ne transforme pas un bug technique en liste vide sans cette condition préalable.

## D. CV/profil n’est pas correctement transmis au matching
Le profil est bien transmis. La donnée exploitable est absente ou invalide, pas le profil lui-même.

## E. une erreur est masquée et transformée en « aucune recommandation disponible »
Oui, c’est plausible et cohérent avec le code lorsque l’extraction PDF échoue et que `cv_text` / `embedding_vector` sont nettoyés.

## F. le problème vient uniquement de l’affichage du Dashboard
Non. Le problème est dans le pipeline CV / matching. Le dashboard n’est qu’un reflecteur.

---

# 8. CONCLUSION FINALE

Le système n’est pas simplement “sans offre”. Il est configuré pour refuser les recommandations tant que le candidat n’a pas un CV analysable.

Le point clé est :

- `cv_url` seul n’est pas suffisant ;
- `cv_text` et `embedding_vector` sont requis ;
- si l’extraction échoue ou si le pipeline ne remplit pas ces champs, le candidat est traité comme “sans CV analysable” ;
- puis le dashboard affiche le message générique d’absence de recommandations.

Donc la vérification la plus solide est :

- le problème n’est pas “aucune offre correspondante” ;
- le problème est “le CV n’a pas été transformé en données analysables” et le dashboard l’exprime sous la forme générique de liste vide.

Cette conclusion correspond au scénario A, avec un E une erreur masquée dans le cycle d’upload/extraction, et un D partiel sur la transmission de données exploitables dans le profil.
