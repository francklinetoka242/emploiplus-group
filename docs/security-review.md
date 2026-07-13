# Revue de sécurité de la couche de garde ajoutée

Ce document analyse uniquement les fichiers introduits pendant la migration de sécurité et leurs usages effectifs dans l’application. Il ne porte pas sur l’architecture legacy existante ni sur les autres modules d’authentification déjà présents.

## 1. Périmètre audité

Fichiers examinés :

- [src/features/authentication/guards/AuthenticationGuard.tsx](../src/features/authentication/guards/AuthenticationGuard.tsx)
- [src/features/authentication/guards/RoleGuard.tsx](../src/features/authentication/guards/RoleGuard.tsx)
- [src/features/authentication/guards/PermissionGuard.tsx](../src/features/authentication/guards/PermissionGuard.tsx)
- [src/features/authentication/guards/ProtectedRoute.tsx](../src/features/authentication/guards/ProtectedRoute.tsx)
- [src/features/authentication/hooks/useAuth.ts](../src/features/authentication/hooks/useAuth.ts)
- [src/features/authentication/hooks/useRoles.ts](../src/features/authentication/hooks/useRoles.ts)
- [src/features/authentication/hooks/usePermissions.ts](../src/features/authentication/hooks/usePermissions.ts)
- [src/features/authentication/permissions/roles.ts](../src/features/authentication/permissions/roles.ts)
- [src/features/authentication/permissions/permissions.ts](../src/features/authentication/permissions/permissions.ts)
- [src/features/authentication/permissions/rolePermissions.ts](../src/features/authentication/permissions/rolePermissions.ts)
- [src/App.tsx](../src/App.tsx)
- [src/components/candidate/ProtectedCandidateRoute.tsx](../src/components/candidate/ProtectedCandidateRoute.tsx)

## 2. État réel de l’implémentation

### 2.1 Composants de garde présents et fonctionnels

Les garde-fous suivants existent bien dans le code :

- AuthenticationGuard : vérifie la présence d’une session Supabase et redirige vers un fallback si nécessaire.
- RoleGuard : vérifie si l’utilisateur possède au moins un rôle autorisé parmi ceux fournis.
- PermissionGuard : vérifie si l’utilisateur possède les permissions demandées, avec une logique “toutes” ou “au moins une”.
- ProtectedRoute : orchestre ces garde-fous dans un ordre défini.

### 2.2 Utilisation effective dans l’application

L’intégration observée est la suivante :

- [src/App.tsx](../src/App.tsx) utilise ProtectedRoute pour protéger les routes candidat et admin.
- [src/components/candidate/ProtectedCandidateRoute.tsx](../src/components/candidate/ProtectedCandidateRoute.tsx) utilise aussi ProtectedRoute comme couche de protection supplémentaire.

En pratique, la chaîne est utilisée ainsi :

- Pour les routes candidat, le flux passe par AuthenticationGuard puis PermissionGuard, avec la permission demandée “dashboard.candidate”.
- Pour les routes admin, ProtectedRoute est utilisé, mais sans prop allowedRoles ni requiredPermissions ; il ne force donc pas de rôle ni de permission spécifique.

## 3. Ce qui est réellement appliqué vs ce qui est seulement défini

### 3.1 Réellement appliqué

- Une vérification d’authentification est bien en place via ProtectedRoute.
- Une vérification de permission est bien en place pour les routes candidat utilisant la permission “dashboard.candidate”.
- Les permissions et rôles sont définis dans des fichiers dédiés et sont consommés par les hooks de sécurité.

### 3.2 Déjà défini mais non encore exploité comme protection réelle

- RoleGuard existe, mais il n’est pas utilisé dans les routes actuelles avec une exigence de rôle explicite.
- Les permissions plus fines telles que “jobs.create”, “jobs.edit”, “jobs.delete” ou “team.manage” ne sont pas encore utilisées pour protéger des routes spécifiques dans l’application actuelle.
- Le modèle de rôles est défini, mais la logique actuelle de useRoles ne prend en compte que les rôles “super_admin”, “admin” et “editor”, ce qui exclut les autres rôles déclarés dans le registre.

## 4. Limites observées

### 4.1 Protection admin encore partielle

Les routes admin sont protégées via ProtectedRoute, mais sans configuration de rôle ni de permission. Cela signifie que la protection effective est actuellement majoritairement une protection par session, et non par contrôle d’accès basé sur les rôles ou les permissions.

### 4.2 Le système de permissions est plus “cadre” que “mise en œuvre complète”

Le registre de permissions est bien présent, mais il n’est pas encore utilisé pour un contrôle fin par page ou par action. L’application n’expose pas encore, dans ses routes, un découpage strict tel que :

- lecture/écriture de jobs,
- gestion de blog,
- gestion de notifications,
- administration du tableau de bord.

### 4.3 Le comportement candidat dépend du contexte profil

La logique de permissions repose sur la combinaison entre :

- les rôles récupérés via useRoles,
- le profil candidat récupéré via useCandidate.

Ainsi, l’accès candidat est lié au contexte profil et au rôle potentiel “candidate”. Si le profil candidat n’est pas disponible, la permission “dashboard.candidate” n’est pas acquise, ce qui peut entraîner une redirection vers la page de login.

## 5. Conclusion

L’architecture ajoutée est fonctionnelle comme couche de protection de base, mais elle est actuellement plus avancée en structure qu’en application stricte. En l’état :

- l’authentification est bien enforceée,
- les permissions candidat sont bien utilisées,
- les rôles et permissions sont définis proprement,
- mais la protection par rôles et permissions fines pour l’administration n’est pas encore réellement activée dans les routes.

Autrement dit, la migration a bien posé un socle de sécurité modulaire, mais elle n’a pas encore transformé ce socle en un système de contrôle d’accès complètement exploité sur toutes les zones sensibles de l’application.

## 6. Vérification effectuée

La vérification a été faite par compilation de l’application avec la commande :

- npm run build

Résultat observé : compilation réussie avec Vite, sans erreur bloquante remontée pendant la build.
