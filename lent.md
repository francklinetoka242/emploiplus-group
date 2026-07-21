# Diagnostic de lenteur sur les pages candidat

## Pourquoi l’application affiche "Vérification des permissions..."

Le message provient du composant `PermissionGuard` dans `src/features/authentication/guards/PermissionGuard.tsx`.

Ce composant bloque le rendu de la page tant que la fonction `usePermissions()` indique qu’elle est en cours de chargement.

```tsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Vérification des permissions...</div>
    </div>
  );
}
```

## Pourquoi `usePermissions()` peut être lent

`usePermissions()` dans `src/features/authentication/hooks/usePermissions.ts` dépend de deux hooks :

- `useRoles()`
- `useCandidate()`

Elle renvoie `loading: rolesLoading || profileLoading`.

Donc tant que :

- la récupération du profil candidat (`profileLoading`) n’est pas terminée, ou
- la récupération des rôles depuis la base (`rolesLoading`) n’est pas terminée,

la page reste sur l’écran de vérification.

## Pourquoi `useRoles()` est souvent le facteur principal

`useRoles()` fait une requête Supabase vers `user_roles` dès qu’il existe un `session.user.id` :

```ts
const { data, error } = await supabase
  .from("user_roles")
  .select("id,user_id,role,created_at,is_active")
  .eq("user_id", session.user.id);
```

Cette requête ajoute une latence réseau avant que les permissions ne soient accessibles.

Si le serveur Supabase est lent ou si la session est initialisée tard, la page attend.

## Pourquoi cela revient souvent sur la page candidate

La route candidate est protégée par un `ProtectedRoute` et/ou `PermissionGuard` avec `requiredPermissions={['dashboard.candidate']}`.

Du coup :

1. l’utilisateur se connecte ou la session est restaurée,
2. `useAuth()` initialise l’authentification,
3. `useRoles()` charge les rôles,
4. `useCandidate()` charge le profil candidat,
5. seulement après, la page s’affiche.

Si l’une de ces étapes prend du temps, le texte "Vérification des permissions..." reste visible.

## Résumé des causes probables

- requête réseau vers Supabase pour `user_roles`
- initialisation de la session auth Supabase
- chargement du profil candidat
- blocage volontaire du rendu tant que les permissions ne sont pas connues

## Ce que cela signifie

Ce n’est pas une erreur JavaScript : c’est un état de chargement volontaire.

La page est lente parce qu’elle attend la résolution de la pile d’authentification/permissions avant d’afficher le contenu protégé.

---

*Ce fichier est un diagnostic sans modification du code, comme demandé.*
