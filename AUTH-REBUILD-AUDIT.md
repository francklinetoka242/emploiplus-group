# AUTH-REBUILD-AUDIT

## 1) Flux actuel

### 1.1 Entrée globale

L’application wrappe le tree principal avec `AuthProvider` dans [src/App.tsx](src/App.tsx).

Le flux actuel se décompose ainsi :

1. `App` rend `AuthProvider`.
2. `AuthProvider` initialise `session`, `profile`, `rolesResolved`, `isLoading`, `isProfileLoading`, `error`.
3. `AuthContext` exécute un `useEffect` d’initialisation qui appelle `supabase.auth.getSession()`.
4. Si une session est retrouvée, elle est mise dans l’état `session`.
5. `resolveSessionRolesSafely()` est lancé pour tenter de reconstruire les rôles à partir de `user.app_metadata.roles` et de `user_roles`.
6. `getCandidateProfileByUserId(session.user.id)` est lancé dans un second `useEffect` dès qu’un `session.user.id` apparaît.
7. Les guards lisent `useAuth()` / `useAuthContext()` et déterminent l’état d’accès.
8. `ProtectedRoute` enchaîne `AuthenticationGuard` → `RoleGuard` → `PermissionGuard`.
9. Les routes admin et candidate sont protégées par des `ProtectedRoute` et plusieurs `allowRoles / requiredPermissions`.

### 1.2 Rôles et permissions

Le rôle est calculé via :

- [src/features/authentication/types/index.ts](src/features/authentication/types/index.ts)
- [src/features/authentication/utils/resolveAuthRoles.ts](src/features/authentication/utils/resolveAuthRoles.ts)
- [src/features/authentication/permissions/rolePermissions.ts](src/features/authentication/permissions/rolePermissions.ts)

La logique actuelle tente de construire 
`roles = resolveAuthRoles(claimRoles, dbRoles)`
puis ces rôles sont utilisés pour dériver les permissions.

Le point important est que le token Supabase ne présente pas toujours un schéma uniforme :

- `app_metadata.role = "super_admin"`
- ou `app_metadata.roles = ["super_admin"]`

La fonction `getAuthMetadataFromSession()` essaie déjà de normaliser les deux cas, mais la logique est répartie entre plusieurs couches et n’est pas unique.

### 1.3 Profil candidat

Le profil candidat est appelé via :

- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- `getCandidateProfileByUserId(userId)`

Ce chargement est déclenché dans le contexte global `AuthProvider`, même pour un utilisateur admin. Cela viole le principe d’une authentification globale indépendante du profil candidat.

### 1.4 Guards

Les guards sont dans :

- [src/features/authentication/guards/AuthenticationGuard.tsx](src/features/authentication/guards/AuthenticationGuard.tsx)
- [src/features/authentication/guards/RoleGuard.tsx](src/features/authentication/guards/RoleGuard.tsx)
- [src/features/authentication/guards/PermissionGuard.tsx](src/features/authentication/guards/PermissionGuard.tsx)
- [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx)

Ils font actuellement :

- lecture de `useAuth` / `useRoles` / `usePermissions`
- logique de chargement locale
- redirection conditionnelle
- attente de `rolesResolved`
- et pour `usePermissions`, dépendance implicite au profil candidat (`profile`)

## 2) Problèmes identifiés

### 2.1 Plusieurs sources de setState pendant l’initialisation

Dans [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx), l’initialisation appelle plusieurs fois des setters répartis sur plusieurs états :

- `setSession(...)`
- `setProfile(...)`
- `setRolesResolved(...)`
- `setIsLoading(...)`
- `setIsProfileLoading(...)`
- `setError(...)`

Le problème n’est pas la présence de setters en soi ; c’est le fait qu’il y a plusieurs chemins d’initialisation concurrentiels :

- init via `getSession()`
- init via `onAuthStateChange`
- init via `refreshSession()`
- init via `login()`
- init via `logout()`

Le même `Session` peut donc être réécrit plusieurs fois avec des valeurs intermédiaires, notamment lorsque `resolveSessionRolesSafely()` retourne un `Session` modifié puis que le `useEffect` de profil relance une autre branche d’état.

### 2.2 Boucles de rendu / effet

Les boucles potentielles viennent du couplage suivant :

- AuthContext met à jour `session`
- un `useEffect` écoute `session.user.id`
- ce `useEffect` charge le profil candidat
- le contexte fournit `profile` et `isProfileLoading`
- `usePermissions` dépend de `profile` et de `roles`
- `PermissionGuard` et `AuthenticationGuard` re-rendent selon `loading` / `rolesResolved`
- certains composants de route ou pages déclenchent de nouveau `setState` ou redirections

Le point de cycle critique est :

component -> effect/hook -> setState -> render -> effect/hook -> setState

Cela est visible notamment dans le couplage global :

- `AuthProvider` -> `session` + `profile` + `rolesResolved`
- `usePermissions` -> `loading` dépend de `isProfileLoading` et de `profile`
- `ProtectedRoute` -> `AuthenticationGuard` / `RoleGuard` / `PermissionGuard`
- `App` -> `SharedPublicRouteShell` vérifie `isLoading || isProfileLoading`

### 2.3 États redondants / inutiles

Les états suivants sont surchargés et non déterministes :

- `isLoading`
- `isProfileLoading`
- `rolesResolved`
- `roles`
- `permissions`

Le plus problématique est le mélange entre :

- statut d’auth global
- statut de résolution des rôles
- statut de chargement du profil candidat
- calcul des permissions

Ces états ne sont pas hiérarchisés. Certains composants attendent des rôles ou des permissions qui sont déjà dérivables immédiatement à partir du `session`.

### 2.4 `app_metadata.role` vs `app_metadata.roles`

La fonction `getAuthMetadataFromSession()` sait déjà traiter `role` OU `roles`, mais le contexte `AuthProvider` ajoute une autre convention :

- `resolveSessionRoles()` construit `incomingSession.user.app_metadata.roles = resolvedRoles`
- `getAuthMetadataFromSession()` lit à nouveau `app_metadata.roles`

Le résultat est un double-normalisation, avec des sources de vérité incohérentes :

- métadonnées du token utilisateur
- base `user_roles`
- contexte React local

Cela crée au moins deux formes légitimes de rôle dans le système.

### 2.5 Le candidat bloque l’admin

Le chargement du profil candidat est déclenché sans discriminer par route ni par besoin réel :

- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
- [src/App.tsx](src/App.tsx)

Un admin avec une session valide ne devrait pas attendre `getCandidateProfileByUserId()` pour accéder à `/admin`.

### 2.6 Deprecated / unsafe `setTimeout` initialization

Le fichier [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx) contient des robustesses temporaires qui masquent les vrais problèmes :

- `safetyTimer` 2500ms
- `Promise.race` sur `getSession()` avec timeout 5000ms
- `setTimeout(() => setSession(...), 0)` dans `onAuthStateChange`
- `resolveSessionRolesSafely` avec `setTimeout` 2500ms

Ces mécanismes ne donnent pas une initialisation déterministe ; ils introduisent des états intermédiaires non reproductibles and peuvent masquer une boucle réelle.

### 2.7 Skeletons affichés par logique de guards

Les guards affichent explicitement un `DashboardLayoutSkeleton` quand :

- `isLoading`
- `!rolesResolved`
- `loading` de `usePermissions`
- `session && !rolesResolved`

Cela est cohérent avec le symptôme “/admin affiche toujours un skeleton” : la condition principale de skeleton est dans le guard, pas dans la page elle-même.

### 2.8 Redirection prématurée / en boucle

Dans `AuthenticationGuard`, `RoleGuard`, `PermissionGuard`, les conditions font :

- montrer un skeleton pendant la résolution
- puis rediriger si `!user` ou si `!hasAllowedRole` ou si `!hasAccess`

Le problème vient du fait que la résolution des rôles et les permissions ne sont pas synchrones avec l’état global initial. Le guard se comporte comme un second système d’initialisation, alors qu’il ne doit lire qu’un état déjà validé.

## 3) Boucles potentielles détaillées

### 3.1 Boucle d’initialisation auth

La boucle principale est :

1. `AuthProvider` démarre
2. `getSession()` retourne une session
3. `setSession(session)`
4. `session` change
5. `useEffect([session?.user?.id])` s’exécute
6. `getCandidateProfileByUserId(session.user.id)` démarre
7. `profile` change
8. `usePermissions` recalculent `loading` / `permissions`
9. `PermissionGuard` / `AuthenticationGuard` re-rendent
10. plus d’état global change de manière cascadée

### 3.2 Boucle par `rolesResolved`

La logique actuelle fait :

- `setRolesResolved(false)`
- puis `resolveSessionRolesSafely()`
- puis `setRolesResolved(true)`

ce qui crée plusieurs transitions sur un seul état technique. Tandis que les guards attendent `rolesResolved`, le flux devient dépendant d’un état intermédiaire qui n’est pas un véritable point de vérité.

### 3.3 Boucle par `profile` dans `usePermissions`

`usePermissions()` dépend de :

- `profile`
- `claimedPermissions`
- `roles`
- `isProfileLoading`

Or `claimedPermissions` et `roles` peuvent être calculés sans `profile`, alors que le code fait dépendre la logique de chargement du profil candidat. Cela crée un faux besoin de chargement pour tout access check, ce qui est une cause directe des skeletons et des redirections spontanées.

## 4) États inutiles / surchargés

### 4.1 `rolesResolved`

C’est un bon concept fonctionnel, mais il est utilisé comme un état d’éditeur de flux et pas comme un état de vérité métier. Il mélange :

- initialisation de la session
- résolution des rôles
- synchronisation des guards

Le bon modèle est plus simple : `authLoading` + `rolesResolved` (ou une structure équivalente) comme étape d’initialisation claire.

### 4.2 `isProfileLoading`

Il ne devrait pas être dans l’état global pour l’authentification. Il relève du besoin fonctionnel candidat, pas de la sécurité globale appliquée à `/admin`.

### 4.3 `isLoading`

Le `isLoading` du contexte est utilisé à la fois pour :

- initialiser l’auth
- refléter la session
- signaler les chargements auxiliaires

Il devient une valeur trop générale, et cela explique pourquoi les guards font des rendus de “skeleton” pour quelque chose qui n’est pas du chargement auth.

## 5) Responsabilités de chaque composant

### `AuthContext`

Responsabilité :

- lire la session Supabase
- exposer `user`, `session`, `roles`, `permissions`, `authLoading`
- avoir une initialisation simple et déterministe
- ne pas charger le profil candidat pour décider de l’accès admin

Ce composant ne devrait pas devenir un orchestrateur de tous les sous-systèmes candidats.

### `getAuthMetadataFromSession()`

Responsabilité :

- lire session.user.app_metadata
- normaliser `role` ou `roles`
- produire un snapshot de rôle / permissions

Elle ne doit pas incorporer de logique de chargement, de navigation, ou de profil candidat.

### `resolveSessionRoles()`

Responsabilité :

- convertir les rôles du token et `user_roles` en un tableau homogène
- retourner un résultat normalisé

Il ne doit pas :

- déclencher un second flux d’état React
- mettre à jour `session`
- lancer un `setState` dans les guards

### `getCandidateProfileByUserId()`

Responsabilité :

- récupérer le profil du candidat par `user_id`
- être appelé uniquement quand un composant candidat en a besoin

Ce n’est pas un prérequis pour `AuthProvider` ou pour `/admin`.

### `useRoles` / `usePermissions`

Responsabilité actuelle :

- lisent le contexte
- calculent le résultat à partir des rôles/permissions du contexte

Ils ne doivent pas réintroduire de logique réseau, ni dépendre du profil candidat pour les checks admin globaux.

### `AuthenticationGuard`

Responsabilité :

- vérifier si l’auth est initialisée
- vérifier si `user` existe
- renvoyer une redirection si non authentifié

Il ne doit pas :

- faire de la logique de rôle
- récupérer le profil
- lancer des requêtes
- faire de l’async
- attendre `rolesResolved` et `profile` pour un non-auth check

### `RoleGuard`

Responsabilité :

- lire `roles` déjà déterminés
- comparer avec `allowedRoles`
- autoriser ou rediriger

Aucune logique d’init async extra.

### `PermissionGuard`

Responsabilité :

- lire `permissions` déjà calculées
- vérifier `requiredPermissions`
- autoriser / refuser

Le calcul doit se faire depuis le token et les rôles, pas depuis le profil candidat, sauf cas fonctionnel spécifique.

### `ProtectedRoute`

Responsabilité :

- orchestrer la composition des guards
- ne pas cacher d’init extra

## 6) Proposition d’architecture simplifiée

### 6.1 Cible

Supabase session
↓
AuthContext
↓
user + roles + permissions
↓
Guards
↓
Pages

### 6.2 Règles clés

1. `AuthProvider` initialise une seule fois.
2. `getSession()` est l’unique point d’entrée de démarrage.
3. Si `session` est `null`, l’état est `authenticated = false` et `authLoading = false`.
4. Si `session` existe, `authenticated = true` et on stocke `session` / `user` immédiatement.
5. Les rôles sont normalisés immédiatement.
6. L’état d’auth est déterministe : pas de “loading infini”, pas de sécurité par timeout caché.
7. Le profil candidat est chargé seulement quand une route candidate en a besoin.
8. `/admin` ne dépend plus de `getCandidateProfileByUserId()`.
9. `PermissionGuard` n’attend pas le profil candidat pour vérifier `dashboard.admin`.
10. `RoleGuard` ne réexécute pas l’initialisation.

### 6.3 Normalisation unique des rôles

Une seule logique doit faire l’acceptation et la conversion :

- `app_metadata.role = "super_admin"`
- ou `app_metadata.roles = ["super_admin"]`

devient toujours

- `roles = ["super_admin"]`

et les valeurs acceptées restent uniquement :

- `super_admin`
- `admin`
- `editor`

Le guard ne sait rien du format interne Supabase ; il reçoit simplement `roles[]`.

### 6.4 Contrat de sécurité

Le contexte exposera une structure simple comme :

- `session`
- `user`
- `roles`
- `permissions`
- `authLoading`
- `rolesResolved`
- `isAuthenticated`

et éventuellement `profile` uniquement si nécessaire.

### 6.5 Rôle des guards

Les guards ne doivent ni :

- appeler Supabase
- charger le profil
- résoudre des rôles
- faire des requêtes async
- mettre à jour le contexte

Ils doivent uniquement lire :

- `authLoading`
- `user`
- `rolesResolved`
- `roles`
- `permissions`

## 7) Confirmation du routing admin

La route principale admin est actuellement :

- `/admin`

et c’est la route index qui rend `AdminHomePage` dans [src/App.tsx](src/App.tsx).

Ce choix est cohérent avec la structure actuelle et ne nécessite pas de “masquage” via `/admin/dashboard`.

La structure cible reste donc :

- `/admin` → `AdminPage` / `AdminHomePage`
- `/admin/jobs`
- `/admin/candidates`
- `/admin/users` (si existante selon le schéma du projet)
- `/admin/settings`

En l’état, il n’y a pas de nécessité technique à créer `/admin/dashboard` simplement pour contourner le bug d’auth.

## 8) Problème candidat critique : “Maximum update depth exceeded”

Le symptôme sur `/candidate/dashboard` doit être traité comme un bug d’architecture, pas comme un simple incident de UI.

Le cycle probable est :

1. contexte auth change d’état
2. route / candidate déclenche un `useEffect`
3. le paquet de hooks (candidate profile / permissions / session) met à jour un state
4. le rendu reprend
5. un autre hook dépendant de cet état relance une mise à jour
6. et ainsi de suite jusqu’à overflow

Les familles à surveiller pour la cause racine sont exactement celles citées dans la demande :

- `AuthContext`
- `useAuth`
- `useRoles`
- `usePermissions`
- `guards`
- profil candidat
- session
- roles
- permissions

La vraie correction ne consiste pas à masquer la boucle avec un délai ou un “setTimeout”, mais à supprimer la logique qui fait de l’auth la source d’un second cycle d’initialisation.

## 9) Conclusion

Le système actuel a accumulé plusieurs couches de chargement et de normalisation qui se chevauchent :

- authentification globale
- initialisation de rôle
- garde de route
- calcul de permissions
- chargement du profil candidat

Cette complexité n’est ni nécessaire ni stable. Le correctif doit revenir à une implémentation simple, déterministe et linéaire :

- session Supabase
- AuthContext
- user + roles + permissions
- guards
- pages

Sans boucle, sans timeout de masquage, sans dépendance inutile au profil candidat.

## 10) Plan de reconstruction recommandé

1. Supprimer les gardes de chargement asynchrones dans les guards.
2. Simplifier `AuthContext` à un seul flux d’initialisation depuis `getSession()`.
3. Normaliser les rôles en une seule fonction unique.
4. Déconnecter le profil candidat du flux d’authentification globale.
5. Garder `PermissionGuard` sur la base des rôles et permissions du token.
6. Redéfinir `ProtectedRoute` comme composition statique de guards sans logique de requête.
7. Vérifier `/admin` sur session restaurée au F5.
8. Vérifier `/candidate/dashboard` sans boucle de mise à jour.

---

Document d’audit préparé pour la reconstruction de l’architecture auth / guards.
