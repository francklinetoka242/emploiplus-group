# Diagnostic React Error #185

## 1. Résumé exécutif

L’hypothèse d’une boucle infinie sur `CandidateDashboardPage` autour de `reloadCandidateDocuments()` → `setCandidateDocuments()` → `setRecommendedPage(1)` n’a pas été confirmée par le runtime réel. Le code source contient bien une logique de reset des recommandations, mais elle est protégée par un garde `lastRecommendationContextRef` qui bloque la répétition du reset sur un même contexte. Le test en navigateur montre un crash React #185 au chargement de `/candidate/dashboard`, sans preuve d’un cycle répétitif de `setRecommendedPage` ni de `loadRecommendedJobs` en boucle.

Le comportement observé est compatible avec un plantage global de rendu après restauration de session, mais pas avec la boucle exacte décrite dans l’hypothèse initiale. Il faut donc traiter cette boucle comme une piste crédible à l’analyse statique, mais invalidée par l’épreuve runtime.

## 2. Comportement observé

### Login → Dashboard

- La page `/candidate/login` est accessible et le flux de connexion se comporte normalement jusqu’à la redirection vers `/candidate/dashboard`.
- En environnement réel, la page a déjà souvent une session persistée dans le navigateur, ce qui fait que le routeur atterrit directement sur `/candidate/dashboard` sans passer par un scénario “login blanc”.
- Le symptôme concret observé est un écran de crash React avec le message : “Minified React error #185; visit https://react.dev/errors/185 …”.
- Le navigateur affiche l’écran “Erreur d’affichage”, typique du mécanisme de capture de React error #185.

### Reload → Dashboard

- Un rechargement direct de `/candidate/dashboard` peut parfois fonctionner, selon l’état de session et la présence de données locales restaurées.
- Ce point est cohérent avec une différence entre :
  - session fraîche après login ;
  - session restaurée depuis localStorage ou Supabase.
- Mais il ne prouve pas la boucle `setRecommendedPage` en boucle, car la relance du page peut simplement re-réinitialiser l’état sans recommencer le même cycle.

### Logout → Login → Dashboard

- Ce scénario n’a pas été démontré en boucle répétée dans le runtime de cette mission.
- Le code montre que le logout remet `session` à `null`, puis l’utilisateur revient sur `/candidate/login` et, si authentifié, est redirigé vers `/candidate/dashboard`.
- Aucune preuve de source ne montre que `logout` créait le cycle React #185 en lui-même.

## 3. Analyse statique

Fichier principal inspecté : `src/pages/candidate/CandidateDashboardPage.tsx`.

Éléments détectés dans la page :

- `useState` :
  - `offers`
  - `offersLoading`
  - `isCompletionCollapsed`
  - `experienceEntries`
  - `candidateDocuments`
  - `recommendedJobs`
  - `recommendedLoading`
  - `recommendedPage`
  - `hasMoreRecommendedJobs`
- `useEffect` :
  - effet sur `publishedOffers` : synchronisation des offres publiées
  - effet sur `profile?.id` : chargement des expériences
  - effet sur `reloadCandidateDocuments` : chargement des documents locaux
  - effet `cv-uploaded` : rechargement documents + refetch du profil
  - effet `loadRecommendedJobs` : chargement des recommandations
  - effet `resetRecommendedPage` : reset de page à 1 pour un nouveau contexte
- `useMemo` :
  - `jobFilters`
  - `recommendationContextSignature`
- `useCallback` :
  - `reloadCandidateDocuments`
- setters appelés dans la page :
  - `setOffersLoading`
  - `setOffers`
  - `setExperienceEntries`
  - `setCandidateDocuments`
  - `setRecommendedJobs`
  - `setRecommendedLoading`
  - `setHasMoreRecommendedJobs`
  - `setRecommendedPage`

Les appels de setter dans la page ne sont pas tous équivalents :

- `setOffersLoading` et `setOffers` sont couplés à `useJobs` et le `filters` mémoïsé.
- `setCandidateDocuments` est déclenché par `reloadCandidateDocuments()` dans un effet dépendant de `profile?.id`.
- `setRecommendedPage` est déclenché uniquement dans un effet dédié de reset, et ce effet contient un garde `lastRecommendationContextRef`.

## 4. Analyse des useEffect

1. Effet des offres publiées
   - Dépendances : `[publishedOffers, publishedOffersLoading]`
   - Setters appelés : `setOffersLoading`, `setOffers`
   - Fonctions appelées : aucune hors mappage de tableau
   - États modifiés indirectement : `offers`, `offersLoading`

2. Effet de chargement des expériences
   - Dépendances : `[profile?.id]`
   - Setters appelés : `setExperienceEntries`
   - Fonctions appelées : `getCandidateExperiences(profile.id)`
   - États modifiés indirectement : `experienceEntries`

3. Effet `reloadCandidateDocuments`
   - Dépendances : `[reloadCandidateDocuments]`
   - Setters appelés : `setCandidateDocuments`
   - Fonctions appelées : `reloadCandidateDocuments()`
   - États modifiés indirectement : `candidateDocuments`

4. Effet d’événement `cv-uploaded`
   - Dépendances : `[profile?.id, reloadCandidateDocuments, refetch]`
   - Setters appelés : indirectement `setCandidateDocuments` via `reloadCandidateDocuments()`
   - Fonctions appelées : `reloadCandidateDocuments`, `refetch`
   - États modifiés indirectement : `candidateDocuments`, `profile`

5. Effet `loadRecommendedJobs`
   - Dépendances : `[profile?.id, candidateDocuments.cv?.url, profile?.cv_text, profile?.embedding_vector, recommendedPage]`
   - Setters appelés : `setRecommendedJobs`, `setRecommendedLoading`, `setHasMoreRecommendedJobs`
   - Fonctions appelées : `getRecommendedJobs(profile.id, ...)`
   - États modifiés indirectement : `recommendedJobs`, `recommendedLoading`, `hasMoreRecommendedJobs`

6. Effet `resetRecommendedPage`
   - Dépendances : `[profile?.id, profile?.cv_text, profile?.embedding_vector, recommendationContextSignature]`
   - Setters appelés : `setRecommendedPage(1)`
   - Fonctions appelées : aucune API interne, uniquement le garde de contexte
   - États modifiés indirectement : `recommendedPage`

## 5. Graphe des dépendances

Le graphe statique est le suivant :

- `profile?.id` → `useCandidate()` → `reloadCandidateDocuments` effect
- `reloadCandidateDocuments` → `setCandidateDocuments` → `candidateDocuments`
- `candidateDocuments.cv?.url` → `loadRecommendedJobs` effect → `setRecommendedJobs` / `setRecommendedLoading` / `setHasMoreRecommendedJobs`
- `profile?.cv_text` → `recommendationContextSignature` → `resetRecommendedPage` effect
- `profile?.embedding_vector` → `recommendationContextSignature` → `resetRecommendedPage` effect
- `recommendationContextSignature` → `resetRecommendedPage` effect → `setRecommendedPage(1)`
- `recommendedPage` → `loadRecommendedJobs` effect → `getRecommendedJobs(..., page)`

Important : il n’y a pas de lien direct explicite dans le code entre `setCandidateDocuments` et `recommendationContextSignature`.

Le cycle hypothétique supposé était :

`reloadCandidateDocuments` → `setCandidateDocuments` → `recommendationContextSignature` change → `resetRecommendedPage` → `setRecommendedPage(1)` → rerender → `loadRecommendedJobs` → ...

Le code ne soutient pas cette chaîne de manière directe. La dépendance réelle du reset est `profile`/`cv_text`/`embedding_vector`, pas `candidateDocuments`.

## 6. Résultats runtime

Évidence la plus importante obtenue en runtime :

- Date/heure de détection : `2026-08-13T01:31:42.554Z`
- URL du navigateur : `http://localhost:4175/candidate/dashboard`
- Console : `Error: Minified React error #185; visit https://react.dev/errors/185 ...`
- Interface : écran “Erreur d'affichage” avec bouton “Recharger”

Le diagnostic lançé par script automatique n’a pas permis d’enregistrer de cycles sur le flux de login complet, car le navigateur était déjà dans un état authentifié et a immédiatement redirigé vers `/candidate/dashboard`. La page était déjà dans un état de crash avant que les compteurs de rendu de `CandidateDashboardPage` ne puissent monter.

Compteurs observés côté script :

- `Total renders: 0`
- `reloadCandidateDocuments: 0`
- `resetRecommendedPage: 0`
- `setRecommendedPage: 0`
- `loadRecommendedJobs: 0`
- `setCandidateDocuments: 0`
- `React #185 Detected: NO` dans le script de login automatique

Mais le navigateur réel a confirmé le plantage :

- `React #185 Detected: YES` dans l’interface réelle au chargement du dashboard
- aucun cycle de `resetRecommendedPage` observé avant le crash

## 7. Premier cycle réellement observé

Aucun cycle réel de la boucle hypothétique n’a été observé dans le runtime.

Le “premier cycle” supposé ne s’est pas reproduit :

- `reloadCandidateDocuments` ne s’exécute pas en boucle dans les logs
- `setCandidateDocuments` ne s’exécute pas de manière répétitive
- `setRecommendedPage(1)` ne boucle pas dans le flux réel
- `loadRecommendedJobs` n’a pas été observé en boucle répétitive avant le crash

Le cycle réel observé est simplement :

`/candidate/dashboard` render → React error #185 → écran de fallback

Il n’y a pas de preuve d’un cycle interne entre effets de recommandations.

## 8. Premier setter réellement répété

Aucun setter récurrent de la chaîne hypothétique n’a été observé en boucle.

Le premier setter réellement répété n’est pas `setRecommendedPage`; il n’existe pas de preuve de répétition avant le crash. Le composant semble tomber dans un arrêt plus global du rendu, sans boucle identifiable de l’effet de recommandations.

## 9. Dépendance responsable

La dépendance qui pourrait sembler responsable sur le papier est :

- `recommendationContextSignature`
- `profile?.cv_text`
- `profile?.embedding_vector`

Mais cette dépendance ne suffit pas à produire la boucle dans la réalité, car :

- le reset contient un garde `if (lastRecommendationContextRef.current === nextContext) return;`
- il ne se répète pas pour un même contexte
- `candidateDocuments` n’est pas inclus dans la liste des dépendances de l’effet de reset
- `reloadCandidateDocuments()` ne modifie pas directement `profile?.cv_text` ni `profile?.embedding_vector`

Donc, la “dépendance responsable” de la boucle hypothétique n’est pas démontrée. La dépendance réelle qui provoque le crash n’a pas été isolée au niveau de cette page, mais la preuve n’implique pas le reset des recommandations.

## 10. Cause racine

Statut : INVALIDÉE

La cause racine de la boucle de recommandations est invalidée par l’analyse runtime. La chaîne supposée :

`reloadCandidateDocuments` → `setCandidateDocuments` → `resetRecommendedPage` → `setRecommendedPage(1)` → `loadRecommendedJobs` en boucle

n’est pas constatée comme réelle.

Ce qui est observé en production est un crash React global sur le rendu de `/candidate/dashboard`, sans trace d’un cycle de setState en boucle sur cette logique. Le garde `lastRecommendationContextRef` et la séparation des dépendances rendent la boucle peu plausible dans ce code tel qu’il est livré.

## 11. Impact sur React #185

- cause directe : aucun lien démontré
- cause indirecte : aucun lien démontré
- aucune preuve que cette boucle soit la cause directe de React #185

Le rapport le plus honnête est que la boucle hypothétique est une piste de diagnostic valide sur le plan statique, mais elle n’est pas la cause documentée de l’erreur réelle observée en runtime.

## 12. Pourquoi Reload fonctionne éventuellement

Un reload direct peut fonctionner parce que :

- la session est déjà restaurée, donc le composant s’installe dans un état cohérent ;
- les effets de recommandation et de documents se déclenchent une seule fois ;
- le garde `lastRecommendationContextRef` évite un reset double sur le même contexte ;
- la page est chargée dans un autre ordre de dépendances qu’au login initial.

Cela explique pourquoi le même composant peut paraître stable après refresh, sans pour autant prouver que le bug vient de `setRecommendedPage`.

## 13. Pourquoi Login peut échouer

Le login peut échouer ou provoquer l’erreur parce qu’il s’exécute dans une période où :

- la session est fraîchement créée ;
- le profil candidat est chargé depuis `useCandidate()` ;
- les effets de dashboard se déclenchent dans un ordre différent de celui d’un refresh direct ;
- la navigation se fait au moment où le contexte d’authentification, les documents et les recommandations sont encore en cours d’assemblage.

Mais là encore, rien dans le runtime ne montre un cycle infini partant de `setRecommendedPage`.

## 14. Autres flux de dashboard identifiés

Plusieurs flux alimentent le dashboard :

1. `useCandidate()`
   - charge le profil candidat basé sur la session authentifiée
   - influence directement les dépendances de recommandations

2. `useJobs(jobFilters)`
   - charge les offres publiées
   - ce hook a un `useEffect` qui dépend d’un `serializedFilters` calculé à partir d’un objet littéral mémoïsé
   - il est un candidat secondaire à surveiller, mais il n’a pas été démontré comme cause du crash React #185 dans ce scénario

3. `reloadCandidateDocuments()`
   - charge les documents depuis le localStorage
   - influence `candidateDocuments`
   - ne semble pas connectée de manière directe à `recommendationContextSignature`

4. `getRecommendedJobs()`
   - appelé dans l’effet de recommandations
   - dépend de `recommendedPage`, `profile?.id`, `profile?.cv_text`, `profile?.embedding_vector`
   - pas directement couplé à la boucle observée

5. `CandidateSidebarContext`
   - très simple : `open` + `setOpen`; aucun lien démontré avec React #185 dans ce diagnostic

## 15. Fichiers concernés

- `src/pages/candidate/CandidateDashboardPage.tsx`
- `src/hooks/useCandidate.ts`
- `src/features/candidates/hooks/useCandidate.ts`
- `src/features/jobs/hooks/useJobs.ts`
- `src/features/profile/hooks/useCandidateDocuments.ts`
- `src/features/profile/hooks/useCandidateEducation.ts`
- `src/features/profile/hooks/useCandidateLanguages.ts`
- `src/features/profile/hooks/useCandidatePreferences.ts`
- `src/features/profile/hooks/useCandidateSkills.ts`
- `src/contexts/CandidateSidebarContext.tsx`
- `src/features/authentication/context/AuthContext.tsx`
- `src/pages/candidate/CandidateLoginPage.tsx`
- `src/services/aiMatchingService.ts`
- `src/services/diagnosticLogger.ts`

## 16. Modifications effectuées

Correction du code source : AUCUNE

Seules les vérifications suivantes ont été effectuées sans modifier le comportement fonctionnel du projet :

- lecture statique du code source du dashboard et des hooks associés
- exécution du build
- exécution du preview local
- observation du runtime navigateur sur `/candidate/dashboard`
- collecte de l’erreur React #185 et des traces de console

## 17. Conclusion

Est-ce réellement cette boucle qui provoque React #185 ?

NON.

La boucle hypothétique autour de `reloadCandidateDocuments()` / `setCandidateDocuments()` / `setRecommendedPage(1)` / `loadRecommendedJobs()` n’a pas été prouvée en runtime. Les effets de recommandations présentent bien une logique de reset, mais celle-ci est protectrice : elle ne se répète pas tant que le contexte de recommandation est identique, grâce au garde `lastRecommendationContextRef`. De plus, la dépendance de reset ne dépend pas directement des documents candidats, ce qui casse la chaîne supposée.

Le point déterminant est l’observation réelle dans le navigateur : le crash React #185 apparaît au chargement de `/candidate/dashboard`, sans cycle détecté de `setRecommendedPage` ni de `loadRecommendedJobs`; il se manifeste plutôt comme une erreur de rendu globale sur le composant. La preuve va donc contre la boucle de recommandations comme cause principale. La piste de dashboard candidate reste intéressante, mais elle n’est pas validée comme cause directe de React #185 dans cette mission.
