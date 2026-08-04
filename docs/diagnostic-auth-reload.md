# Diagnostic : rechargement de page et authentification candidate

## Symptôme observé

- En rechargeant la page alors que l'utilisateur est connecté, l'application affiche une page blanche avec un skeleton.
- L'utilisateur doit changer d'onglet ou revenir sur l'application pour que la connexion soit de nouveau effective.
- Le comportement se manifeste principalement sur les routes candidates protégées (`/candidate/*`).

## Fichiers clés impliqués

- `src/features/authentication/api/authApi.ts`
- `src/features/authentication/context/AuthContext.tsx`
- `src/features/authentication/guards/AuthenticationGuard.tsx`
- `src/App.tsx`
- `src/integrations/supabase/client.ts`

## Analyse des causes probables

### 1. Restauration de session Supabase sur le démarrage

Le `AuthProvider` démarre avec un `useEffect` unique qui appelle `refreshSession()` :

- `AuthContext` initialise `isLoading` à `true`.
- `refreshSession()` appelle `authApi.getCandidateSession()`.
- `AuthenticationGuard` affiche le skeleton tant que `isLoading` est `true`.

Si la restauration de session est retardée ou si `supabase.auth.getSession()` renvoie `null` temporairement au démarrage, l'application peut rester bloquée dans cet état de chargement.

### 2. `getCandidateSession()` est trop agressif avec le storage

Dans `src/features/authentication/api/authApi.ts`, la fonction `getCandidateSession()` fait :

- `const session = data.session ?? null;`
- si `!session`, elle exécute `clearAuthStorage();`
- puis elle retourne `null`

Cela signifie qu'un `getSession()` sans session valide efface immédiatement tous les jetons Supabase du localStorage/sessionStorage.

Ce comportement est dangereux au démarrage :

- un `getSession()` peut renvoyer `null` avant que la restauration de session native de Supabase soit finalisée,
- ou si l'auth client n'a pas encore rafraîchi le token.

Résultat probable : la session est supprimée prématurément et l'utilisateur perd son état connecté.

### 3. Le skeleton de chargement masque le vrai problème

Sur les pages candidates, `ProtectedRoute` utilise `AuthenticationGuard` :

- si `isLoading`, il affiche un skeleton (`CandidateDashboardSkeleton`).
- si la session n'est jamais retrouvée, l'utilisateur reste sur une page vide ressemblant à un écran de chargement.

Le fait de devoir changer d'onglet pour que la session revienne suggère aussi une synchronisation tardive d'état entre Supabase et le navigateur.

### 4. Pas de deuxième essai après un `null` initial

`AuthContext` appelle `refreshSession()` une seule fois au montage.

- Si la première tentative retourne `null` ou échoue,
- il n'y a pas de stratégie de retry explicite lorsque l'utilisateur recharge la page.

## Comportement attendu

- Si l'utilisateur était connecté, la session devrait être restaurée à la réouverture de la page.
- Un `null` initial de `getSession()` ne doit pas effacer les jetons tant qu'on n'est pas certain d'une déconnexion valide.
- En cas d'échec de restauration, l'application doit rediriger vers la page de login proprement, au lieu de rester bloquée sur un skeleton.

## Recommandations de correction

### Correction prioritaire

Modifier `src/features/authentication/api/authApi.ts` :

- ne pas appeler `clearAuthStorage()` dès que `data.session` est `null`.
- ne nettoyer le storage que sur erreur explicite d'authentification ou déconnexion volontaire.

### Améliorations supplémentaires

- ajouter une petite attente / retry sur la première restauration de session au démarrage.
- conserver `isLoading` pendant un court délai si la session est inconnue, puis basculer vers une redirection claire vers `/candidate/login`.
- limiter l'utilisation de `clearAuthStorage()` aux erreurs authentifiées non transitoires.

### Exemple de comportement corrigé

- page reload
- Supabase restaure les jetons depuis `localStorage`
- `getCandidateSession()` renvoie la session valide
- `AuthProvider` met `session` à jour et `isLoading` devient `false`
- `ProtectedRoute` affiche la page candidate plutôt que le skeleton permanent

## Conclusion

Le problème principal est très probablement une suppression trop hâtive du stockage Supabase dans `getCandidateSession()` combinée à une restauration de session initiale trop fragile.

En corrigeant cette logique, l'application retrouvera un comportement stable au rechargement, sans page blanche et sans besoin de changer d'onglet.
