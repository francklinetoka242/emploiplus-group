# Diagnostic Authentification / PWA

## 1. Contexte

L'application utilise Supabase pour l'authentification et des routes React protégées (`ProtectedRoute` / `AuthenticationGuard`).

Les fichiers principaux examinés sont :
- `src/features/authentication/context/AuthContext.tsx`
- `src/features/authentication/api/authApi.ts`
- `src/features/authentication/guards/AuthenticationGuard.tsx`
- `src/App.tsx`
- `src/integrations/supabase/client.ts`
- `src/features/authentication/utils/authStorage.ts`

Le bug décrit est : au rafraîchissement de page (F5 / pull-to-refresh), l'application reste bloquée sur des Skeletons de chargement et ne récupère pas la session.

> Note : le workspace ne contient pas de dossier `frontend` existant. Le rapport est donc créé dans un nouveau dossier `frontend` à la racine du workspace.

## 2. Cycle de vie de l'authentification

### 2.1 Initialisation d'`AuthContext`

- `AuthContext` initialise `isLoading` à `true`.
- `useEffect` de montage lance `refreshSession(true)` une seule fois.
- `hasInitializedSessionRef` empêche la relance sur les montages ultérieurs.

### 2.2 `refreshSession(true)`

- Le hook appelle `authApi.getCandidateSession()`.
- `setError(null)` est exécuté avant l'appel.
- `refreshSession` utilise une boucle de retry jusqu'à 2 fois pour les erreurs réseau.
- Si la requête est réussie, `setSession(resolvedSession)` est appelée.
- Si la session est `null`, `setSession(null)`, `setProfile(null)`, `setIsProfileLoading(false)`.
- En cas d'erreur, `error` est défini et la session est réinitialisée.
- `setIsLoading(false)` est exécuté dans le `finally` *seulement si* `silent` est `false`.

### 2.3 `onAuthStateChange` Supabase

- Un listener Supabase est enregistré dans le même `useEffect`.
- Il gère les événements de session : `SIGNED_IN`, `TOKEN_REFRESHED`, `USER_UPDATED`, `INITIAL_SESSION`.
- Si `nextSession` est `null`, le code :
  - met `session` à `null`
  - met `profile` à `null`
  - met `isProfileLoading` à `false`
  - remet `isLoading` à `false` si l'événement de session n'a pas encore été traité
- Si `nextSession` est non nul, il résout les rôles, charge le profil et met `isProfileLoading` à `false`.

### 2.4 Risque de condition de course

Deux flux concurrents gèrent l'état de session :
1. la restauration explicite via `refreshSession(true)`
2. le listener `supabase.auth.onAuthStateChange`

Ce double mécanisme est fragile sur un reload F5 car :
- le premier flux peut se terminer avant que le listener n'ait reçu l'événement `INITIAL_SESSION`
- le listener peut recevoir un `null` temporaire et réinitialiser la session malgré une restauration possible imminente
- `isLoading` peut rester vrai si aucun callback ne déclenche correctement le `setIsLoading(false)`

## 3. Analyse du `loading` bloqué

### 3.1 `isLoading` et `isProfileLoading`

- `isLoading` est global à l'authentification et bloque tous les `ProtectedRoute`.
- `isProfileLoading` est utilisé dans `App.tsx` pour afficher un Skeleton public tant que le profil candidat est en cours de chargement.
- Si `isLoading` reste `true`, la route protégée affiche un Skeleton permanent (`DashboardLayoutSkeleton` ou `CandidateDashboardSkeleton`).

### 3.2 Cas où `isLoading` peut rester bloqué

Les situations suivantes peuvent conduire à un blocage :
- `refreshSession(true)` lance une requête longue ou se retrouve en attente réseau
- `getCandidateSession()` retourne `null` sans erreur et le `finally` du premier effet ne bascule pas correctement l'état
- le listener `onAuthStateChange` n'émet pas l'événement attendu ou le reçoit après un temps de latence
- aucun `setIsLoading(false)` n'est réussi parce que le flux de session n'a pas été marqué comme traité

### 3.3 Absence de `finally` dans certains chemins

`refreshSession` utilise `finally` pour `setIsLoading(false)` uniquement si `silent` est `false`. Or :
- au démarrage, `refreshSession(true)` est appelé avec `silent=true`
- cela signifie que le flux de démarrage ne garantit pas la désactivation de `isLoading`
- la seule sécurité est le bloc `finally` dans l'effet d'initialisation, qui exécute `setIsLoading(false)` après `refreshSession(true)`.

Ce mécanisme est vulnérable si :
- `refreshSession(true)` reste pendante indéfiniment
- le `finally` n'est jamais atteint

## 4. Interaction avec Supabase et stockage local

### 4.1 Configuration Supabase

`src/integrations/supabase/client.ts` configure Supabase ainsi :
- `storage: localStorage`
- `persistSession: true`
- `autoRefreshToken: true`

Cela signifie que Supabase persiste naturellement la session client dans `localStorage`.

### 4.2 Gestion de `localStorage` / session storage

`src/features/authentication/utils/authStorage.ts` définit `clearAuthStorage()` :
- supprime les clés commençant par `sb-` ou `supabase.auth`
- supprime les clés contenant `auth-token`, `auth-session`, `auth-token-code-verifier`
- fonctionne aussi sur `sessionStorage`

### 4.3 Usage de `clearAuthStorage()`

- `logoutCandidate()` appelle bien `clearAuthStorage()` après `supabase.auth.signOut()`.
- `getCandidateSession()` contient un commentaire explicite :
  - `// IMPORTANT: Do not clear auth storage here on null session or network errors.`
- Cependant, si `getSession()` renvoie `null` au démarrage, le code peut toujours rétablir une session vide et provoquer une UX de déconnexion.

### 4.4 Risque d'effacement prématuré

Même si le code affirme ne pas vider le stockage sur `null`, le fait que la session renvoyée soit traitée comme invalide peut entraîner :
- perte de tokens si une autre logique dérivée supprime le storage
- impossibilité de revalider la session sans suppression explicite du storage
- comportement bloqué dans les cas de revalidation réseau asymétrique

### 4.5 Service Worker / PWA

- Aucune trace de fichiers `service-worker`, `sw.ts`, `sw.js`, `vite-plugin-pwa` ou `navigator.serviceWorker` dans les sources du projet.
- Il n'existe pas de stratégie de cache PWA explicite dans le code inspecté.
- Par conséquent, le dysfonctionnement ne semble pas lié à un Service Worker actif dans le code du projet actuel.

## 5. Composants de rendu et Skeletons

### 5.1 `AuthenticationGuard`

- Affiche le skeleton si `isLoading` est vrai.
- Redirige simplement vers `/candidate/login` si `session` est `null`.
- Ne gère pas les erreurs spécifiques d'authentification autrement que par un log console.

### 5.2 `SharedPublicRouteShell` dans `App.tsx`

- Affiche un layout public si `isLoading || isProfileLoading`.
- Si `profile` existe, utilise `ProtectedRoute`.
- Le rendu public peut rester bloqué sur un skeleton si `isLoading` ne redescend pas.

### 5.3 Skeletons sur les routes protégées

- Les routes candidates utilisent `CandidateDashboardSkeleton` comme fallback.
- Les routes publiques utilisent `PublicPageSkeleton`.
- Ainsi, un blocage de `isLoading` se traduit visuellement par un écran de skeleton sans message d'erreur.

## 6. Gestion des erreurs HTTP

### 6.1 Erreurs explicites traitées

- `authApi.getCandidateSession()` lance les erreurs reçues de `supabase.auth.getSession()`.
- `refreshSession()` attrape toute erreur et l'affecte à `error`.

### 6.2 Absence de distinction 401 / 403 / 500

- Le code ne distingue pas les statuts HTTP 401, 403 ou 500.
- Toute erreur est traitée de façon générique et déclenche `setSession(null)`.
- Il n'existe pas de mécanisme spécifique de réauthentification ou de purge conditionnelle du token selon le code d'erreur.

### 6.3 Risque pour la revalidation au démarrage

- Si `supabase.auth.getSession()` échoue sur une erreur réseau ou un 500, le retry peut redonner un résultat nul.
- Sans gestion explicite de délais ou de timeouts, la logique peut se retrouver en attente et maintenir `isLoading` actif.

## 7. Conclusions clés

### 7.1 Origine la plus probable du blocage

- La coordination entre `refreshSession(true)` et `supabase.auth.onAuthStateChange` est le point de défaillance critique.
- Le premier flux initialise un chargement et peut rester pendu si Supabase n'a pas encore restauré la session.
- Le second flux peut intervenir en dehors du timing attendu et réinitialiser l'état sans garantie de terminer le `loading`.

### 7.2 Blocage durable sur Skeleton

- `AuthenticationGuard` et le routage protégé considèrent `isLoading` comme unique source de vérité.
- Si `isLoading` ne repasse jamais à `false`, le skeleton demeure affiché indéfiniment.

### 7.3 PWA / cache non pertinent dans le code actuel

- Aucun service worker n'a été trouvé.
- Aucune stratégie PWA de caching n'est mise en place dans les sources explorées.
- Le bug est donc très probablement un problème d'état d'authentification, pas un problème de cache PWA.

## 8. Plan d'action proposé

### 8.1 Corriger le flux d'initialisation

- Ne maintenir qu'un seul flux de restauration de session principal au démarrage.
- Soit `refreshSession` seul, soit `onAuthStateChange` seul, mais pas les deux gérant la session indépendamment.
- Si le listener Supabase est conservé, éviter de lancer une requête de session séparée qui entre en concurrence avec lui.

### 8.2 Stabiliser `isLoading`

- Conserver `isLoading=true` au démarrage.
- Forcer `setIsLoading(false)` dès que le premier flux asynchrone est résolu, qu'il renvoie une session valide ou `null`.
- Ajouter un timeout de sécurité global dans `AuthContext` (par ex. 5 secondes) pour s'assurer que `isLoading` ne reste pas bloqué.
- Ce timeout ne doit être qu'un filet de sécurité, pas la logique principale.

### 8.3 Mieux gérer `null` de session

- Si `getSession()` retourne `null` au démarrage, ne pas effacer les tokens ou le storage local.
- Traiter `null` comme un état de session inconnue / potentiellement expirée.
- Si le token est définitivement invalide, un second mécanisme de validation explicite peut purger le stockage.

### 8.4 Ajouter un fallback en cas d'erreur HTTP

- Détecter explicitement les erreurs 401/403 pour forcer une déconnexion propre.
- Traiter les erreurs réseau/500 par un message de retry et ne pas modifier l'état global de session sur un échec temporaire.

### 8.5 Améliorer l'UX de chargement

- Afficher un message explicite si l'application ne parvient pas à restaurer la session au lieu d'un skeleton pur.
- Sur un échec de restauration définitif, rediriger vers `/candidate/login` de manière déterministe.

## 9. Recommandations techniques détaillées

1. Dans `src/features/authentication/api/authApi.ts` :
   - vérifier que `getCandidateSession()` ne purgera jamais le stockage sur un `null` temporaire.
   - conserver `clearAuthStorage()` uniquement pour `logoutCandidate()` et éventuellement pour des erreurs auth explicites 401/403.

2. Dans `src/features/authentication/context/AuthContext.tsx` :
   - éviter la duplication `refreshSession(true)` + `onAuthStateChange`.
   - rendre le `listener` dépendant d'un état de session initial stable.
   - clarifier le rôle de `hasHandledAuthEvent` et ne pas l'utiliser pour masquer des events manquants.

3. Dans `src/App.tsx` :
   - ne pas afficher un layout public sans une désactivation explicite de `isLoading`.
   - utiliser un second indicateur comme `hasAttemptedInitialAuth` pour différencier `loading` initial et `no session`.

4. Tests à couvrir :
   - rechargement de page avec session valide restaurée depuis `localStorage`.
   - rechargement en mode hors-ligne / réseau lent.
   - session expirée au démarrage.
   - session non confirmée (`email_confirmed_at === null`).

## 10. Synthèse

Le blocage critique est très vraisemblablement dû à une gestion instable du cycle de vie d'authentification dans `AuthContext`, en particulier :
- `isLoading` démarré puis confié à deux flux concurrents,
- `supabase.auth.getSession()` et `onAuthStateChange` en concurrence,
- absence de fallback solide pour rendre `isLoading` à `false`.

Ce rapport identifie le problème principal comme étant un dysfonctionnement d'état et non un problème de Service Worker ou de cache PWA.
