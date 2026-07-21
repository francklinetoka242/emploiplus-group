# État actuel de l’application après la première phase d’optimisation

Date de synthèse : 2026-07-21

Ce document décrit l’état observé dans le code du dépôt à la date indiquée. Il se limite aux composants et hooks réellement présents dans l’application et ne repose pas sur une hypothèse de fonctionnement externe.

## 1. État de la session et des claims JWT

### Extraction actuelle des rôles et permissions

Les rôles et permissions ne sont plus dérivés d’une table SQL au moment du contrôle d’accès. L’application lit désormais directement les claims présents dans le JWT Supabase, via le payload `session.user.app_metadata`.

Le point d’extraction central est le helper suivant :

- `src/features/authentication/types/index.ts`
  - `getAuthMetadataFromSession(session)`

Ce helper:

- lit `session.user.app_metadata.roles` et `session.user.app_metadata.permissions`;
- filtre les valeurs pour ne conserver que des chaînes de caractères;
- ne conserve que les rôles autorisés par l’application (`super_admin`, `admin`, `editor`);
- ne conserve que les permissions connues de l’application parmi une liste fixée.

En pratique, la logique actuelle suppose que Supabase a déjà fourni les claims dans `app_metadata` au moment où la session est récupérée. Il n’existe pas, dans le chemin courant, de requête réseau supplémentaire pour reconstruire les rôles ou permissions à partir de `user_roles`.

### Où la session est initialisée / lue

Le flux actuel passe par :

- `src/features/authentication/hooks/useAuth.ts`
  - `useAuth()`
  - appelle `authApi.getCandidateSession()` à l’initialisation;
  - s’inscrit aussi à `supabase.auth.onAuthStateChange(...)` pour suivre les changements de session.

- `src/features/authentication/api/authApi.ts`
  - `getCandidateSession()`
  - appelle `supabase.auth.getSession()`.

Le rôle des claims dans ce flux est donc le suivant :

1. La session Supabase est récupérée par `getSession()`.
2. Les rôles et permissions sont ensuite lus de manière synchrone depuis `session.user.app_metadata`.
3. Les hooks d’authentification et de permissions s’appuient ensuite sur cette valeur sans faire de requête supplémentaire vers une table de rôles.

## 2. Cartographie des hooks revisités

### `useRoles()`

Fichier : `src/features/authentication/hooks/useRoles.ts`

État actuel :

- ne fait plus de requête réseau vers `user_roles`;
- s’appuie uniquement sur `useAuth()` pour récupérer la session;
- appelle `getAuthMetadataFromSession(session)` pour extraire les rôles depuis les claims JWT;
- retourne un objet contenant :
  - `roles`
  - `loading`
  - `error`
  - `hasRole()`
  - `isStaff`

Le hook est donc purement basé sur la session et les claims attendus dans `app_metadata`.

### `usePermissions()`

Fichier : `src/features/authentication/hooks/usePermissions.ts`

État actuel :

- ne fait plus non plus de requête réseau vers `user_roles`;
- combine trois sources de permissions :
  - permissions directement revendiquées dans les claims JWT (`authMetadata.permissions`);
  - permissions dérivées des rôles extraits du JWT via `getPermissionsForRole(role)`;
  - permissions de candidat dérivées du profil si un profil est chargé.
- utilise aussi `useCandidate()` pour connaître le profil candidat.

Le résultat est donc un calcul local à partir de la session et du profil, sans besoin d’interroger une table `user_roles` dans ce chemin.

### `useCandidate()`

Fichier : `src/features/candidates/hooks/useCandidate.ts`

État actuel :

- garde encore un comportement réseau au chargement de la page candidate;
- au montage, le hook exécute `loadCurrentProfile()` via `useEffect`;
- cette fonction exécute encore les requêtes suivantes :
  1. `getCandidateSession()`
     - appelle `supabase.auth.getSession()`;
  2. `getCandidateProfileByUserId(session.user.id)`
     - exécute une requête `select` sur la table `candidates` avec `eq("user_id", userId).maybeSingle()`.

En d’autres termes, le chargement du profil candidat reste encore asynchrone et dépend d’une requête base de données, même si les rôles et permissions n’en dépendent plus.

## 3. Graphe de dépendances et latences restantes

### Chemin critique actuel entre l’arrivée de l’utilisateur et l’affichage final

Le chemin critique observé dans le code est le suivant :

1. `App` / route protégée instancie `ProtectedRoute`.
2. `ProtectedRoute` passe par `AuthenticationGuard`.
3. Si l’utilisateur est authentifié, il atteint `PermissionGuard`.
4. `PermissionGuard` appelle `usePermissions()`.
5. `usePermissions()` appelle :
   - `useRoles()` pour lire les claims JWT depuis la session;
   - `useCandidate()` pour charger le profil candidat.
6. Une fois les états de session, claims et profil stabilisés, le rendu final du composant enfant peut s’afficher.

### Requêtes encore exécutées en série / de manière isolée

Les requêtes ou appels réseau encore présents dans ce chemin sont les suivants :

- `supabase.auth.getSession()`
  - exécuté par `useAuth()` via `authApi.getCandidateSession()`;
  - exécuté aussi par `useCandidate()` via `getCandidateSession()`.

- `supabase.from("candidates").select(...).eq("user_id", userId).maybeSingle()`
  - exécuté par `getCandidateProfileByUserId()`.

Ce point est important : la logique de rôles/permissions est désormais locale et synchrone, mais la route candidate reste encore dépendante d’un chargement de session puis d’un chargement de profil candidat.

### Absence de contexte global

Le code ne met en place aucun provider React global pour l’authentification, les rôles ou les permissions. Les hooks sont donc des hooks locaux qui gèrent leur propre état et leurs propres appels d’initialisation.

Conséquence directe :

- il n’existe pas de cache partagé entre `useAuth`, `useRoles`, `usePermissions` et `useCandidate`;
- chaque montage d’un composant consommateur peut déclencher un nouveau chargement de session/profil;
- la latence restante n’est pas uniquement liée aux claims JWT, mais aussi à l’absence d’un point d’état unique pour l’authentification et le profil candidat.

## 4. Expérience utilisateur actuelle (rendu et loader)

### Comportement actuel du composant `PermissionGuard`

Fichier : `src/features/authentication/guards/PermissionGuard.tsx`

Le comportement observé est le suivant :

- tant que `loading` vaut `true`, le composant rend un loader;
- par défaut, si aucun `loadingSkeleton` n’est passé, il affiche `DashboardLayoutSkeleton`;
- il ne montre pas actuellement de texte explicite de type “Vérification des permissions…” dans la branche par défaut.

### Comportement sur rafraîchissement F5 vs navigation interne

- Sur un rafraîchissement F5, le composant monte depuis zéro. Le cycle de chargement reprend donc depuis l’état initial :
  - `useAuth()` démarre avec `loading = true`;
  - `useCandidate()` démarre aussi avec son propre chargement de profil;
  - `PermissionGuard` affiche donc un skeleton pendant que la session et le profil se stabilisent.

- Sur une navigation interne dans l’application, le comportement dépend de l’état déjà présent dans la mémoire du navigateur et du montage du composant :
  - si la session et le profil sont déjà disponibles, le guard peut rendre rapidement sans afficher de loader;
  - si un nouveau montage force un nouveau chargement de profil via `useCandidate()`, alors le guard affiche à nouveau un skeleton.

En résumé, le point de vue UX actuel est le suivant :

- la vérification des permissions ne dépend plus d’une requête réseau vers `user_roles`;
- le rendu reste toutefois suspendu par les étapes asynchrones de session/profil;
- le loader visible par défaut est un skeleton global, pas un message textuel.
