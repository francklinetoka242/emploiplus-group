# ADMIN DASHBOARD AUDIT

## 1. Routing
- Route `/admin` est définie dans `src/App.tsx`.
- Composants rendus pour `/admin`:
  - layout parent: `AdminPage` (lazy import from `src/pages/admin/AdminPage.tsx`) — rendu via `<ProtectedRoute allowedRoles=["super_admin","admin","editor"]>`.
  - index route (`/admin`): rendu via a nested `ProtectedRoute` requiring `allowedRoles=["super_admin","admin"]` et `requiredPermissions=["dashboard.admin"]`, qui rend `AdminHomePage` (lazy import `src/pages/admin/AdminHomePage.tsx`).
- Il n'existe pas de route `/admin/dashboard`; le dashboard admin est la route index `/admin`.

Conclusion Routing: la chaîne est `/admin` → `ProtectedRoute(roles)` → `AdminPage` (layout) → nested `ProtectedRoute(roles+permissions)` → `AdminHomePage`.

## 2. Authentication
- `AuthProvider` (dans `src/features/authentication/context/AuthContext.tsx`) expose `session`, `user`, `roles`, `rolesResolved`, `isLoading`, `isProfileLoading`, `permissions`, `refetchProfile`, etc.
- `AuthenticationGuard` (dans `src/features/authentication/guards/AuthenticationGuard.tsx`) lit `useAuth()` (alias `useAuthContext`) et :
  - lit `user`, `isLoading`, `error` ;
  - si `isLoading` true → rend le `loadingSkeleton` (par défaut `DashboardLayoutSkeleton`) ;
  - si `isLoading` false et `!user` → redirige vers `fallbackPath` ;
  - sinon rend les enfants.

Conditions pouvant empêcher le rendu :
- `isLoading === true` ⇒ affichage du skeleton (blocage temporaire jusqu'à `isLoading` false).
- `user === null` après chargement ⇒ redirection.

## 3. Roles
- Récupération des rôles :
  - `getAuthMetadataFromSession(session)` (src/features/authentication/types) lit `session.user.app_metadata.roles` (attend un tableau `roles`) et `session.user.app_metadata.permissions`.
  - Les rôles bruts sont passés à `resolveAuthRoles(claimRoles, dbRoles)` qui normalise et filtre uniquement `"super_admin"|"admin"|"editor"`.
  - `AuthContext.resolveSessionRoles()` interroge la table `user_roles` (supabase) pour récupérer les rôles en base (`dbRoles`) et combine `incomingSession.user.app_metadata.roles` (claimRoles) avec `dbRoles`.

Observations critiques:
- `getAuthMetadataFromSession` ne regarde pas `session.user.app_metadata.role` (clé singulière). Il exige explicitement un tableau `roles`.
- Si le token contient `app_metadata.role = "super_admin"` (singulier) et pas `app_metadata.roles = [...]`, la lecture initiale des claims retournera une liste vide et la logique dépendra uniquement de la table `user_roles` (DB) ou d'une résolution asynchrone.

Quand `rolesResolved` devient `true` :
- `AuthContext` appelle `resolveSessionRolesSafely()` en background (timeout 2500ms) après lecture initiale de la session (ou onAuthStateChange) ; `rolesResolved` passe à `true` lorsque la résolution aboutit ou survient un fallback/erreur.

Risques identifiés :
- Si le token ne contient pas `roles` (tableau), il faut que la requête DB `user_roles` retourne des rôles rapidement pour que `RoleGuard` et `PermissionGuard` fonctionnent immédiatement. Sinon, pendant la fenêtre d'attente, les guards peuvent considérer les rôles vides.

## 4. AuthenticationGuard — conditions précises
- Lit : `user`, `isLoading`, `error` via `useAuth()`.
- Attend : `isLoading === false` et `user` présent.
- Effet visible :
  - si `isLoading === true` → RENVOIE `loadingSkeleton` (blocage visuel jusqu'à false).
  - si `isLoading === false` et `user === null` → REDIRECTION.

Pour un admin connecté (session présente) :
- `AuthenticationGuard` devrait être `OK` (user non-nul) une fois `isLoading` terminé.

## 5. RoleGuard — conditions précises
- Lit : `useRoles()` qui renvoie `{ roles, loading }` ; `loading` provient de `useAuth().isLoading`.
- Attend : `roles` contient au moins une valeur appartenant à `allowedRoles` passé au `RoleGuard`.
- Comportement :
  - si `loading === true` → RENVOIE `loadingSkeleton` ;
  - si `loading === false` et `hasAllowedRole === true` → passe ;
  - sinon → REDIRECTION vers `fallbackPath` avec `authError: 'unauthorized'`.

Remarque importante : `RoleGuard` ne vérifie pas `rolesResolved` explicitement — il se base uniquement sur `useAuth().isLoading` pour décider si attendre. Cela signifie que si `isLoading` est false mais `roles` est encore vide (ex : claim non détecté et DB roles non encore appliqués), `RoleGuard` considérera l'utilisateur non autorisé et déclenchera une redirection immédiate.

## 6. PermissionGuard — conditions précises
- Lit : `usePermissions()` (s'appuie sur `useAuthContext()` directement).
- `usePermissions().loading` est `isLoading || isProfileLoading` (donc dépend à la fois de la résolution de session et du chargement du profil candidat).
- Si `loading === true` → RENVOIE `loadingSkeleton`.
- Sinon calcule `permissions` en combinant : claims `permissions` from session.app_metadata, permissions liées aux `roles`, et permissions `candidate` si `profile` présent.
- Si les permissions requises ne sont pas présentes → REDIRECTION.

Impact : si `isProfileLoading === true` (profile en cours de chargement), `PermissionGuard` restera en chargement et affichera le skeleton.

## 7. AdminPage (layout) — vérification
- `src/pages/admin/AdminPage.tsx` (modifié précédemment) :
  - n'effectue plus `supabase.auth.getSession()` local ; il lit `session` et `isLoading` via `useAuthContext()` (modification appliquée dans cette session de travail).
  - il affiche un skeleton local uniquement si `isLoading === true` (dérivé d'`AuthContext`).
  - il rend `<Outlet />` dans la zone `main` sans conditions supplémentaires.

Questions inspectées :
- Est-ce que `loading` peut rester true ? Oui potentiellement si `AuthContext.isLoading` reste true — ex : délai réseau, safety timer, ou comportements asynchrones. Mais `AuthContext` a un safety timeout de 2500ms qui force `isLoading=false` en dernier recours.
- Est-ce que `rolesResolved` peut empêcher le rendu ? `AdminPage` n'attend pas `rolesResolved` explicitement ; la limitation vient des guards situés AVANT le rendu du contenu.
- Est-ce que `AdminPage` bloque `<Outlet />` ? Non : `AdminPage` rend `<Outlet />` directement une fois `isLoading` false et `session` présent.

## 8. AdminHomePage (dashboard) — vérification
- `AdminHomePage` rend `AdminDashboardView`.
- `AdminDashboardView` exécute plusieurs requêtes Supabase en `useEffect` (Promise.all sur `job_offers`, `blog_posts`, `contacts_messages`, `user_roles`).
- Il a son propre état `loading` initialisé à `true` ; il passe à `false` dans le `finally` du `loadCounts()`.
- Si une requête échoue, `loadError` est défini et `loading` passe à `false` (donc l'erreur est visible au lieu d'un skeleton persistant).

Observation : si `AdminHomePage` n'est pas rendu du tout (on ne voit que le skeleton), la cause est très probablement en amont (AuthenticationGuard / RoleGuard / PermissionGuard) et non dans `AdminHomePage` lui-même.

## 9. Source exacte du skeleton / blocage (diagnostic)
Synthèse des indices techniques :
- Le skeleton affiché sur `/admin` peut provenir de trois endroits :
  1. `AuthenticationGuard` si `isLoading === true` (AuthContext en cours d'initialisation) ;
  2. `RoleGuard` si `useRoles().loading === true` (hérité d'`isLoading`) ;
  3. `PermissionGuard` si `usePermissions().loading === true` (i.e. `isLoading || isProfileLoading`).
- Parmi ces trois, les observations suivantes sont critiques :
  - `RoleGuard` n'attend pas `rolesResolved` explicitement ; il se base sur `isLoading`. Si `isLoading` devient `false` avant que `resolveSessionRolesSafely()` ait injecté les rôles dans la session, `roles` sera vide et `RoleGuard` redirigera immédiatement (ce qui provoquerait une redirection, pas un skeleton). Donc si on observe un SKELETON PERMANENT (et non une redirection), la cause probable est `PermissionGuard` (loading) ou `AuthenticationGuard` (isLoading still true).
  - `PermissionGuard.loading` combine `isLoading || isProfileLoading`. `AuthContext` lance `refetchProfile()` en background après le login et met `isProfileLoading` true pendant la lecture de `candidates` (table). Si cette lecture est lente (réseau, RLS, timeout) ou bloque, `PermissionGuard` affichera le skeleton jusqu'à la fin du chargement.

Diagnostic principal (most likely):
- Le skeleton persistant sur `/admin` est très probablement causé par `PermissionGuard` restant en état `loading` parce que `isProfileLoading` reste `true` ou la combinaison `isLoading || isProfileLoading` reste vraie durant la résolution des permissions (profil en cours de chargement). Cela verrouille l'affichage du contenu admin même si la session existe.

Secondaire (possible) :
- Un mismatch entre le token app_metadata shape (`role` vs `roles`) peut faire que `roles` reste vide jusqu'à ce que `resolveSessionRolesSafely()` ajoute les rôles depuis la table `user_roles`. Si `isProfileLoading` et `isLoading` deviennent false mais `roles` est vide, `RoleGuard` peut rediriger — ce cas produit une redirection, non un skeleton.

## 10. Trace complète du flux (STATUT pour chaque étape)
- LOGIN: OK (signInWithPassword retourne session)
- signInWithPassword -> session: OK (session available immediately by design)
- AuthContext: OK/INCERTAIN (session set; background role resolution started; `rolesResolved=false` initially)
- roles: INCERTAIN — depends on token shape+DB rows; can be empty until resolved
- rolesResolved: IN PROGRESS at login; becomes true after resolveSessionRolesSafely completes (or timeout)
- AuthenticationGuard: OK or BLOCKED if `isLoading===true` (depends on timing); typically OK after login finalization
- RoleGuard: OK if `roles` contains allowed value; otherwise BLOCK (redirect) — depends on roles content
- PermissionGuard: BLOCKED if `isLoading || isProfileLoading` true — most likely source of persistent skeleton
- AdminPage: OK (renders Outlet once upstream guards allow)
- AdminHomePage: OK when rendered; contains own loading for data fetches

## 11. Cause racine (résumé)
La cause la plus probable et reproductible du skeleton bloqué sur `/admin` est le **chargement des permissions** dans `PermissionGuard`, qui dépend de `isLoading || isProfileLoading`. En pratique, `AuthContext` démarre un `refetchProfile()` en background et `isProfileLoading` peut rester vrai (ou marcher conjointement avec `isLoading`) suffisamment longtemps pour que le `PermissionGuard` affiche un skeleton. Si la résolution du profil est lente (requête `getCandidateProfileByUserId` retardée, timeout, ou RLS/permission côté DB), l'écran restera sur le skeleton.

Facteur aggravant : si la session n'expose pas `app_metadata.roles` (tableau) mais `app_metadata.role` (clé singulière), la résolution initiale des rôles est vide et la logique doit compter sur la table `user_roles` (résolution DB) pour obtenir les rôles. Cela étend la fenêtre où `roles` est vide et peut provoquer soit une redirection (RoleGuard), soit (si profile loading est actif) un skeleton (PermissionGuard).

## 12. Correction minimale recommandée
1. Première action de diagnostic (sans modifier le runtime) : ajouter logs temporaires (console.debug) côté `AuthContext` et dans les guards pour confirmer l'état réel au moment du rendu :
   - `[ADMIN DEBUG] session =`, `session?.user?.app_metadata`;
   - `[ADMIN DEBUG] roles =`, `roles`;
   - `[ADMIN DEBUG] rolesResolved =`, `rolesResolved`;
   - `[ADMIN DEBUG] isLoading =`, `isLoading`, `isProfileLoading`;
   - `[ADMIN DEBUG] guard decision` dans `RoleGuard`/`PermissionGuard` (hasAllowedRole, hasAccess).

2. Correction minimale probable (si logs confirment mismatch `role` vs `roles`) : normaliser la lecture des rôles claims. Modifier `getAuthMetadataFromSession()` (src/features/authentication/types) pour accepter également `session.user.app_metadata.role` (chaîne) et le transformer en tableau `roles = [role]` avant `resolveAuthRoles`.

   Exemple (pseudo) :
   - const rawRoles = Array.isArray(session.user.app_metadata.roles) ? session.user.app_metadata.roles : session.user.app_metadata.role ? [session.user.app_metadata.role] : [];

3. Option alternative minimale : dans `resolveSessionRoles()` (AuthContext), étendre `claimRoles` pour lire aussi `incomingSession.user.app_metadata.role` si `roles` absent.

4. Si le problème est que `isProfileLoading` reste vrai → tracer et corriger `getCandidateProfileByUserId()` : vérifier timeouts, RLS, permissions. Possibles actions :
   - augmenter le timeout ou ajouter fallback rapide;
   - s'assurer que `getCandidateProfileByUserId` renvoie rapidement (fallback minimal) pour ne pas bloquer `PermissionGuard`.

Remarque : la correction 2 (normalisation `role` → `roles`) est la plus ciblée et à faible risque — elle corrige un mismatch de forme du token sans toucher à `AuthContext` (test minimal local à `getAuthMetadataFromSession`).

## 13. Fichiers qui devront être modifiés (si tu autorises la correction)
- Candidate minimal fix: `src/features/authentication/types/index.ts` — ajuster `getAuthMetadataFromSession()` pour accepter `app_metadata.role` singulier.
- Alternative: `src/features/authentication/context/AuthContext.tsx` — (petite extension de `resolveSessionRoles` pour accepter `app_metadata.role`) *si* tu préfères garder type parsing centralisé.

## 14. Fichiers qui NE DOIVENT PAS ÊTRE MODIFIÉS
- `src/pages/candidate/CandidateLoginPage.tsx`
- `src/features/authentication/context/AuthContext.tsx` (ne pas modifier sauf si la preuve montre qu'une petite extension est nécessaire)
- Le flux candidat complet (déjà résolu)

## 15. Risques de régression
- Modification de la lecture des claims (`role` → `roles`) : très faible risque ; centralise et normalise les claims entrants.
- Toucher `AuthContext` : risque moyen si la logique de `rolesResolved`/background resolution est modifiée ; éviter sauf si nécessaire.

---

# Conclusion synthétique

CAUSE RACINE :
- Très probablement un mismatch entre la forme des claims de rôle dans le token (`app_metadata.role` singulier vs `app_metadata.roles` attendu) ou une résolution asynchrone des rôles/profil qui maintient `PermissionGuard` en `loading` (donc skeleton). Ces deux facteurs prolongent l'état de vérification des permissions et empêchent le rendu du dashboard.

COMPOSANT RESPONSABLE :
- `PermissionGuard` (blocage visible) et `RoleGuard` (risque de redirection) — la cause racine est en amont : la lecture/normalisation des rôles (types/claims) et la résolution du profil.

POURQUOI LE DASHBOARD NE S'AFFICHE PAS :
- Parce que `PermissionGuard` considère que la vérification des permissions est toujours en cours (`isLoading || isProfileLoading`), ou parce que `roles` est vide au moment du contrôle et `RoleGuard` bloque/redirige.

CORRECTION MINIMALE :
- Normaliser la lecture des rôles claims (accepter `app_metadata.role` comme fallback et convertir en tableau `roles`). Ajouter logs temporaires pour confirmer l'état des claims/roles/resolution avant tout correctif.

FICHIERS À MODIFIER :
- `src/features/authentication/types/index.ts` (préféré) — ajuster `getAuthMetadataFromSession()`.

FICHIERS À NE PAS MODIFIER :
- `src/pages/candidate/CandidateLoginPage.tsx`, `src/features/authentication/context/AuthContext.tsx` (sauf si diagnostics montrent nécessité minimale), et tout le flux candidat.

Si tu veux, j'ajoute d'abord les logs temporaires demandés (dans `AuthContext` et les guards) pour confirmer l'hypothèse `app_metadata.role` vs `roles`, puis je te propose la correction minimale sur `getAuthMetadataFromSession()` et je l'applique seulement après ton accord.
