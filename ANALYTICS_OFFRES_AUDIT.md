# AUDIT — MODULE « ANALYTICS-OFFRES »

## 1. ARCHITECTURE ACTUELLE

**Admin Dashboard Location:**
- Route: `/admin`
- Sidebar: [src/components/admin/AdminSidebar.tsx](src/components/admin/AdminSidebar.tsx)
- Page: [src/pages/admin/AdminPage.tsx](src/pages/admin/AdminPage.tsx)
- Home: [src/pages/admin/AdminHomePage.tsx](src/pages/admin/AdminHomePage.tsx)

**Sidebar Menu Items (AdminView type):**
- dashboard, jobs, blog, candidates, guides, notifications, team, seo, privacy, legal, cgu, faq

**New Module Location:**
- Route: `/admin/analytics-offres`
- Add to AdminView: `"analytics-offres"`
- Page: `src/pages/admin/AdminAnalyticsOffresPage.tsx`

---

## 2. TABLES UTILISÉES & RELATIONS

### Core Tables:

**job_offers** ← Primary table
- Columns: id, slug, title, company, company_logo, location_city, location_country, contract_type, salary, status, publish_at, created_at, updated_at, deadline, expires_at, description, requirements, tags, views_count, embedding_vector, application_email, application_whatsapp, external_link, featured_until
- Status Enum: draft | published | archived | expired
- Contract Types: cdi | cdd | stage | freelance | consultance | temps_partiel | interim
- Indexes: idx_job_offers_status, idx_job_offers_slug

**job_applications** ← Candidatures
- Columns: id, candidate_id, job_offer_id, status, cover_letter, subject, applied_at, updated_at
- FK: candidates(id), job_offers(id)
- Status Enum: submitted | reviewed | shortlisted | rejected | accepted | withdrawn
- UNIQUE: (candidate_id, job_offer_id)
- Indexes: idx_job_applications_candidate_id, idx_job_applications_job_offer_id, idx_job_applications_status, idx_job_applications_applied_at

**candidates** ← Profils candidats
- Columns: id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, status, created_at, updated_at, cv_url, cv_text, embedding_vector
- Status Enum: active | inactive | archived
- Indexes: idx_candidates_user_id, idx_candidates_email, idx_candidates_status

**candidate_experience, candidate_education, candidate_skills, candidate_languages**
- Linked by: candidate_id

---

## 3. STATISTIQUES DISPONIBLES IMMÉDIATEMENT

### A. KPI GLOBAUX
- ✅ Total candidatures: `COUNT(*)` from job_applications
- ✅ Candidats uniques: `COUNT(DISTINCT candidate_id)` from job_applications
- ✅ Offres actives: `COUNT(*) WHERE status='published' AND (expires_at IS NULL OR expires_at > NOW())`
- ✅ Offres total: `COUNT(*)` from job_offers
- ✅ Offres sans candidature: `COUNT(DISTINCT id)` WHERE id NOT IN (SELECT DISTINCT job_offer_id)
- ✅ Moyenne cand/offre: `AVG(app_count)` (computed)
- ✅ Offres expirées: `COUNT(*) WHERE status='expired'`

### B. CANDIDATURES PAR DIMENSION
- ✅ Par offre: `COUNT(*) GROUP BY job_offer_id` + JOIN job_offers(title, company)
- ✅ Par entreprise: `COUNT(*) GROUP BY company` (from job_offers)
- ✅ Par type contrat: `COUNT(*) GROUP BY contract_type`
- ✅ Par statut candidature: `COUNT(*) GROUP BY application_status`
- ✅ Par localisation: `COUNT(*) GROUP BY location_city` or location_country
- ✅ Par période: `COUNT(*) GROUP BY DATE_TRUNC('day'|'week'|'month', applied_at)`

### C. PERFORMANCE OFFRES
- ✅ Offres par views: Utiliser `job_offers.views_count`
- ✅ Ratio candidatures/views: `COUNT(app) / views_count`
- ✅ Offres populaires: ORDER BY views_count DESC
- ✅ Offres inactives: `WHERE views_count = 0`

### D. PROFILS CANDIDATS
- ✅ Par localisation: `candidates.location_city, location_country`
- ✅ Candidats actifs: `COUNT(*) WHERE status='active'`
- ✅ Candidats archivés: `COUNT(*) WHERE status='archived'`

### E. DÉLAIS & CHRONOLOGIE
- ✅ Durée moyenne avant 1ère candidature: `DATE_TRUNC` analysis
- ✅ Durée publication → expiration offre: publish_at vs expires_at vs deadline
- ✅ Offres bientôt expirées: WHERE expires_at BETWEEN NOW() AND NOW() + interval '7 days'

---

## 4. STATISTIQUES IMPOSSIBLES ACTUELLEMENT

### Données manquantes:
- ❌ **Sources candidature**: Aucune colonne source dans job_applications
- ❌ **Délais de traitement**: Pas de timestamps intermédiaires (submitted → reviewed → accepted)
- ❌ **Taux conversion**: Pas de colonne "hired" ou "matched" dans job_applications
- ❌ **Motif de rejet**: Pas de free_text "rejection_reason"
- ❌ **Score d'appariement**: Pas de colonne matching_score dans job_applications
- ❌ **Secteur activité**: Pas de colonne sector/industry dans job_offers
- ❌ **Salaire réel accepté**: Pas de hired_salary vs posted_salary
- ❌ **Temps d'embauche**: Pas de hired_date
- ❌ **Feedback candidat**: Pas de table feedback/rating
- ❌ **Désistement**: Pas de distinction withdrawn vs rejected par candidat

---

## 5. FILTRES POSSIBLES

### Implémentables:
- ✅ Période: `applied_at >= ? AND applied_at <= ?`
- ✅ Entreprise: `job_offers.company = ?`
- ✅ Offre: `job_offer_id = ?`
- ✅ Type contrat: `contract_type IN (?)`
- ✅ Localisation: `location_city = ? OR location_country = ?`
- ✅ Statut candidature: `application_status IN (?)`
- ✅ Statut offre: `job_offers.status IN (?)`
- ✅ Ordre: `views_count, created_at, applied_count`

### Combinaisons:
- ✅ Tous les filtres sont combinables en WHERE AND

---

## 6. EXPORTS DISPONIBLES

### Actuellement existants:
- ❌ Aucun système d'export en place dans l'admin

### À créer:
- 📋 CSV (utiliser useJobs hook pattern + papaparse)
- 📋 JSON (réponse API native)
- 📋 PDF (utiliser pdfkit ou similar)
- 📋 Excel (utiliser xlsx ou similar)

---

## 7. SÉCURITÉ

### Authentication:
- ✅ Route protégée par `/admin` + PermissionGuard
- ✅ Permission: `dashboard.admin`
- ✅ RLS Policies: Staff (is_staff=true) can read all data

### Authorization:
- ✅ Vérifier `public.is_staff(auth.uid())` pour accès
- ✅ Utiliser context AdminContext pour admin_id
- ✅ Log les accès à /admin/analytics-offres

---

## 8. ARCHITECTURE RECOMMANDÉE

```
AdminAnalyticsOffresPage
├── KPI Cards (5-8 métriques)
├── Date Range Picker
├── Filters Panel (entreprise, contrat, statut)
├── Period Selector (jour/semaine/mois)
├── Main Tabs:
│   ├── Évolution (line chart)
│   ├── Répartition (pie/bar chart)
│   ├── Performance Offres (table + sort)
│   ├── Profils Candidats (stats + breakdown)
│   ├── Détail Candidatures (datatable)
│   └── Exports
├── Export Buttons (CSV, JSON, PDF)
└── Refresh + Last Updated
```

---

## 9. FICHIERS À CRÉER

### Pages:
1. `src/pages/admin/AdminAnalyticsOffresPage.tsx` ← Main page
2. `src/pages/admin/AdminAnalyticsOffresPage.tsx` export in [src/pages/admin/index.ts](src/pages/admin/index.ts)

### Components:
1. `src/components/admin/analytics/AnalyticsKPICards.tsx`
2. `src/components/admin/analytics/AnalyticsFilters.tsx`
3. `src/components/admin/analytics/AnalyticsEvolutionChart.tsx`
4. `src/components/admin/analytics/AnalyticsRepartitionChart.tsx`
5. `src/components/admin/analytics/AnalyticsOffersTable.tsx`
6. `src/components/admin/analytics/AnalyticsProfilesCard.tsx`
7. `src/components/admin/analytics/AnalyticsDetailTable.tsx`

### APIs/Services:
1. `src/features/admin/api/analyticsApi.ts` ← All aggregation queries
2. `src/features/admin/hooks/useAnalyticsOffres.ts` ← Main data hook

### Types:
1. `src/features/admin/types/analytics.ts` ← TypeScript types

---

## 10. FICHIERS À MODIFIER

### Routing:
1. [src/pages/admin/AdminPage.tsx](src/pages/admin/AdminPage.tsx)
   - Add "analytics-offres" to AdminView type
   - Add path matching in useEffect

2. [src/components/admin/AdminSidebar.tsx](src/components/admin/AdminSidebar.tsx)
   - Add navItem: { id: "analytics-offres", label: "Analytics-Offres", icon: BarChart3 }

3. [src/pages/admin/index.ts](src/pages/admin/index.ts)
   - Export AdminAnalyticsOffresPage

### i18n:
1. `src/i18n/translations.ts`
   - Add keys for analytics labels, menu items, tooltips

---

## 11. REQUÊTES SUPABASE CLÉS

### Statistiques globales:
```sql
-- Total candidatures
SELECT COUNT(*) as total_applications FROM job_applications;

-- Candidats uniques
SELECT COUNT(DISTINCT candidate_id) as unique_candidates FROM job_applications;

-- Offres sans candidature
SELECT COUNT(*) as offers_without_apps FROM job_offers 
WHERE id NOT IN (SELECT DISTINCT job_offer_id FROM job_applications);

-- Applications par statut
SELECT status, COUNT(*) as count FROM job_applications 
GROUP BY status;
```

### Avec jointure offres:
```sql
-- Candidatures par offre
SELECT 
  jo.id, jo.title, jo.company, jo.contract_type,
  COUNT(ja.id) as app_count,
  COUNT(DISTINCT ja.candidate_id) as unique_candidates
FROM job_offers jo
LEFT JOIN job_applications ja ON jo.id = ja.job_offer_id
GROUP BY jo.id
ORDER BY app_count DESC;
```

### Évolution temporelle:
```sql
-- Candidatures par jour
SELECT 
  DATE_TRUNC('day', applied_at) as day,
  COUNT(*) as count
FROM job_applications
GROUP BY DATE_TRUNC('day', applied_at)
ORDER BY day DESC;
```

---

## 12. PERFORMANCES & PAGINATION

### Recommendations:
- Utiliser `count: "exact"` uniquement pour KPI
- Paginer la table détail (limit 20-50 rows)
- Cacher les détails par défaut
- Cache côté client (React Query / SWR): 5-10 min
- Pas de RPC initially (requêtes directes suffisent)

---

## 13. RISQUES & LIMITATIONS

⚠️ **Pas de données de secteur/industrie** → Analytics par secteur impossible
⚠️ **Pas de tracking sources** → Impossible tracer origine candidatures
⚠️ **Views count peut ne pas être rempli** → Fiabilité métrique douteuse
⚠️ **Pas d'horodatage transition statut** → Délais approximatifs
⚠️ **Pas de hired tracking** → Taux conversion impossible
⚠️ **Permissions admin sans granularité** → Tous les admins voient tout

---

## PLAN IMPLÉMENTATION

**Phase 1 - Core (2-3h):**
- Créer page + sidebar entry
- Implémenter KPI cards
- Ajouter date range picker
- Requêtes Supabase basiques

**Phase 2 - Charts (2-3h):**
- Evolution timeline chart
- Repartition pie/bar charts
- Performance table
- Filtres dynamiques

**Phase 3 - Details (1-2h):**
- Detail datatable
- Export buttons (CSV first)
- Polish & i18n

**Phase 4 - Polish (1h):**
- Tests, responsiveness
- Error handling
- Loading states

