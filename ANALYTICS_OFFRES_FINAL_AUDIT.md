# Analytics-Offres — Audit final

## État général
PASS AVEC CORRECTIONS

## Architecture
- La route `/admin/analytics-offres` existe dans [src/App.tsx](src/App.tsx).
- Le menu admin contient l’entrée Analytics-Offres dans [src/components/admin/AdminSidebar.tsx](src/components/admin/AdminSidebar.tsx).
- L’active view est gérée dans [src/pages/admin/AdminPage.tsx](src/pages/admin/AdminPage.tsx).
- La page container est [src/pages/admin/AdminAnalyticsOffresPage.tsx](src/pages/admin/AdminAnalyticsOffresPage.tsx).
- Le hook [src/features/admin/hooks/useAnalyticsOffres.ts](src/features/admin/hooks/useAnalyticsOffres.ts) charge les KPI, tendances et tableaux.
- L’API [src/features/admin/api/analyticsApi.ts](src/features/admin/api/analyticsApi.ts) interroge le schéma Supabase réel.
- La structure SQL est présente dans [supabase/migrations/20260816090000_create_analytics_offres_views.sql](supabase/migrations/20260816090000_create_analytics_offres_views.sql), [supabase/migrations/20260816091500_create_analytics_offres_functions.sql](supabase/migrations/20260816091500_create_analytics_offres_functions.sql), [supabase/migrations/20260816093000_create_analytics_offres_indexes.sql](supabase/migrations/20260816093000_create_analytics_offres_indexes.sql).
- Le module est cohérent au niveau architecture, mais il n’a pas été validé en exécution finale sur une base réelle dans cet environnement.

## Sources de données
- Source principale : `public.job_applications`.
- Source offres : `public.job_offers`.
- Source candidats : `public.candidates`.
- Source rôles : `public.user_roles`.
- Relations validées :
  - `job_applications.candidate_id -> candidates.id`
  - `job_applications.job_offer_id -> job_offers.id`
- Les statistiques ne reposent pas sur des comptes manuels ni sur des mock data.
- Les KPI sont calculés à partir de lignes réelles et de relations réelles.

## RPC
- RPC SQL couvertes : `analytics_offres_kpis`, `analytics_offres_evolution`, `analytics_offres_by_offer`, `analytics_offres_by_company`, `analytics_offres_by_contract`, `analytics_offres_by_location`, `analytics_offres_status_breakdown`, `analytics_offres_offer_performance`, `analytics_offres_offers_without_applications`, `analytics_offres_top_companies`.
- Les fonctions utilisent un schéma source réel et appliquent des filtres sur `applied_at`, `job_offer_id`, `company`, `contract_type`, `location_city`, `status`.
- Elles sont sécurisées avec `SECURITY DEFINER` et vérification de rôle via `public.has_role`.
- Les objets retournés sont bien structurés (KPI, séries, distributions, tableaux).
- La validation SQL réelle n’a pas pu être exécutée ici, car `psql` n’est pas disponible dans cet environnement.

## Filtres
- Frontend : date depuis / date jusqu’au, entreprise, contrat, ville, statut, offre.
- Les filtres sont passés à la logique frontend et aux appels API.
- Anomalie détectée : `locationCountry` est présent dans le type et dans l’UI mais n’est pas réellement exploité dans la couche SQL / RPC.
- Anomalie détectée : aucun preset temporel “Aujourd’hui / 7 jours / Semaine / Mois / Trimestre / Année” n’est implémenté. La page ne propose qu’une paire de champs date.
- Le filtrage “offre” est présent côté frontend, mais il n’est pas un filtre unique de période automatisée ; il doit être vérifié dans les RPC réelles lors d’un test de base.

## Sécurité
- Frontend : route protégée par `ProtectedRoute` avec rôles admin/super_admin et permission `dashboard.admin` dans [src/App.tsx](src/App.tsx).
- SQL : rôles vérifiés à l’aide de `public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')`.
- `search_path` est fixé à `public, pg_catalog` dans les RPC.
- Aucun accès public n’a été ajouté aux fonctions analytics.
- Le mécanisme de sécurité est cohérent, mais sans exécution réelle dans Supabase, il reste une validation d’intégration à faire sur la base cible.

## Performance
- Les index ajoutés dans [supabase/migrations/20260816093000_create_analytics_offres_indexes.sql](supabase/migrations/20260816093000_create_analytics_offres_indexes.sql) sont ciblés sur les colonnes réellement utilisées : `job_offer_id`, `candidate_id`, `status`, `applied_at`, `company`, `contract_type`, `location_city`, `publish_at`, `expires_at`.
- L’architecture est correcte et ne repose pas sur une materialized view inutile.
- L’usage de vues et de RPC reste compatible avec la taille du projet et la logique actuelle.
- Aucune sur-optimisation ni duplication de données n’a été introduite.

## Frontend
- La page admin connecte les KPI et graphiques à [src/features/admin/hooks/useAnalyticsOffres.ts](src/features/admin/hooks/useAnalyticsOffres.ts).
- Le composant principal charge les séries et les détails d’offre.
- Les graphiques affichent les données si elles existent ; la gestion des états vides est partiellement présente mais pas systématiquement garantie pour tous les cas.
- L’interface affiche bien les composants attendus : KPI, chart tendance, chart entreprises, chart contrats, chart localisations, chart statut, tableau offres.
- Le flux complet est présent : Frontend → hook → API → tables réelles → rendu.
- Il reste néanmoins à vérifier complètement l’affichage réel sur une base non vide et les cas “vide / erreur / sans données”.

## TypeScript
- Commande exécutée : `npx tsc --noEmit`.
- Résultat constaté : échec global du projet.
- Erreurs identifiées dans des fichiers hors Analytics-Offres, notamment :
  - [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx)
  - [src/pages/public/JobsPage.tsx](src/pages/public/JobsPage.tsx)
  - [src/pages/public/LegalDocumentsPage.tsx](src/pages/public/LegalDocumentsPage.tsx)
- Ces erreurs ne concernent pas directement le module Analytics-Offres, mais elles empêchent une validation finale globale du projet.
- Le module Analytics-Offres n’est donc pas “livrable globalement” tant que le projet TypeScript reste rouge.

## Migrations SQL
- Les fichiers sont présents et bien nommés selon la convention de migration.
- Ils ne créent pas de tables de duplication métier inutile.
- Ils ne suppriment pas de données existantes.
- Ils utilisent les tables existantes et les colonnes réellement présentes dans le schéma : `job_applications`, `job_offers`, `candidates`, `user_roles`.
- Le point de vigilance restant : exécution réelle sur la base Supabase non testée ici, faute d’outils SQL disponibles.

## Anomalies
1. `locationCountry` est présent dans le modèle frontend et dans certains filtres mais n’est pas appliqué de façon fiable au niveau SQL / RPC.
2. Les presets historiques (aujourd’hui, 7 jours, semaine, mois, trimestre, année) ne sont pas implantés dans l’UI.
3. Aucune validation SQL réelle sur la base cible n’a été faite dans cet environnement.
4. Le projet global TypeScript ne passe pas, ce qui bloque la validation finale de livraison.
5. Certains KPI basés sur “offres actives / expirées” sont calculables, mais ils dépendent de la cohérence des statuts et dates de publication/expiration dans la base. Aucune donnée ne prouve ici que cette cohérence est totalement conforme sur l’instance réelle.

## Corrections nécessaires
- Vérifier et compléter le mapping exact de tous les filtres côté SQL / RPC, notamment `locationCountry`.
- Ajouter les presets de période (today / 7d / week / month / quarter / year) si le besoin métier est exigé.
- Exécuter les migrations contre la vraie base Supabase et valider les RPC en production-like.
- Corriger le projet TypeScript global avant validation de livraison.
- Vérifier complètement le comportement sur données réelles pour les cas “vide”, “sans candidatures”, “offre expirée”, “filtre par statut”, “date personnalisée”.

## Données manquantes
- Secteur / branche : non présent comme donnée canonique dans les tables actuelles.
- Vues d’offres : non démontrées comme source fiable dans le schéma courant.
- Taux offre → candidature : calculable uniquement si l’on a une vraie source d’exposition / vues / impression ; absent dans le schéma actuel de base.
- Délai publication → première candidature : techniquement possible avec `publish_at` + `applied_at`, mais il faut vérifier que la base contient les valeurs de publication de façon fiable.
- Funnel candidature → recrutement : pas disponible sans tables de recrutement ou étapes de pipeline supplémentaires.
- Ces éléments ne sont pas des anomalies du module, mais des limites de modèle de données actuelles.

## Verdict final
- Le module Analytics-Offres est bien structuré, connecté de bout en bout au niveau code, et repose sur des données réelles Supabase.
- L’architecture SQL et frontend est globalement cohérente.
- Le module n’est pas encore prêt pour une validation finale de livraison, car :
  - des filtres métier restent incomplets,
  - la validation SQL réelle n’a pas été exécutée sur la base cible,
  - le projet TypeScript global est rouge,
  - la validation de gestion de données réelles et de cas limites n’a pas été menée sur l’instance finale.
- Conclusion stricte : le module est fonctionnellement bien orienté, mais il nécessite encore des corrections avant d’être considéré terminé.
