# 1. État avant nettoyage

Le domaine candidat présentait plusieurs doublons réels sans avoir deux dashboards routés actifs simultanément.

Doublons identifiés :

- Hooks de données métier du candidat dupliqués entre `src/features/candidates/hooks/` et `src/features/profile/hooks/` :
  - `useCandidateEducation`
  - `useCandidateSkills`
  - `useCandidateLanguages`
  - `useCandidatePreferences`
  - `useCandidateDocuments`

- Wrapper / façade historique :
  - `src/hooks/useCandidate.ts` exportait simplement le hook principal depuis `src/features/candidates/hooks/useCandidate.ts`

- Composants UI de sidebar/topbar alternatifs :
  - `src/components/candidate/CandidateSidebar.tsx`
  - `src/components/candidate/CandidateTopbar.tsx`
  - `src/features/candidates/components/profile/CandidateSidebar.tsx`
  - `src/features/candidates/components/profile/CandidateTopbar.tsx`

- Pages / composants non routés et non montés :
  - `src/pages/candidate/CandidateProfilePageModern.tsx`
  - `src/features/candidates/components/dashboard/CandidateDashboardSummary.tsx`

Le flux actif confirmé restait :

`/candidate/dashboard -> CandidateLayout -> CandidateSidebarProvider -> CandidateDashboardPage`

La logique active ne comportait pas deux dashboards concurrents; elle contenait surtout des redondances de hooks et de composants non utilisés ou non routés.

# 2. Analyse

## 2.1 useCandidateEducation

- Fichiers concernés :
  - `src/features/candidates/hooks/useCandidateEducation.ts`
  - `src/features/profile/hooks/useCandidateEducation.ts`
- Différences fonctionnelles :
  - Les deux chargent la même donnée métier : les formations du candidat.
  - La version `features/candidates` appelle directement `educationApi`.
  - La version `features/profile` passe par `profileService`.
- Différences de services/API :
  - `candidates` → `getCandidateEducations`, `createCandidateEducation`, etc.
  - `profile` → `profileService.getEducations`, `createEducation`, etc.
- Imports actuels :
  - `CandidateEducationPage.tsx` utilisait la version `features/candidates`.
  - Le dashboard actif utilisait initialement la version `features/profile`.
- Nombre d’utilisations :
  - faible mais réel; la version candidate était la plus utilisée par les pages de gestion profil.
- Routes concernées :
  - `/candidate/education`
  - `/candidate/profile`
  - `/candidate/dashboard`
- Implémentation recommandée :
  - conserver `src/features/candidates/hooks/useCandidateEducation.ts` comme source de vérité.
- Action recommandée :
  - KEEP + wrapper de compatibilité dans `src/features/profile/hooks/useCandidateEducation.ts`

## 2.2 useCandidateSkills

- Fichiers concernés :
  - `src/features/candidates/hooks/useCandidateSkills.ts`
  - `src/features/profile/hooks/useCandidateSkills.ts`
- Différences fonctionnelles :
  - Même rôle, même donnée métier : compétences du candidat.
  - Même structure de state et même API métier.
- Différences de services/API :
  - `candidates` → `skillsApi`
  - `profile` → `profileService`
- Imports actuels :
  - `CandidateSkillsPage.tsx` utilisait la version `features/candidates`.
  - `CandidateDashboardPage.tsx` utilisait initialement la version `features/profile`.
- Nombre d’utilisations :
  - réel, mais le chemin actif était le fichier `features/candidates`.
- Routes concernées :
  - `/candidate/skills`
  - `/candidate/dashboard`
- Implémentation recommandée :
  - conserver `src/features/candidates/hooks/useCandidateSkills.ts`
- Action recommandée :
  - KEEP + wrapper de compatibilité dans `src/features/profile/hooks/useCandidateSkills.ts`

## 2.3 useCandidateLanguages

- Fichiers concernés :
  - `src/features/candidates/hooks/useCandidateLanguages.ts`
  - `src/features/profile/hooks/useCandidateLanguages.ts`
- Différences fonctionnelles :
  - Même métier : langues d’un candidat.
- Différences de services/API :
  - candidat API direct vs service profile wrapper
- Imports actuels :
  - `CandidateLanguagesPage.tsx` utilisait la version `features/candidates`.
  - `CandidateDashboardPage.tsx` utilisait initialement la version `features/profile`.
- Nombre d’utilisations :
  - modéré, non basé sur deux routes concurrentes.
- Routes concernées :
  - `/candidate/languages`
  - `/candidate/dashboard`
- Implémentation recommandée :
  - conserver `src/features/candidates/hooks/useCandidateLanguages.ts`
- Action recommandée :
  - KEEP + wrapper de compatibilité dans `src/features/profile/hooks/useCandidateLanguages.ts`

## 2.4 useCandidatePreferences

- Fichiers concernés :
  - `src/features/candidates/hooks/useCandidatePreferences.ts`
  - `src/features/profile/hooks/useCandidatePreferences.ts`
- Différences fonctionnelles :
  - Même objet métier `CandidatePreferences`, même séquence de chargement / sauvegarde.
- Différences de services/API :
  - `preferencesApi` vs `profileService`
- Imports actuels :
  - `CandidateDashboardPage.tsx` utilisait initialement la version `features/profile`.
- Nombre d’utilisations :
  - faible mais réel.
- Routes concernées :
  - `/candidate/preferences` (redirection profil)
  - `/candidate/dashboard`
- Implémentation recommandée :
  - conserver `src/features/candidates/hooks/useCandidatePreferences.ts`
- Action recommandée :
  - KEEP + wrapper de compatibilité dans `src/features/profile/hooks/useCandidatePreferences.ts`

## 2.5 useCandidateDocuments

- Fichiers concernés :
  - `src/features/candidates/hooks/useCandidateDocuments.ts`
  - `src/features/profile/hooks/useCandidateDocuments.ts`
- Différences fonctionnelles :
  - La version `features/candidates` stocke les documents localement en `localStorage` en gérant explicitement `cv` + `documents`, avec le retour `setCv`, `setDocuments` et `allDocuments`.
  - La version `features/profile` était un alias qui a été transformé pour pointer vers la source de vérité candidate.
- Différences de services/API :
  - version candidate → `localStorage` via logique dédiée ; 
  - la version profile était une variante en double mais non utilisée par le dashboard principal après migration.
- Imports actuels :
  - `CandidateDocumentsPage.tsx` a été migré vers la version `features/candidates`.
- Nombre d’utilisations :
  - réel mais limité à documents et dashboard.
- Routes concernées :
  - `/candidate/documents`
  - `/candidate/dashboard`
- Implémentation recommandée :
  - conserver `src/features/candidates/hooks/useCandidateDocuments.ts`
- Action recommandée :
  - KEEP + wrapper de compatibilité dans `src/features/profile/hooks/useCandidateDocuments.ts`

## 2.6 useCandidate / useCandidateProfile

- Fichiers concernés :
  - `src/features/candidates/hooks/useCandidate.ts`
  - `src/features/candidates/hooks/useCandidateProfile.ts`
  - `src/hooks/useCandidate.ts`
- Différences fonctionnelles :
  - `useCandidate` est le hook principal de profil candidat.
  - `useCandidateProfile` est une variante qui charge le profil plus lourdement avec un cache et fallback auth.
  - `src/hooks/useCandidate.ts` est un réexport façade.
- Différences de services/API :
  - `useCandidate` → `getCandidateProfileByUserId`, `updateCandidateProfile`.
  - `useCandidateProfile` → `getCandidateProfile`, `updateCandidateProfile`, avec cache et fallback.
- Imports actuels :
  - `src/hooks/useCandidate.ts` est utilisé comme façade historique.
  - `CandidateDashboardPage.tsx` et toutes les pages candidat utilisent `useCandidate` via le wrapper.
- Nombre d’utilisations :
  - élevé, mais pas double source de vérité au sens strict ; c’est un vrai hook principal et un hook de profil de haut niveau.
- Routes concernées :
  - toutes les pages `/candidate/*`
- Implémentation recommandée :
  - conserver `src/features/candidates/hooks/useCandidate.ts` comme source de vérité pour le profil candidat.
  - conserver `src/hooks/useCandidate.ts` comme façade historique stable.
- Action recommandée :
  - KEEP

## 2.7 CandidateSidebar

- Fichiers concernés :
  - `src/components/candidate/CandidateSidebar.tsx`
  - `src/features/candidates/components/profile/CandidateSidebar.tsx`
- Différences fonctionnelles :
  - Le composant de `src/components/candidate` est le vrai sidebar utilisé dans `CandidateLayout`.
  - Le composant de `src/features/candidates/components/profile` est une version simplifiée, non routée et non utilisée.
- Différences de services/API :
  - aucun service métier; uniquement UI / navigation.
- Imports actuels :
  - `CandidateLayout.tsx` importait `src/components/candidate/CandidateSidebar.tsx`.
  - Le composant de `features/candidates/components/profile` n’était ni importé ni monté.
- Nombre d’utilisations :
  - 1 réel, 0 effectif pour la variante alternative.
- Routes concernées :
  - `/candidate/*`
- Implémentation recommandée :
  - conserver la version `src/components/candidate/CandidateSidebar.tsx`
- Action recommandée :
  - DELETE (après vérification des imports, ce qui a été fait)

## 2.8 CandidateTopbar

- Fichiers concernés :
  - `src/components/candidate/CandidateTopbar.tsx`
  - `src/features/candidates/components/profile/CandidateTopbar.tsx`
- Différences fonctionnelles :
  - même logique de topbar candidate, mais seule la version `src/components/candidate` est utilisée par `CandidateLayout`.
- Différences de services/API :
  - aucune API métier; uniquement `useCandidate` et navigation.
- Imports actuels :
  - `CandidateLayout.tsx` utilisait `src/components/candidate/CandidateTopbar.tsx`.
- Nombre d’utilisations :
  - 1 effectif, 0 pour la variante.
- Routes concernées :
  - `/candidate/*`
- Implémentation recommandée :
  - conserver la version active dans `src/components/candidate`.
- Action recommandée :
  - DELETE (variant non routée et non importée)

## 2.9 CandidateProfilePageModern

- Fichiers concernés :
  - `src/pages/candidate/CandidateProfilePageModern.tsx`
- Différences fonctionnelles :
  - implémentation alternative de profil candidat, non routée.
- Différences de services/API :
  - utilise `useCandidate` et `updateProfile`, sans arbre de route ni provider dédié.
- Imports actuels :
  - aucun import statique ou lazy dans `src/App.tsx`.
- Nombre d’utilisations :
  - 0 réelles.
- Routes concernées :
  - aucune.
- Implémentation recommandée :
  - supprimer car non utilisée et non routée.
- Action recommandée :
  - DELETE

## 2.10 CandidateDashboardSummary

- Fichiers concernés :
  - `src/features/candidates/components/dashboard/CandidateDashboardSummary.tsx`
- Différences fonctionnelles :
  - composant utilitaire isolé, non branché sur le dashboard actif.
- Différences de services/API :
  - pas de service métier; pure UI.
- Imports actuels :
  - aucun import réel à partir des routes ou du dashboard actif.
- Nombre d’utilisations :
  - 0.
- Routes concernées :
  - aucune.
- Implémentation recommandée :
  - supprimer.
- Action recommandée :
  - DELETE

# 3. Source de vérité retenue

| Fonctionnalité | Source finale |
|---|---|
| Profil candidat | `src/features/candidates/hooks/useCandidate.ts` |
| Formations candidat | `src/features/candidates/hooks/useCandidateEducation.ts` |
| Compétences candidat | `src/features/candidates/hooks/useCandidateSkills.ts` |
| Langues candidat | `src/features/candidates/hooks/useCandidateLanguages.ts` |
| Préférences candidat | `src/features/candidates/hooks/useCandidatePreferences.ts` |
| Documents candidat | `src/features/candidates/hooks/useCandidateDocuments.ts` |
| Sidebar candidat actif | `src/components/candidate/CandidateSidebar.tsx` |
| Topbar candidat actif | `src/components/candidate/CandidateTopbar.tsx` |
| Layout candidate actif | `src/pages/candidate/CandidateLayout.tsx` |
| Dashboard candidat actif | `src/pages/candidate/CandidateDashboardPage.tsx` |

Les fichiers `src/features/profile/hooks/*` ont été remplacés par des re-exports de compatibilité vers la source de vérité `features/candidates`, afin d’éviter les ruptures historiques sans conserver des implémentations concurrentes.

# 4. Fichiers migrés

Fichiers dont les imports actifs ont été remis vers la source de vérité candidate :

- `src/pages/candidate/CandidateDashboardPage.tsx`
  - `useCandidateEducation` → `@/features/candidates/hooks/useCandidateEducation`
  - `useCandidateLanguages` → `@/features/candidates/hooks/useCandidateLanguages`
  - `useCandidatePreferences` → `@/features/candidates/hooks/useCandidatePreferences`
  - `useCandidateSkills` → `@/features/candidates/hooks/useCandidateSkills`
- `src/pages/candidate/CandidateDocumentsPage.tsx`
  - `useCandidateDocuments` → `@/features/candidates/hooks/useCandidateDocuments`

Fichiers conservés uniquement comme compatibilité / façade :

- `src/features/profile/hooks/useCandidateEducation.ts`
- `src/features/profile/hooks/useCandidateSkills.ts`
- `src/features/profile/hooks/useCandidateLanguages.ts`
- `src/features/profile/hooks/useCandidatePreferences.ts`
- `src/features/profile/hooks/useCandidateDocuments.ts`
- `src/hooks/useCandidate.ts`

# 5. Fichiers supprimés

Fichiers réellement supprimés parce qu’ils étaient non routés, non importés ou redondants :

- `src/pages/candidate/CandidateProfilePageModern.tsx`
- `src/features/candidates/components/dashboard/CandidateDashboardSummary.tsx`
- `src/features/candidates/components/profile/CandidateSidebar.tsx`
- `src/features/candidates/components/profile/CandidateTopbar.tsx`

# 6. Fichiers conservés volontairement

- `src/components/candidate/CandidateSidebar.tsx` : composant réel utilisé par `CandidateLayout`.
- `src/components/candidate/CandidateTopbar.tsx` : composant réel utilisé par `CandidateLayout`.
- `src/features/candidates/hooks/useCandidate.ts` : hook principal de sécurité et chargement.
- `src/hooks/useCandidate.ts` : façade stable pour les imports historiques.
- `src/features/profile/hooks/*` : re-export de compatibilité uniquement, sans implémentation concurrente.

# 7. Vérification des imports

Vérification effectuée après migration :

- recherche globale des références aux fichiers supprimés : aucun résultat pour :
  - `CandidateProfilePageModern`
  - `CandidateDashboardSummary`
  - `features/candidates/components/profile/CandidateSidebar`
  - `features/candidates/components/profile/CandidateTopbar`
- les imports actifs du dashboard et des pages candidat pointent désormais vers la source candidate unique.
- il ne reste pas d’import actif vers une implémentation candidate parallèle fonctionnelle.

# 8. Build

Commande exécutée :

`npm run build`

Résultat :

- Succès de build.
- Statut : OK.
- La commande a atteint la fin de `prerender` sans échec de compilation.

# 9. Test runtime

Étapes exécutées :

1. Démarrage de `npm run preview -- --host 0.0.0.0 --port 4175` (port 4175 occupé, redirection vers 4176)
2. Ouverture de `http://localhost:4176/candidate/login`
3. Connexion avec :
   - email : `melinaetoka@gmail.com`
   - mot de passe : `melinaetoka@gmail.com`
4. Navigation vers `/candidate/dashboard`
5. Attente ~10 secondes
6. Reload sur `/candidate/dashboard`
7. Attente ~10 secondes

Résultats observés :

- `React error #185` présent après connexion et sur le dashboard.
- `Maximum update depth exceeded` n’a pas été observé comme message distinct, mais le runtime est bien en erreur React #185.
- Le dashboard ne stabilise pas à l’état attendu à cause d’un problème de rendu déjà présent et non causé par la déduplication des hooks candidat.

# 10. React #185

- Présent ou absent après nettoyage : présent.
- Nombre d’occurrences observées : 1 occurrence claire dans le navigateur, avec stack montrée dans la console UI.
- Comportement du dashboard après 10 secondes : non stable; l’erreur React #185 se déclenche immédiatement au chargement du dashboard, indépendamment de la suppression des doublons non utilisés.

Le résultat montre que la déduplication ciblée n’a pas corrigé React #185, et qu’il reste un problème distinct du domaine candidate / render loop déjà présent dans le flux.

# 11. Conclusion

La déduplication est terminée sur les doublons réels du domaine candidat qui n’étaient pas réellement actifs dans le flux principal.

Le projet a maintenant une source unique de vérité pour les hooks métiers du candidat :

- `src/features/candidates/hooks/*`

Les variantes non utilisées ont été supprimées, et les points d’entrée historiques ont été conservés uniquement sous forme de wrappers de compatibilité.

Il reste néanmoins un problème React #185 présent et vérifié à runtime, sans qu’il soit possible de conclure que le nettoyage architectural l’a résolu.

La déduplication est donc faite sur les vrais doublons du domaine candidat, mais le problème de rendu #185 est encore présent et doit être traité séparément.
