# Audit erreurs post-authentification

## 1. État actuel
  - ADMIN : authentification OK, redirection vers `/admin`, page affiche uniquement un skeleton (ou écran de chargement).
  - CANDIDAT : authentification OK, redirection vers `/candidate/dashboard`, mais le dashboard lance l'erreur React "Maximum update depth exceeded".

## Corrections appliquées

- **Fichier modifié**: `src/pages/admin/AdminPage.tsx`
  - **Modification**: suppression de la lecture locale `supabase.auth.getSession()` et retrait de l'état `loading` local ; utilisation de `useAuthContext()` pour lire `session` et `isLoading`.
  - **Raison**: éviter la double-attente (duplication session/loading) qui bloquait l'affichage du dashboard admin.

- **Fichier modifié**: `src/pages/candidate/CandidateDashboardPage.tsx`
  - **Modification**: mémoïsation locale des `jobFilters` via `useMemo()` puis passage de cet objet memoïsé à `useJobs()` au lieu de créer un objet inline à chaque render.
  - **Raison**: empêcher la recréation de l'objet filters à chaque rendu qui pouvait déclencher un rechargement infini des offres et provoquer la boucle `Maximum update depth exceeded`.

## Résultats des vérifications locales
- `npm run build`: success — le build Vite s'est terminé sans erreurs (warnings sur la taille des chunks, non liées aux changements).
- `npm run lint` (global): le projet contient de nombreuses erreurs de style/Prettier non liées aux modifications récentes. Je n'ai pas tenté de corriger l'ensemble du dépôt.
- ESLint ciblé sur fichiers modifiés:
  - `src/pages/admin/AdminPage.tsx`: aucun problème détecté.
  - `src/pages/candidate/CandidateDashboardPage.tsx`: 2 warnings résiduels (`react-hooks/exhaustive-deps`) concernant des dépendances de hook potentiellement manquantes. Aucune erreur bloquante.

## Étapes suivantes recommandées
- Exécuter les tests manuels en navigateur (obligatoire):
  1. login admin → vérifier `/admin` affiche le vrai dashboard (pas de skeleton bloqué).
  2. login candidat → vérifier `/candidate/dashboard` affiche le vrai dashboard et qu'aucune erreur "Maximum update depth exceeded" n'apparait dans la console.
- Si la boucle persiste après la mémoïsation, arrêter et produire un diagnostic précis (identifier le hook/setState responsable). Je n'ai pas appliqué d'autres modifications non demandées.

---
## 2. Flux admin (résumé code lu)
- Routing principal : `src/App.tsx` — route `/admin` est définie et enveloppée par `ProtectedRoute`.
- `ProtectedRoute` compose `AuthenticationGuard` → `RoleGuard` → `PermissionGuard`.
- `index` de `/admin` rend `AdminHomePage` (alias `AdminHomePage` importée) via `AdminPage` wrapper.
- `AdminPage` (src/pages/admin/AdminPage.tsx) :
  - Est un layout parent qui :
    - a son propre état `loading` initial `true` ;
    - dans un `useEffect` appelle `supabase.auth.getSession()` localement, `setSession(data.session)` et `setLoading(false)` une fois la promesse résolue ;
    - rend un écran de chargement interne tant que `loading` est vrai ; sinon rend le `Outlet` (zone de contenu) qui inclut `AdminHomePage` pour la route index.

## 3. Problème `/admin` — diagnostic précis
- Observé : après login, l'utilisateur admin est redirigé vers `/admin` mais voit un écran de chargement (squelette) au lieu du dashboard.

Cause la plus probable et immédiate (factuelle, basée sur le code) :
- `ProtectedRoute` (via `AuthenticationGuard`) peut afficher un `DashboardLayoutSkeleton` si `useAuth().isLoading` est vrai. De plus `AdminPage` possède son propre `loading` interne initialisé à `true` et ne s'appuie pas sur le `AuthContext` pour la session.
- Concrètement il existe deux couches de temporisation :
  1. `AuthContext.isLoading` ;
  2. `AdminPage.loading` (attente de `supabase.auth.getSession()` en local dans `AdminPage`).

Si, au moment de l'affichage initial, `AuthContext.isLoading` est vrai ou `AdminPage` n'a pas encore fini son `getSession()` local, l'utilisateur verra un skeleton/écran de chargement. Le code montre clairement que `AdminPage` fait un appel local `supabase.auth.getSession()` (ligne ~40 dans `AdminPage`) et attend (`loading` true) avant de rendre le contenu (`AdminDashboardView`).

Pourquoi cela pose problème :
- `AuthContext` contient déjà la session et les métadonnées (éventuellement) — `AdminPage` effectue une nouvelle lecture indépendante de `supabase.auth.getSession()`, provoquant une attente redondante qui prolonge l'état de chargement et peut empêcher l'affichage immédiat du dashboard.

Remarques additionnelles trouvées :
- Il existe bien une route `index` pour `/admin` qui affiche `AdminHomePage` (donc `/admin` est la route du dashboard admin). Il n'y a pas de `/admin/dashboard` dans le routing (le dashboard admin est à `/admin`).

Fichiers pertinents :
- `src/App.tsx` — définition des routes `/admin` et des protections
- `src/pages/admin/AdminPage.tsx` — layout parent et `supabase.auth.getSession()` local
- `src/pages/admin/AdminHomePage.tsx` — composant `AdminDashboardView` (le dashboard réel)
- `src/features/authentication/guards/ProtectedRoute.tsx`, `AuthenticationGuard.tsx`, `RoleGuard.tsx`, `PermissionGuard.tsx`

Correction recommandée (minimale)
- Remplacer la logique locale de `supabase.auth.getSession()` dans `AdminPage` par l'utilisation du `AuthContext` (`useAuthContext()` / `useAuth()`), et s'appuyer sur `rolesResolved` si nécessaire :
  - Lire `session` depuis le `AuthContext` au lieu d'appeler `supabase.auth.getSession()` localement ;
  - Supprimer/éviter l'état local `loading` dans `AdminPage` ou le synchroniser avec `AuthContext.isLoading` pour éviter double attente ;
  - Optionnel : utiliser `rolesResolved` pour attendre les rôles si l'affichage dépend d'eux.

Raison : cela évite une lecture redondante et permet d'afficher le dashboard dès que `AuthContext` expose la session, tout en conservant les guards existants.

Impact : modification ciblée de `AdminPage` (ou synchronisation avec `AuthContext`), pas de changement de l'authentification ni des guards. Faible risque de régression si on mappe correctement `AuthContext`.

## 4. Route réelle du dashboard admin
- Route index de `/admin` (définie dans `src/App.tsx`) rend `AdminHomePage` via `AdminPage`. Il n'existe pas de `/admin/dashboard` dans le routeur principal ; la route d'admin principale est `/admin`.

## 5. Flux candidat (résumé code lu)
- Route `/candidate/dashboard` rend `CandidateDashboardPage` (src/pages/candidate/CandidateDashboardPage.tsx) ; ce composant utilise plusieurs hooks et charge :
  - `useCandidate()` → `profile` et `refetch` (vient de `AuthContext`),
  - `useJobs({...})` pour offres publiées,
  - `useCandidateEducation`, `useCandidateSkills`, `useCandidateLanguages`, `useCandidatePreferences`,
  - appels asynchrones pour expériences (`getCandidateExperiences`) et recommandations (`getRecommendedJobs`),
  - lecture du localStorage pour documents (`reloadCandidateDocuments`).

## 6. Cause exacte de "Maximum update depth exceeded"
Basé uniquement sur le code lu (pas d'exécution), le motif le plus plausible est une boucle de rendu déclenchée par des effets qui appellent systématiquement des mises à jour d'état parce qu'ils dépendent d'objets recréés à chaque render ou d'une fonction non stable :

Indices trouvés dans le code :
- `CandidateDashboardPage` appelle `useJobs({ status: "published", limit: 3, orderBy: "published_at", order: "desc" })` avec un objet littéral inline. Si `useJobs` ou sa logique de dépendances interne s'attend à une valeur stable (mémoïsée) et que la recomposition déclenche à son tour `setOffers` chaque render, cela peut produire une boucle de rendu.
- `useJobs` calcule `serializedFilters` via `useMemo` dépendant de `filters?.query`, `filters?.company`, etc. Si la consommation du hook ou la manière dont il est invoqué provoque un changement continu de `serializedFilters`, l'effet qui recharge les offres s'exécute en boucle et appelle `setOffers` → re-render → nouvel effet → ...
- D'autres effets dans `CandidateDashboardPage` (notamment ceux dépendant d'objets recréés comme l'objet passé à `useProfileCompletion`) causent des recomputations mais ne font pas directement de `setState` non guardé. Le vrai coupable probable est un hook qui déclenche une mise à jour à chaque render (ex. `useJobs` si `serializedFilters` n'est stable).

Trace de boucle probable (exemple plausible basé sur le code):
Component CandidateDashboardPage
→ appelle `useJobs({...literal...})` (filters littéral récréé)
→ `useJobs` compute `serializedFilters` (si mal évalué comme changeant)
→ useEffect de `useJobs` exécute `loadOffers()`
→ `loadOffers()` appelle `setOffers(...)`
→ React re-render CandidateDashboardPage
→ useEffect mapping publishedOffers → setOffers (ou re-trigger)
→ ... (répétition jusqu'à dépassement)

## 7. Trace de la boucle React (formalisée)
CandidateDashboardPage
→ useJobs(filtersLiteral)
→ useJobs.useEffect([serializedFilters])
→ loadOffers() → setOffers(...) (state setter)
→ render CandidateDashboardPage (publishedOffers changes)
→ useEffect mapping publishedOffers → setOffers (ou re-trigger)
→ ... (répétition jusqu'à dépassement)

Remarques : sans stack trace runtime il est impossible d'affirmer à 100% l'origine, mais le pattern correspond au symptôme observé et au code (appel de hook avec objet littéral). Ce type de bug est fréquent lorsque des objets littéraux sont passés aux hooks ou que des dépendances d'effet sont dynamiquement recréées.

## 8. Fichiers responsables (candidats)
- `src/pages/candidate/CandidateDashboardPage.tsx` — appel de `useJobs` avec objet littéral, plusieurs useEffects.
- `src/features/jobs/hooks/useJobs.ts` — implémentation du hook et de son effet qui recharge les offres (dépend de `serializedFilters`).
- Également à vérifier : hooks de profil/recommended (`getRecommendedJobs`) et `reloadCandidateDocuments` (mais ils semblent correctement protégés par des guards `if (!profile?.id)`).

## 9. Correction minimale recommandée

ADMIN (correction minimale)
- Dans `src/pages/admin/AdminPage.tsx` :
  - Utiliser `const { session, isLoading: authLoading, rolesResolved } = useAuthContext()` (ou `useAuth()`) au lieu d'appeler `supabase.auth.getSession()` localement.
  - Supprimer l'état local `loading` ou le synchroniser avec `authLoading`/`rolesResolved`.
  - Rendre le contenu (`<Outlet />` / `AdminHomePage`) dès que `session` existe et `rolesResolved` est `true` (si besoin), ce qui évite le skeleton redondant.

Risque de régression : faible (modification ciblée d'un composant layout). Ne touche pas `AuthContext` ni aux guards.

CANDIDAT (correction minimale)
- Dans `src/pages/candidate/CandidateDashboardPage.tsx` :
  - Mémoïser l'objet `filters` passé à `useJobs` pour éviter sa recréation à chaque render :
    ```ts
    const jobFilters = useMemo(() => ({ status: "published", limit: 3, orderBy: "published_at", order: "desc" }), []);
    const { offers: publishedOffers, loading: publishedOffersLoading } = useJobs(jobFilters);
    ```
  - Alternativement, adapter `useJobs` pour accepter des primitives séparées au lieu d'un objet littéral, ou pour comparer profondément `filters` avant de considérer un changement.

Raison : empêche le déclenchement répété de l'effet de chargement des offres qui provoque `setOffers` à chaque render.

Impact : modification locale dans `CandidateDashboardPage` ou `useJobs`. Ne touche pas `AuthContext`, logout, persistence ou rolesResolved.

## 10. Risques de régression
- Admin fix : faible risque si `AdminPage` passe à `useAuthContext()` pour la session — il faut vérifier la compatibilité de shape de `session` attendu par `AdminSidebar` et autres composants (mais ils ne devraient pas dépendre d'une lecture directe `supabase.auth.getSession()` vs `AuthContext.session`).
- Candidate fix : très faible risque — mémoïser un objet littéral filtre est une bonne pratique et ne modifie pas la logique métier.


# Conclusion

ADMIN :
- AUTH = OK (la session est bien créée et persistée)
- REDIRECTION = OK (redirection vers `/admin` est déclenchée)
- ROUTING = OK (le dashboard admin est la route index `/admin`)
- RENDER = KO (le dashboard affiche un écran de chargement à cause d'une double-attente: `AuthenticationGuard` / `AdminPage` lisant `supabase.auth.getSession()` localement)

CANDIDAT :
- AUTH = OK (session et redirection vers `/candidate/dashboard`)
- REDIRECTION = OK
- ROUTING = OK
- RENDER = KO (bug "Maximum update depth exceeded" probablement causé par un hook qui déclenche un setState à chaque render — suspect : `useJobs` appelé avec un objet littéral non memoïsé)

Si tu veux, j'appliquerai ces deux corrections minimales (1) synchroniser `AdminPage` avec `AuthContext` et (2) mémoïser les `filters` passés à `useJobs` dans `CandidateDashboardPage`. Je peux ensuite exécuter un test smoke local (npm run dev) et valider les deux scénarios (admin / candidat) pour confirmer la résolution.
