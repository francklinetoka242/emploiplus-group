# Configuration actuelle de la sécurité

Ce document décrit l’architecture de sécurité actuellement présente dans le projet, telle qu’elle apparaît dans le code et les migrations Supabase. Il ne propose aucune nouvelle architecture et indique explicitement lorsqu’une information n’est pas présente.

## Sources consultées

- [src/App.tsx](../src/App.tsx)
- [src/components/candidate/ProtectedCandidateRoute.tsx](../src/components/candidate/ProtectedCandidateRoute.tsx)
- [src/pages/candidate/CandidateLayout.tsx](../src/pages/candidate/CandidateLayout.tsx)
- [src/pages/admin/AdminPage.tsx](../src/pages/admin/AdminPage.tsx)
- [src/pages/public/AuthPage.tsx](../src/pages/public/AuthPage.tsx)
- [src/pages/candidate/CandidateLoginPage.tsx](../src/pages/candidate/CandidateLoginPage.tsx)
- [src/hooks/useCandidate.ts](../src/hooks/useCandidate.ts)
- [src/features/candidates/hooks/useCandidate.ts](../src/features/candidates/hooks/useCandidate.ts)
- [src/features/authentication/api/authApi.ts](../src/features/authentication/api/authApi.ts)
- [src/features/candidates/api/profileApi.ts](../src/features/candidates/api/profileApi.ts)
- [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts)
- [src/components/site/PublicLayout.tsx](../src/components/site/PublicLayout.tsx)
- [supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql](../supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql)
- [supabase/migrations/20260702_create_candidates_table.sql](../supabase/migrations/20260702_create_candidates_table.sql)
- [src/integrations/supabase/types.ts](../src/integrations/supabase/types.ts)

## 1. Authentification

### Solution utilisée

L’authentification actuelle repose sur Supabase Auth.

- Le client Supabase est initialisé dans [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts).
- Les flux de connexion, déconnexion, récupération de session et gestion des erreurs passent par [src/features/authentication/api/authApi.ts](../src/features/authentication/api/authApi.ts).
- Les pages candidat utilisent cette couche d’API pour la connexion et l’inscription.

### Initialisation de l’authentification

L’authentification est initialisée au niveau du client Supabase, via `createClient` de `@supabase/supabase-js`.

Le client est construit à partir des variables d’environnement :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_ANON_KEY`
- et leurs variantes `process.env.*` côté SSR/Node si elles sont présentes

Le client est configuré avec :

- `persistSession: true`
- `autoRefreshToken: true`
- `storage: localStorage` côté navigateur

### Récupération de la session utilisateur

La session est récupérée via :

- `supabase.auth.getSession()`

Cette logique est utilisée dans :

- [src/features/authentication/api/authApi.ts](../src/features/authentication/api/authApi.ts) via `getCandidateSession()`
- [src/features/candidates/hooks/useCandidate.ts](../src/features/candidates/hooks/useCandidate.ts)
- [src/pages/admin/AdminPage.tsx](../src/pages/admin/AdminPage.tsx)
- [src/App.tsx](../src/App.tsx) au démarrage pour valider la session restaurée

### Maintien de la session

La session est maintenue par Supabase lui-même grâce à :

- la persistance dans le stockage local du navigateur
- le rafraîchissement automatique des tokens

Le comportement est défini dans [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts).

### Déconnexion

La déconnexion est réalisée via :

- `supabase.auth.signOut()`

Elle est appelée dans :

- [src/features/authentication/api/authApi.ts](../src/features/authentication/api/authApi.ts) via `logoutCandidate()`
- [src/features/candidates/hooks/useCandidate.ts](../src/features/candidates/hooks/useCandidate.ts)
- [src/pages/admin/AdminPage.tsx](../src/pages/admin/AdminPage.tsx)
- [src/App.tsx](../src/App.tsx) lors de la validation de session si l’email n’est pas confirmé

## 2. Structure actuelle des routes

### Routes publiques

Les routes publiques déclarées dans [src/App.tsx](../src/App.tsx) sont :

- `/`
- `/about`
- `/services`
- `/services/:slug`
- `/services/hub-emploi-recrutement/landing`
- `/jobs`
- `/jobs/:slug`
- `/blog`
- `/blog/:slug`
- `/contact`
- `/auth`
- `/candidate/login`
- `/candidate/signup`
- `/candidate/forgot-password`
- `/candidate/reset-password`
- `/candidate/confirm`
- `*` (fallback 404)

### Routes protégées

Les routes protégées sont principalement les routes du candidat et les routes d’administration.

Routes candidat protégées :

- `/candidate`
- `/candidate/dashboard`
- `/candidate/profile`
- `/candidate/documents`
- `/candidate/profile/edit`
- `/candidate/applications`
- `/candidate/applications/:id`
- `/candidate/saved-offers`
- `/candidate/notifications`
- `/candidate/settings`
- `/candidate/jobs/:slug/apply`
- `/candidate/public`
- `/candidate/public/services`
- `/candidate/public/jobs`
- `/candidate/public/blog`
- `/candidate/public/about`
- `/candidate/public/contact`

Routes admin :

- `/admin`
- `/admin/jobs`
- `/admin/jobs/new`
- `/admin/blog`
- `/admin/blog/new`
- `/admin/candidates`
- `/admin/notifications`
- `/admin/seo`
- `/admin/team`

### Layouts utilisés

Les layouts présents dans l’architecture actuelle sont :

- `PublicLayout` dans [src/components/site/PublicLayout.tsx](../src/components/site/PublicLayout.tsx)
- `CandidateLayout` dans [src/pages/candidate/CandidateLayout.tsx](../src/pages/candidate/CandidateLayout.tsx)
- `AdminPage` dans [src/pages/admin/AdminPage.tsx](../src/pages/admin/AdminPage.tsx)

### Organisation des routes

L’organisation est centralisée dans [src/App.tsx](../src/App.tsx).

Le routage suit trois familles principales :

1. Les routes publiques, rendues dans un shell public partagé.
2. Les routes candidat, protégées par `ProtectedCandidateRoute`.
3. Les routes admin, rendues dans un layout d’administration.

Le shell public est géré par `SharedPublicRouteShell`, qui bascule entre un rendu public et un rendu candidat selon la présence d’un profil candidat chargé.

## 3. ProtectedCandidateRoute

### Rôle

`ProtectedCandidateRoute` est le garde de navigation principal pour l’espace candidat.

Son rôle est de :

- vérifier si un profil candidat est chargé
- bloquer l’accès à une route protégée si aucun profil n’est disponible
- rediriger vers `/candidate/login` lorsqu’il n’y a pas de profil candidat

### Fonctionnement

Le composant est défini dans [src/components/candidate/ProtectedCandidateRoute.tsx](../src/components/candidate/ProtectedCandidateRoute.tsx).

Le flux est le suivant :

- il récupère `profile` et `loading` via `useCandidate()`
- si `loading` est vrai, il affiche un état de chargement avec des squelettes
- si `profile` est absent, il retourne `<Navigate to="/candidate/login" replace />`
- sinon, il affiche les enfants dans un `CandidateSidebarProvider`

### Fichiers utilisés

- [src/components/candidate/ProtectedCandidateRoute.tsx](../src/components/candidate/ProtectedCandidateRoute.tsx)
- [src/hooks/useCandidate.ts](../src/hooks/useCandidate.ts)
- [src/features/candidates/hooks/useCandidate.ts](../src/features/candidates/hooks/useCandidate.ts)
- [src/contexts/CandidateSidebarContext.tsx](../src/contexts/CandidateSidebarContext.tsx)

### Hooks utilisés

- `useCandidate()`

### Contextes utilisés

- `CandidateSidebarProvider` depuis [src/contexts/CandidateSidebarContext.tsx](../src/contexts/CandidateSidebarContext.tsx)

### Flux complet depuis l’ouverture d’une route jusqu’à l’affichage

```text
Utilisateur ouvre une route candidat
        ↓
ProtectedCandidateRoute s’exécute
        ↓
useCandidate() charge le profil courant
        ↓
getCandidateSession() récupère la session Supabase
        ↓
si la session est absente ou invalide → redirection vers /candidate/login
        ↓
si un profil candidat est disponible → rendu des enfants
        ↓
CandidateLayout est utilisé pour l’affichage de l’espace candidat
```

### Point important

La vérification principale n’est pas un contrôle de rôle, mais la présence d’un profil candidat chargé.

## 4. Gestion des utilisateurs

### Identification de l’utilisateur

L’utilisateur est identifié via l’authentification Supabase :

- `session.user.id` est l’identifiant de l’utilisateur Auth Supabase
- la table candidat référence cet utilisateur via la colonne `user_id`

### Stockage des informations du candidat

Les informations de profil candidat sont stockées dans la table `public.candidates`.

### Récupération du profil

Le profil candidat est récupéré via les fonctions de [src/features/candidates/api/profileApi.ts](../src/features/candidates/api/profileApi.ts).

Le hook [src/features/candidates/hooks/useCandidate.ts](../src/features/candidates/hooks/useCandidate.ts) appelle `getCandidateSession()` puis essaie de récupérer le profil associé.

### Tables Supabase utilisées

La table principale utilisée pour le profil candidat est :

- `public.candidates`

D’autres tables liées existent aussi, notamment :

- `public.candidate_skills`
- `public.candidate_experience`
- `public.candidate_education`

### Colonnes utilisées pour identifier un candidat

Dans la table `public.candidates`, les colonnes pertinentes sont :

- `id`
- `user_id`
- `email`

Le schéma de la migration indique que :

- `id` est la clé primaire du candidat
- `user_id` est une clé unique qui référence `auth.users(id)`

## 5. Gestion des rôles

Le projet possède bien un système de rôles côté base de données Supabase.

### Éléments présents

- `role` : présent dans la table `public.user_roles`
- `user_roles` : table dédiée aux rôles d’utilisateur
- `app_role` : enum défini dans Supabase avec les valeurs `super_admin`, `admin`, `editor`
- `has_role()` : fonction SQL
- `is_staff()` : fonction SQL

### Éléments absents ou non utilisés pour la sécurité de route

Les éléments suivants ne semblent pas être utilisés comme mécanisme central de protection des routes dans l’architecture actuelle :

- `user_type`
- `profile_type`
- `account_type`
- `permissions`

Aucun système de permissions explicite et centralisé de type `permissions` n’est visible dans le code de routage et de guards actuels.

## 6. Permissions actuelles

### Qui peut accéder à quoi

#### Pages publiques

Tout visiteur peut accéder à :

- la page d’accueil
- les pages de services
- les pages d’offres
- le blog
- la page contact
- la page d’authentification générale `/auth`
- les pages de connexion/inscription candidat

#### Pages protégées candidat

L’accès aux pages candidat dépend de la présence d’un profil candidat chargé.

En pratique, cela signifie :

- un utilisateur connecté via Supabase et chargé dans le profil candidat peut voir l’espace candidat
- si le profil n’est pas present, la navigation redirige vers `/candidate/login`

#### Pages admin

L’accès aux pages admin repose sur la présence d’une session Supabase.

La page [src/pages/admin/AdminPage.tsx](../src/pages/admin/AdminPage.tsx) vérifie `supabase.auth.getSession()`.

Si aucune session n’est présente, elle affiche un écran de protection avec un lien vers `/auth`.

### Vérifications réalisées

Les vérifications observées sont les suivantes :

- vérification de session Supabase via `getSession()`
- vérification de l’email confirmé avant d’autoriser l’accès ou de maintenir une session
- vérification de la présence d’un profil candidat via `useCandidate()`
- redirection vers `/candidate/login` si le profil n’est pas chargé
- affichage d’un écran de protection pour l’admin si aucune session n’est présente

### Ce qui n’est pas observé

Aucune protection de route basée sur :

- plusieurs rôles distincts
- une hiérarchie de permissions
- un middleware global
- un système de guards centralisé par permission

## 7. Diagramme d’architecture

```text
Visiteur
  ↓
Authentification (Supabase Auth)
  ↓
ProtectedCandidateRoute
  ↓
CandidateLayout
  ↓
Pages Candidate
```

## 8. Dépendances

Liste des fichiers et composants impliqués dans la sécurité actuelle.

### Routes

- [src/App.tsx](../src/App.tsx) : déclarations des routes publiques, candidat et admin

### Authentification

- [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts) : initialisation du client Supabase
- [src/features/authentication/api/authApi.ts](../src/features/authentication/api/authApi.ts) : connexion, déconnexion, session, confirmation email
- [src/pages/public/AuthPage.tsx](../src/pages/public/AuthPage.tsx) : écran d’authentification admin
- [src/pages/candidate/CandidateLoginPage.tsx](../src/pages/candidate/CandidateLoginPage.tsx) : écran de connexion candidat

### Hooks

- [src/hooks/useCandidate.ts](../src/hooks/useCandidate.ts) : façade vers le hook candidat
- [src/features/candidates/hooks/useCandidate.ts](../src/features/candidates/hooks/useCandidate.ts) : chargement du profil courant, déconnexion, rafraîchissement

### Contextes

- [src/contexts/CandidateSidebarContext.tsx](../src/contexts/CandidateSidebarContext.tsx) : contexte utilisé par le shell candidat

### Services / API

- [src/features/candidates/api/profileApi.ts](../src/features/candidates/api/profileApi.ts) : lecture et écriture du profil candidat dans `public.candidates`

### Layouts / shells

- [src/components/site/PublicLayout.tsx](../src/components/site/PublicLayout.tsx) : shell public
- [src/pages/candidate/CandidateLayout.tsx](../src/pages/candidate/CandidateLayout.tsx) : shell candidat
- [src/pages/admin/AdminPage.tsx](../src/pages/admin/AdminPage.tsx) : shell admin avec protection par session
- [src/components/candidate/ProtectedCandidateRoute.tsx](../src/components/candidate/ProtectedCandidateRoute.tsx) : garde candidat

### Base de données / Supabase

- [supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql](../supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql) : rôles et fonctions SQL d’admin
- [supabase/migrations/20260702_create_candidates_table.sql](../supabase/migrations/20260702_create_candidates_table.sql) : table candidat et politiques RLS
- [src/integrations/supabase/types.ts](../src/integrations/supabase/types.ts) : types TypeScript du schéma Supabase

## 9. Limites de l’architecture actuelle

L’architecture actuelle présente plusieurs limites structurelles.

### Ce qui est actuellement en place

- une authentification Supabase est bien présente
- des routes publiques, candidat et admin sont séparées
- un garde candidat existe pour les routes de l’espace candidat
- un shell admin protège l’accès par la présence d’une session Supabase
- un système de rôles existe côté base de données pour les administrateurs

### Ce qui empêcherait de gérer plusieurs rôles de manière fine

- les routes candidat sont protégées par la présence d’un profil candidat, pas par un système de rôles générique
- les routes admin sont protégées principalement par la présence d’une session, sans vérification explicite de rôle dans le composant de routage
- il n’existe pas, dans l’architecture visible, de mécanisme central de permissions par page ou par ressource
- le système de rôles observé est orienté vers la table `user_roles` et les fonctions SQL, mais il n’est pas appliqué comme un système de permission explicite dans les guards React du front

### Dépendances trop fortes

- le front dépend fortement du profil candidat chargé via `useCandidate()` pour autoriser l’accès à l’espace candidat
- la navigation publique et protégée est fortement couplée à la logique de `SharedPublicRouteShell`
- l’admin dépend de la session Supabase et non d’un mécanisme de rôles/permissions plus riche

### Points qui risquent de devenir problématiques

- la logique de protection devient plus fragile si plusieurs types d’utilisateurs doivent coexister
- la séparation entre “utilisateur Auth Supabase” et “profil candidat” est centrale et doit rester cohérente
- les rôles admin existent, mais la couche de routage ne semble pas encore utiliser un mécanisme unifié de permissions
- la présence d’un profil candidat est utilisée comme condition d’accès, ce qui peut devenir insuffisant si l’application doit évoluer vers plusieurs profils ou plusieurs niveaux d’accès

## 10. Conclusion

L’architecture actuelle fonctionne aujourd’hui autour de Supabase Auth, de la table `public.candidates` pour les profils candidat, et de la table `public.user_roles` pour les rôles d’administration.

Le système de sécurité actuel repose principalement sur :

- la session Supabase pour l’authentification générale
- la présence d’un profil candidat pour l’espace candidat
- la présence d’une session Supabase pour l’administration
- des politiques RLS et des fonctions SQL côté Supabase pour les données sensibles

En pratique, l’accès à l’espace candidat est aujourd’hui contrôlé par `ProtectedCandidateRoute`, tandis que l’accès à l’espace admin est contrôlé par la présence d’une session. Il n’existe pas, dans la structure actuelle visible dans le projet, de système de permissions générique et multi-rôles appliqué au niveau des routes front.
