# Analytics-Offres — architecture SQL

## Sources utilisées
- public.job_applications : candidatures réelles
- public.job_offers : offres réellement publiées / actives / expirées
- public.candidates : candidats réels
- public.user_roles : rôles admin existants

## Relations
- job_applications.job_offer_id -> job_offers.id
- job_applications.candidate_id -> candidates.id
- job_offers.company -> libellé d’entreprise (non normalisé)
- job_offers.contract_type -> enum public.contract_type
- job_offers.status -> enum public.job_status
- job_applications.status -> enum public.application_status

## Vues créées
- public.analytics_offres_application_fact
- public.analytics_offres_offer_fact

## RPC créées
- public.analytics_offres_kpis
- public.analytics_offres_evolution
- public.analytics_offres_by_offer
- public.analytics_offres_by_company
- public.analytics_offres_by_contract
- public.analytics_offres_by_location
- public.analytics_offres_status_breakdown
- public.analytics_offres_offer_performance
- public.analytics_offres_offers_without_applications
- public.analytics_offres_top_companies

## Index créés
- idx_job_applications_offer_status_applied_at
- idx_job_applications_candidate_applied_at
- idx_job_offers_company_status_created_at
- idx_job_offers_contract_status_publish_at
- idx_job_offers_location_status_publish_at
- idx_job_offers_publish_at_expires_at
- idx_job_applications_applied_at_status

## RLS / sécurité
- Les fonctions sont `SECURITY DEFINER`.
- L’accès est limité aux rôles existants `super_admin` et `admin` via `public.has_role`.
- `search_path` est fixé à `public, pg_catalog` pour éviter les surprises liées au `search_path`.

## Filtres disponibles
- date début
- date fin
- entreprise
- offre (via job_offer_id dans certaines requêtes)
- contrat
- localisation
- statut de candidature

## Statistiques disponibles
- candidatures totales
- candidats uniques
- moyenne candidature/candidat
- évolution temporelle
- candidatures par offre
- candidatures par entreprise
- candidatures par type de contrat
- candidatures par localisation
- statuts de candidature
- offres sans candidature
- offres les plus performantes

## Statistiques non calculables sans données supplémentaires
- secteur / branche : pas de colonne secteur dans les tables actuelles
- taux de conversion offre → candidature : besoin de données d’exposition / vues ou de lecture du funnel d’offre
- délai moyen entre publication et première candidature : possible si la publication est fiable, mais non encore modélisé comme KPI central
- profils candidats avancés : besoin de données plus détaillées sur les parcours candidats et segments démographiques

## Performance
- Les agrégations sont calculées sur les tables sources existantes.
- Une materialized view n’a pas été créée car les volumes ne justifient pas un cache dédié et les données restent traçables.
- Les index sont limités aux colonnes réellement utilisées par les filtres et agrégations SQL.

## Tableau de correspondance

| Indicateur | Source SQL | Fonction/RPC | Filtres disponibles |
| --- | --- | --- | --- |
| Total candidatures | job_applications | analytics_offres_kpis | date, entreprise, contrat, localisation, statut |
| Candidats uniques | job_applications | analytics_offres_kpis | date, entreprise, contrat, localisation, statut |
| Évolution temporelle | job_applications | analytics_offres_evolution | date, entreprise, contrat, localisation, statut, période |
| Candidatures par offre | job_applications + job_offers | analytics_offres_by_offer | date, entreprise, contrat, localisation, statut |
| Candidatures par entreprise | job_applications + job_offers | analytics_offres_by_company | date, entreprise, contrat, localisation, statut |
| Candidatures par type de contrat | job_applications + job_offers | analytics_offres_by_contract | date, entreprise, localisation, statut |
| Candidatures par localisation | job_applications + job_offers | analytics_offres_by_location | date, entreprise, contrat, statut |
| Répartition statut | job_applications | analytics_offres_status_breakdown | date, entreprise, contrat, localisation, statut |
| Offres sans candidature | job_offers + job_applications | analytics_offres_offers_without_applications | entreprise, contrat, localisation |
| Entreprises attractives | job_applications + job_offers | analytics_offres_top_companies | date, entreprise, contrat, localisation, statut |

## Conclusion
Le schéma Analytics-Offres s’appuie sur les données réelles sans duplication inutile. Les statistiques sont calculées directement depuis les sources de vérité, avec des RPC sécurisées et des index ciblés.
