# Validation JobsPage

## 1. Verdict global

⚠️ Fonctionnelle avec limites

La page compile et les fonctions principales sont conservées, mais la validation relève des limites fonctionnelles et un écart d'ordre dans le DOM. Le verdict reste conditionné par la disponibilité réelle du schéma Supabase distant.

## 2. Fonctionnalités validées

- La recherche principale est la première zone visible et reste accessible aux visiteurs et candidats.
- Les filtres sont regroupés sous « Critères de recherche » et restent repliables ; le champ salaire minimum a été retiré selon la demande produit.
- Les actions candidat sont conditionnelles à `isCandidateShell`.
- Les résultats sont affichés sous « Offres disponibles », avant « Mes recherches ».
- Le nombre de résultats est masqué sur la liste initiale et apparaît après une recherche ou un filtre ; le tri courant reste visible.
- Recherche textuelle, recherche naturelle, contrat, localisation, entreprise, domaine, tri et réinitialisation conservent leurs handlers.
- La pagination des résultats reste présente.
- Les offres restent consultables et la candidature visiteur déclenche la demande de connexion.
- Préférences, proximité, recommandations, recherches sauvegardées et historique restent accessibles au candidat.
- La restauration applique `applyCriteria` sans enregistrer une nouvelle recherche.
- Les recommandations sont dans un `Sheet` séparé et ne se confondent pas avec les résultats.
- Les états de chargement et d'absence de résultats sont conservés.

## 3. Problèmes détectés

### P1 — Filtres locaux limités au lot chargé

- Fichier : `src/pages/public/JobsPage.tsx`, `src/features/jobs/hooks/useJobs.ts`.
- Fonctionnalité : domaine, anciens critères de salaire, proximité et tri.
- Le serveur charge au maximum 50 offres dans `jobService`, puis domaine, anciens critères de salaire, proximité et tri sont appliqués côté client. Ces fonctions ne travaillent donc pas forcément sur l'ensemble des offres disponibles.
- Ce comportement existait avant la refonte et n'a pas été modifié.

### P1 — Ordre DOM différent de l'ordre cible

- Fichier : `src/pages/public/JobsPage.tsx`.
- Les actions candidat sont rendues avant le panneau « Critères de recherche », alors que l'ordre demandé était Recherche → Critères → Actions candidat. Il s'agit d'un écart de hiérarchie structurelle, sans casse fonctionnelle.

### P2 — Deux points de soumission

- Fichier : `src/pages/public/JobsPage.tsx`.
- Le bouton de recherche principal et celui du panneau de filtres appellent le même handler. Ils restent fonctionnels et ont été conservés pour préserver l'accès à la recherche.

### P2 — Vérification navigateur non automatisée

- La validation statique et le build sont réussis.
- Aucun test visuel automatisé desktop/mobile n'a été exécuté dans cette session ; les comportements responsive sont donc vérifiés par les classes et la structure du code.

## 4. Limites fonctionnelles

- La proximité utilise la ville/pays du profil et non une distance géographique réelle.
- `mobility_radius_km` sert seulement de garde positive et `mobility_modes` est principalement consulté pour le télétravail.
- « Utiliser mes préférences » reprend le headline, la ville, le premier contrat et le salaire minimum stocké, mais pas work_types, salary_max, seniority, mobilité, disponibilité ni alertes. Le salaire n'est plus saisissable dans l'UI.
- Domaine et les anciens critères de salaire analysent les offres déjà chargées.
- La pertinence dépend du CV et des recommandations IA ; elle n'est pas un moteur de recherche indépendant.
- `Ma prochaine action` reste une fonctionnalité du dashboard et n'est pas dupliquée dans `/jobs`.

## 5. Base de données

- `job_offers` est appelé par `jobService` via `useJobs`.
- `candidate_preferences` est chargé par `preferencesApi` pour le candidat courant.
- `candidate_saved_searches` et `candidate_search_history` sont appelées par `searchesApi` avec l'identifiant du profil courant.
- Les migrations locales créent les tables de recherche et leurs policies RLS.
- Les logs fournis montrent `400` sur la sélection étendue de `candidate_preferences` et `404` sur les deux tables de recherche. Cela indique un schéma distant non aligné ou des migrations non déployées ; la base distante n'a pas été interrogée directement.
- Le code possède un repli vers l'ancien schéma pour `candidate_preferences`, mais les tables de recherche n'ont pas de repli équivalent.

## 6. Build

`npm run build:vite` : ✅ réussi.

Les warnings signalés sont préexistants : `eval` dans `pdfjs-dist` et chunks dépassant 500 kB. Aucune erreur liée à la refonte n'a été détectée.

## 7. Corrections recommandées

- **P0** : aucune correction bloquante identifiée.
- **P1** : traiter séparément la couverture serveur/pagination des filtres locaux et de la proximité.
- **P2** : ajouter des tests navigateur desktop/mobile et décider ultérieurement s'il faut réduire la concurrence des boutons de recherche.
