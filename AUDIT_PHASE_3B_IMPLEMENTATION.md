# Audit phase 3B — finalisation des fonctionnalités restantes

## Scope

Cette passe est limitée aux éléments partiels identifiés par l’audit, sans réécrire les fonctionnalités déjà validées comme complètes.

## Implémentations ajoutées

- Support complet des champs de mobilité dans les préférences candidat : `mobility_radius_km` et `mobility_modes`.
- Persistance et lecture de ces valeurs via l’API `candidate_preferences`.
- Ajout de l’UI de configuration de la mobilité dans le bloc préférences candidat avec rayon et modes.
- Ajout du suivi du CV frais : `cv_last_updated_at` mis à jour lors de chaque extraction de CV.
- Détection d’un CV ancien dans le tableau de bord pour afficher une action ciblée “Mettre à jour votre CV”.
- Amélioration du filtre “près de moi” : la logique utilise désormais le rayon de mobilité et les modes de travail lorsqu’un candidat a une localisation connue, sans modifier la logique de recherche existante pour les cas standards.

## Fichiers modifiés

- `src/features/candidates/types/preference.ts`
- `src/features/candidates/types/candidate.ts`
- `src/features/candidates/api/preferencesApi.ts`
- `src/features/candidates/api/profileApi.ts`
- `src/features/profile/components/sections/PreferencesSection.tsx`
- `src/pages/candidate/CandidateDashboardPage.tsx`
- `src/pages/public/JobsPage.tsx`
- `src/services/aiMatchingService.ts`
- `src/integrations/supabase/types.ts`

## Schéma requis

Le script SQL nécessaire a aussi été ajouté dans le dépôt pour appliquer les colonnes manquantes côté Supabase :

- `supabase/migrations/20260822100000_required_candidate_mobility_and_cv_tracking.sql`

## Limites conservées

- Les fonctionnalités déjà auditées comme complètes n’ont pas été réécrites.
- La logique géographique reste un filtrage pragmatique basé sur localisation + rayon, sans introduire de nouvelle table ni de dépendance cartographique non existante.
- Les recommandations IA préexistantes et les notifications existantes ont été conservées telles quelles.

## Vérification

- Vérification de build avec `npm run build:vite` après la finalisation des changements.