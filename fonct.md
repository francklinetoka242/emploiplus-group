# Fonctionnement technique actuel de l’authentification, des rôles et du chargement des données utilisateur

Ce document décrit le fonctionnement actuel du système d’authentification, de gestion des rôles et de chargement des données utilisateur dans ce projet, en s’appuyant uniquement sur le code présent dans le dépôt.

## 1. Vue d’ensemble du système

L’architecture actuelle repose sur trois couches distinctes :

1. Supabase Auth pour la session utilisateur et la connexion/déconnexion.
2. Des hooks React personnalisés pour récupérer et transformer la session, les rôles, les permissions et le profil candidat.
3. Des guards de route React Router qui bloquent l’accès aux pages protégées selon l’état de la session, des rôles et des permissions.

Il n’existe pas de provider global dédié à l’authentification ou aux permissions. Les données sont principalement gérées par des hooks locaux avec état React et par des appels directs à Supabase.

---

## 2. Flux d’authentification complet

### 2.1 Initialisation au démarrage de l’application

Le point d’entrée principal est [src/App.tsx](src/App.tsx).

Au montage de l’application, un effet exécute une vérification de la session restaurée via Supabase :

- appel à `supabase.auth.getSession()`
- si une session est présente mais que l’email n’est pas confirmé, la session est effacée avec `supabase.auth.signOut()`
- des clés de stockage liées à Supabase sont également supprimées dans le stockage local/session

Cette logique empêche une session non confirmée de rester active après un rechargement.

### 2.2 Connexion candidat

La page de connexion candidat est [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx).

Le flux est le suivant :

1. L’utilisateur soumet le formulaire de connexion.
2. La page appelle `login(email, password)` depuis [src/features/authentication/hooks/useAuth.ts](src/features/authentication/hooks/useAuth.ts).
3. `useAuth` délègue au service [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts).
4. `loginCandidate()` appelle `supabase.auth.signInWithPassword({ email, password })`.
5. Le code vérifie ensuite si l’email est confirmé :
   - si l’email n’est pas confirmé, l’utilisateur est déconnecté immédiatement et une erreur spécifique `EMAIL_NOT_CONFIRMED` est levée.
   - si l’email est confirmé, la connexion est acceptée.
6. Après la connexion, `useAuth` récupère une session fraîche via `getCandidateSession()`.
7. La session est stockée localement dans l’état `session` du hook.
8. La page effectue ensuite une redirection vers `/candidate/dashboard` par défaut.

### 2.3 Écoute des changements d’état d’authentification

Dans [src/features/authentication/hooks/useAuth.ts](src/features/authentication/hooks/useAuth.ts), `useAuth()` s’abonne à `supabase.auth.onAuthStateChange(...)`.

Cela permet de réagir aux événements d’authentification tels que :

- connexion
- déconnexion
- changement de session

Le hook met à jour son état interne `session` en conséquence.

### 2.4 Chargement du profil candidat après la session

Le hook [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) est utilisé pour charger le profil candidat lié à la session active.

Son flux est :

1. Il récupère la session via `getCandidateSession()`.
2. Si aucune session n’existe, il met `profile` à `null`.
3. Si une session existe, il interroge la table `candidates` via `getCandidateProfileByUserId(session.user.id)`.
4. Le résultat est stocké dans l’état local `profile`.

Le chargement du profil est donc dépendant de la session Supabase. C’est la première donnée “métier” chargée après l’authentification.

### 2.5 Rendu final des pages protégées

Les pages protégées sont enveloppées dans des guards de route définis dans [src/features/authentication/guards](src/features/authentication/guards).

Le flux est généralement le suivant :

1. `AuthenticationGuard` vérifie que `useAuth()` a une session active.
2. Si des rôles sont requis, `RoleGuard` vérifie les rôles via `useRoles()`.
3. Si des permissions sont requises, `PermissionGuard` vérifie les permissions via `usePermissions()`.
4. Si l’accès est refusé, la route redirige vers un chemin de secours (`/candidate/login` ou `/auth`).

Le composant composite `ProtectedRoute` orchestre ce mécanisme dans [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx).

---

## 3. Architecture des hooks et guards

### 3.1 `AuthenticationGuard`

Implémentation : [src/features/authentication/guards/AuthenticationGuard.tsx](src/features/authentication/guards/AuthenticationGuard.tsx).

Son rôle est simple :

- il consomme `useAuth()`
- affiche un écran de chargement pendant la résolution de la session
- redirige vers le fallback si aucune session n’est présente

Cette garde est la première barrière de sécurité et ne dépend pas des rôles ni des permissions.

### 3.2 `RoleGuard`

Implémentation : [src/features/authentication/guards/RoleGuard.tsx](src/features/authentication/guards/RoleGuard.tsx).

Ce guard :

- utilise `useRoles()`
- vérifie si un des rôles autorisés est présent dans la liste des rôles récupérés
- affiche un état de chargement pendant la vérification
- en cas d’échec, redirige vers le fallback

Il contient également une logique de secours : si `useRoles()` ne retourne pas encore de rôle alors que la session existe, il relance une requête directe à Supabase avec `supabase.from("user_roles").select("role").eq("user_id", userId)`.

### 3.3 `PermissionGuard`

Implémentation : [src/features/authentication/guards/PermissionGuard.tsx](src/features/authentication/guards/PermissionGuard.tsx).

Ce guard :

- utilise `usePermissions()`
- calcule si l’utilisateur possède les permissions nécessaires
- supporte deux modes :
  - `requireAll = true` : toutes les permissions sont requises
  - `requireAll = false` : au moins une permission suffit
- en cas d’échec, redirige vers le fallback et transmet des informations d’erreur via l’état du router

### 3.4 `ProtectedRoute`

Implémentation : [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx).

`ProtectedRoute` compose les trois gardes dans l’ordre suivant :

1. `AuthenticationGuard`
2. `RoleGuard` si `allowedRoles` est fourni
3. `PermissionGuard` si `requiredPermissions` est fourni

Il agit comme un orchestrateur de sécurité à la racine des routes protégées.

---

## 4. Fonctionnement détaillé des hooks

### 4.1 `useAuth()`

Implémentation : [src/features/authentication/hooks/useAuth.ts](src/features/authentication/hooks/useAuth.ts).

Ce hook gère :

- un état `session` initialement à `null`
- un état `loading` initialement à `true`
- un état `error`

À son montage :

- il exécute immédiatement `refreshSession()`
- il enregistre un listener Supabase pour les changements d’état d’authentification

Méthodes exposées :

- `refreshSession()` : récupère la session courante via `authApi.getCandidateSession()`
- `login()` : exécute la connexion et refait une récupération de session
- `signup()` : inscrit un utilisateur via Supabase Auth
- `logout()` : déconnecte l’utilisateur

Le hook n’utilise pas de contexte React et n’est pas partagé au niveau global. Chaque composant qui appelle `useAuth()` obtient sa propre instance locale de l’état.

### 4.2 `useRoles()`

Implémentation : [src/features/authentication/hooks/useRoles.ts](src/features/authentication/hooks/useRoles.ts).

Ce hook dépend de `useAuth()`.

Son comportement est le suivant :

1. Il attend une `session.user.id`.
2. Si aucune session n’existe, il remet les rôles à une liste vide et termine.
3. Sinon, il exécute une requête Supabase sur la table `user_roles` :
   - `select("id,user_id,role,created_at,is_active")`
   - `eq("user_id", session.user.id)`
4. Les résultats sont filtrés pour ne conserver que les rôles suivants :
   - `super_admin`
   - `admin`
   - `editor`
5. Les rôles filtrés sont stockés dans l’état local `roles`.

Le hook expose :

- `roles`
- `loading`
- `error`
- `hasRole(role)`
- `isStaff` (vrai si la liste de rôles n’est pas vide)

Important : le code ne gère actuellement que les rôles “administratifs” de la table `user_roles`. Les rôles comme `candidate`, `recruiter`, etc. ne sont pas utilisés dans ce hook pour la détection des accès admin.

### 4.3 `usePermissions()`

Implémentation : [src/features/authentication/hooks/usePermissions.ts](src/features/authentication/hooks/usePermissions.ts).

Ce hook dépend à la fois de :

- `useRoles()`
- `useCandidate()`

Son fonctionnement est :

1. Il récupère les rôles depuis `useRoles()`.
2. Il récupère le profil candidat via `useCandidate()`.
3. Il transforme chaque rôle en permissions via `getPermissionsForRole(role)`.
4. S’il existe un profil candidat, il ajoute aussi les permissions du rôle `candidate`.
5. Les permissions sont dédupliquées avec un `Set`.

Le résultat est une liste de permissions qui sert ensuite à `PermissionGuard`.

### 4.4 `useCandidate()`

Implémentation : [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts).

C’est le hook principal de chargement du profil candidat.

Il effectue deux opérations clés :

- récupération de la session via `getCandidateSession()`
- chargement du profil lié à cette session via `getCandidateProfileByUserId(session.user.id)`

Il expose :

- `profile`
- `loading`
- `error`
- `logout()`
- `updateProfile()`
- `refetch()`
- `isAuthenticated`

Le hook est largement utilisé dans les pages candidat, mais aussi dans les guards de routage candidat et dans la shell publique.

### 4.5 Hooks dérivés autour du profil candidat

Outre `useCandidate()`, plusieurs hooks secondaires chargent des sous-ensembles de données liées au profil candidat :

- [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)
- [src/features/profile/hooks/useCandidateSkills.ts](src/features/profile/hooks/useCandidateSkills.ts)
- [src/features/profile/hooks/useCandidateExperiences.ts](src/features/profile/hooks/useCandidateExperiences.ts)
- [src/features/profile/hooks/useCandidateEducation.ts](src/features/profile/hooks/useCandidateEducation.ts)
- [src/features/profile/hooks/useCandidateLanguages.ts](src/features/profile/hooks/useCandidateLanguages.ts)
- [src/features/profile/hooks/useCandidatePreferences.ts](src/features/profile/hooks/useCandidatePreferences.ts)
- [src/features/profile/hooks/useCandidateDocuments.ts](src/features/profile/hooks/useCandidateDocuments.ts)

Ces hooks ne font pas partie du flux d’authentification principal, mais ils montrent que le profil candidat est utilisé comme base pour charger ensuite des données métier plus détaillées.

---

## 5. Dépendances en cascade entre les requêtes

Le graphe de dépendances actuel peut être résumé comme suit :

1. `useAuth()`
   - dépend directement de Supabase Auth
   - charge la session

2. `useRoles()`
   - dépend de `useAuth()`
   - attend une session utilisateur
   - exécute ensuite une requête sur `user_roles`

3. `useCandidate()`
   - dépend de l’API d’authentification et de l’API de profil candidat
   - attend la session utilisateur pour charger le profil dans `candidates`

4. `usePermissions()`
   - dépend de `useRoles()` et de `useCandidate()`
   - ne peut produire une liste de permissions cohérente qu’après avoir obtenu à la fois les rôles et le profil candidat

5. `PermissionGuard`
   - dépend de `usePermissions()`
   - ne peut vérifier l’accès qu’après que les rôles et le profil candidat aient été chargés

6. `ProtectedRoute`
   - dépend de `AuthenticationGuard`, `RoleGuard` et `PermissionGuard`
   - ne rend la route protégée qu’après que toutes ces vérifications aient été satisfaites

En pratique, la cascade est donc :

- session Supabase → profil candidat → rôles → permissions → autorisation de route

---

## 6. Cartographie des appels Supabase

### 6.1 Authentification et session

Fichiers concernés :

- [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts)
- [src/features/authentication/hooks/useAuth.ts](src/features/authentication/hooks/useAuth.ts)

Appels utilisés :

- `supabase.auth.signInWithPassword()`
- `supabase.auth.signUp()`
- `supabase.auth.signOut()`
- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange()`
- `supabase.auth.updateUser()`

Ces appels ne dépendent pas directement de la table `user_roles` ni de `candidates` ; ils gèrent la session Supabase elle-même.

### 6.2 Rôles administratifs

Fichiers concernés :

- [src/features/authentication/hooks/useRoles.ts](src/features/authentication/hooks/useRoles.ts)
- [src/features/authentication/guards/RoleGuard.tsx](src/features/authentication/guards/RoleGuard.tsx)
- [src/pages/public/AuthPage.tsx](src/pages/public/AuthPage.tsx)

Table requêtée :

- `user_roles`

Colonnes lues dans le code :

- `id`
- `user_id`
- `role`
- `created_at`
- `is_active`

Le filtre utilisé est toujours `eq("user_id", session.user.id)` ou `eq("user_id", userId)`.

### 6.3 Profil candidat

Fichiers concernés :

- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
- [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)

Table requêtée :

- `candidates`

Le code utilise deux variantes de lecture :

- `.eq("id", candidateId)`
- `.eq("user_id", userId)`

Le chargement se fait avec `.maybeSingle()`.

Les colonnes sélectionnées sont :

- `id`
- `user_id`
- `first_name`
- `last_name`
- `email`
- `phone`
- `avatar_url`
- `bio`
- `headline`
- `location_city`
- `location_country`
- `date_of_birth`
- `status`
- `created_at`
- `updated_at`

### 6.4 Données métier complémentaires du candidat

D’autres hooks chargent ensuite des données liées au profil candidat dans des tables spécialisées, même si elles ne font pas partie du flux initial d’authentification. Elles sont utilisées dans les pages profil/candidature et sont appelées après le chargement du profil de base.

Exemples de fichiers :

- [src/features/profile/hooks/useCandidateSkills.ts](src/features/profile/hooks/useCandidateSkills.ts)
- [src/features/profile/hooks/useCandidateExperiences.ts](src/features/profile/hooks/useCandidateExperiences.ts)
- [src/features/profile/hooks/useCandidateEducation.ts](src/features/profile/hooks/useCandidateEducation.ts)
- [src/features/profile/hooks/useCandidateLanguages.ts](src/features/profile/hooks/useCandidateLanguages.ts)
- [src/features/profile/hooks/useCandidatePreferences.ts](src/features/profile/hooks/useCandidatePreferences.ts)

Ces hooks appellent la couche service [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts), qui elle-même délègue aux API de profil dans [src/features/candidates/api](src/features/candidates/api).

---

## 7. Gestion de l’état global et du cache

### 7.1 Absence de store global centralisé

Le code ne contient actuellement ni :

- React Query
- Zustand
- Redux
- Context d’authentification global

L’état est principalement local à chaque hook React.

### 7.2 Stockage des rôles et permissions

Les rôles sont stockés dans l’état local du hook `useRoles()`.

Les permissions sont calculées à partir de :

- la liste des rôles
- le profil candidat

Elles ne sont pas persistées dans un cache externe. Elles sont recalculées à chaque changement de dépendance.

### 7.3 Durée de vie des données

Le cycle de vie actuel est :

- `useAuth()` : durée de vie liée au composant qui l’appelle, avec subscription à Supabase Auth
- `useRoles()` : se relance quand l’ID utilisateur de la session change
- `useCandidate()` : se relance au montage du hook, puis lors de `refetch` ou de mise à jour du profil
- `usePermissions()` : se recalculera à chaque changement de `roles` ou `profile`

Il n’existe pas de mécanisme de revalidation explicite avec expiration ou invalidation manuelle. Le rechargement dépend de :

- un changement de session
- un montage/démontage du hook
- un appel explicite à `refetch()`

### 7.4 Cache implicite via Supabase

Le seul “cache” réellement pertinent dans le flux d’authentification est celui géré par Supabase Auth lui-même :

- la session peut être restaurée automatiquement après un rechargement
- cette session est stockée dans les mécanismes de stockage intégrés à Supabase

Le code du projet ne met pas en place un cache de rôles ou de permissions au-delà de l’état React local.

---

## 8. Points importants à retenir

- Le système d’authentification actuel est basé sur Supabase Auth et des hooks React locaux, pas sur un store global.
- Les rôles administratifs sont lus dans `user_roles`, mais le typage et le filtrage sont restreints à `super_admin`, `admin` et `editor`.
- Les permissions sont dérivées des rôles et du profil candidat, via [src/features/authentication/permissions/rolePermissions.ts](src/features/authentication/permissions/rolePermissions.ts).
- Le profil candidat est chargé depuis la table `candidates`, pas depuis une table `profiles` générique.
- Les guards de route sont le mécanisme final d’application des règles d’accès.
- Il n’existe pas de couche de cache React Query/Zustand/Redux dans le flux actuel présenté ici.
