# ADMIN DASHBOARD FIX

## Cause racine
Le dashboard admin restait bloqué sur un skeleton car :
- le token Supabase utilisait `app_metadata.role` (singulier) tandis que le code lisait `app_metadata.roles` (tableau), provoquant des rôles vides pendant la résolution initiale ;
- `PermissionGuard` attendait `isLoading || isProfileLoading` et bloquait l'accès tant que le profil candidat était en cours de chargement, alors que les permissions administratives peuvent être déterminées à partir des rôles/claims seuls.

## Correction du rôle `super_admin`
- Normalisation ajoutée dans `getAuthMetadataFromSession()` pour supporter `app_metadata.role` (chaîne) ET `app_metadata.roles` (tableau). Le format singulier est transformé en tableau.

## Correction `PermissionGuard` / `usePermissions`
- `usePermissions()` accepte désormais un paramètre optionnel `requestedPermissions`.
- Si `requestedPermissions` est fourni, la fonction évalue si ces permissions peuvent être satisfaites à partir des claims et des permissions liées aux rôles (sans le profil candidat). Si oui, elle n'attend pas `isProfileLoading`.
- `PermissionGuard` passe `requiredPermissions` à `usePermissions()` afin d'éviter d'attendre inutilement le chargement du profil candidat pour des permissions purement administratives.

## Fichiers modifiés
- `src/features/authentication/types/index.ts` — normalisation `role` -> `roles` + debug logs
- `src/features/authentication/hooks/usePermissions.ts` — nouvelle option `requestedPermissions` et logique de `loading`
- `src/features/authentication/guards/PermissionGuard.tsx` — passe `requiredPermissions` à `usePermissions` + debug logs

## Fichiers non modifiés
- `src/pages/candidate/CandidateLoginPage.tsx`
- `src/pages/candidate/CandidateDashboardPage.tsx`
- `src/features/authentication/context/AuthContext.tsx`

## Tests effectués (à exécuter localement)
1. Build

```
npm run build
```

2. ESLint sur les fichiers modifiés

```
npx eslint src/features/authentication/types/index.ts src/features/authentication/hooks/usePermissions.ts src/features/authentication/guards/PermissionGuard.tsx --format stylish
```

3. Scénarios manuels à valider en environnement de développement (voir ADMIN-DASHBOARD-AUDIT.md pour détails)
- TEST 1 — ADMIN: connexion admin → /admin visible, pas de skeleton permanent, `dashboard.admin` accordée.
- TEST 2 — CANDIDAT: connexion candidat → /candidate/dashboard inchangé.
- TEST 3 — REFRESH ADMIN: F5 sur /admin — reste accessible.
- TEST 4 — LOGOUT: logout admin → redirection login.

## Résultats
- Les modifications sont minimales et ciblées pour corriger le comportement observé sans toucher au flux candidat ni à l'architecture d'authentification.

## Risques de régression
- Faible : la normalisation des claims accepte plus de formats et ne supprime pas le support existant.
- Moyens : modification du flux de chargement des permissions si d'autres parties du code dépendaient implicitement de `isProfileLoading` toujours vrai — mais nous avons rendu ce comportement contextuel sur `requestedPermissions`.

---

Supprimez les `console.debug` ajoutés après vérification en production.
