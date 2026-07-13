# Architecture de sécurité finale

Ce document décrit l’architecture de sécurité mise en place de façon progressive autour du système existant Supabase Auth, de la table public.candidates et de la table public.user_roles.

## 1. Objectif

L’architecture actuelle a été étendue avec une couche de garde dédiée permettant de centraliser la sécurité sur :

- l’authentification
- les rôles
- les permissions

Cette évolution conserve la compatibilité avec le fonctionnement actuel du candidat et de l’administration.

## 2. Structure de l’architecture

```text
ProtectedRoute
  ↓
AuthenticationGuard
  ↓
RoleGuard
  ↓
PermissionGuard
  ↓
Layout
  ↓
Pages
```

## 3. Composants ajoutés

### AuthenticationGuard

Responsable uniquement de :

- vérifier la session Supabase
- attendre le chargement de la session
- rediriger vers une page de fallback si aucune session n’existe

### RoleGuard

Responsable de :

- lire les rôles récupérés depuis la table public.user_roles
- vérifier si l’utilisateur possède un rôle autorisé
- refuser ou autoriser l’accès

### PermissionGuard

Responsable de :

- vérifier les permissions calculées à partir des rôles et du contexte candidat
- autoriser ou refuser l’accès selon les permissions demandées

### ProtectedRoute

Composant orchestration qui enchaîne :

1. AuthenticationGuard
2. RoleGuard
3. PermissionGuard
4. Layout
5. Page

## 4. Permissions disponibles

Le système de permissions est défini dans [src/features/authentication/permissions/permissions.ts](../src/features/authentication/permissions/permissions.ts).

Permissions principales :

- jobs.read
- jobs.create
- jobs.edit
- jobs.delete
- candidate.read
- candidate.update
- candidate.apply
- blog.read
- blog.write
- notifications.read
- notifications.manage
- services.manage
- dashboard.admin
- dashboard.candidate
- seo.manage
- team.manage

## 5. Rôles et permissions

Les rôles existants sont réutilisés sans création d’un nouveau système.

Le front lit simplement les rôles présents dans public.user_roles.

### Rôles pris en charge

- super_admin
- admin
- editor
- candidate
- rh
- company
- manager
- accountant
- recruiter

### Association par défaut

- Super Admin : toutes les permissions
- Admin : gestion du contenu et administration
- Editor : contenu uniquement
- Candidate : espace candidat

L’architecture est pensée pour l’ajout futur de nouveaux rôles sans refonte.

## 6. Utilisation dans l’application

### Routes candidat

Les routes de l’espace candidat utilisent désormais une protection de type :

- authentification
- permissions candidate

### Routes admin

Les routes admin utilisent le nouveau composant de protection via l’orchestrateur, en conservant le comportement existant de la session Supabase.

## 7. Fonctionnement complet

```text
Utilisateur demande une route protégée
  ↓
ProtectedRoute démarre
  ↓
AuthenticationGuard vérifie la session
  ↓
RoleGuard vérifie les rôles si un rôle est requis
  ↓
PermissionGuard vérifie les permissions si elles sont requises
  ↓
Layout rendu
  ↓
Page affichée
```

## 8. Ajout d’un nouveau rôle

Pour ajouter un rôle futur, il suffit de :

1. l’ajouter dans [src/features/authentication/permissions/roles.ts](../src/features/authentication/permissions/roles.ts)
2. lui associer des permissions dans [src/features/authentication/permissions/rolePermissions.ts](../src/features/authentication/permissions/rolePermissions.ts)
3. utiliser ce rôle dans un guard via ProtectedRoute

## 9. Ajout d’une nouvelle permission

Pour ajouter une permission :

1. l’ajouter dans [src/features/authentication/permissions/permissions.ts](../src/features/authentication/permissions/permissions.ts)
2. l’associer à un ou plusieurs rôles dans [src/features/authentication/permissions/rolePermissions.ts](../src/features/authentication/permissions/rolePermissions.ts)
3. l’utiliser dans une route via ProtectedRoute

## 10. Exemples d’utilisation

### Exemple 1 — page candidate

```tsx
<ProtectedRoute requiredPermissions={["dashboard.candidate"]} fallbackPath="/candidate/login">
  <CandidateLayout />
</ProtectedRoute>
```

### Exemple 2 — page admin

```tsx
<ProtectedRoute fallbackPath="/auth">
  <AdminPage />
</ProtectedRoute>
```

## 11. Compatibilité conservée

L’architecture introduite respecte les contraintes suivantes :

- Supabase Auth conservé
- table public.candidates conservée
- table public.user_roles conservée
- politiques RLS conservées
- ProtectedCandidateRoute conservé dans la transition
- routes publiques inchangées
