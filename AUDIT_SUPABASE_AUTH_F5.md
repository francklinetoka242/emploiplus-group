# Audit Supabase Auth F5

## 1. Diagnostic précis

### Constat principal
- L'application utilise bien un client Supabase global unique déclaré dans `src/integrations/supabase/client.ts`.
- Le bug lié au rechargement `F5` ne semble pas provenir d'une double instanciation de `createClient` dans `src/` pour le runtime du navigateur.

### Probable cause de la déconnexion
- `AuthContext` initialise `isLoading` à `true` et lance `refreshSession(true)` dans un `useEffect` de première monte.
- `refreshSession(true)` appelle `authApi.getCandidateSession()`, qui s'appuie sur `supabase.auth.getSession()`.
- Si `getSession()` retourne `null` ou si l'événement `INITIAL_SESSION` ne se déclenche pas rapidement, l'état de l'application peut rester en mode chargement.
- La logique de `onAuthStateChange` fait passer `setIsLoading(false)` uniquement lorsque l'événement provient de `INITIAL_SESSION` ou d'un changement de session effectif. Si un `nextSession` `null` survient sans autre événement clair, le cycle peut finir par laisser le composant bloqué en `isLoading`.

### Detail du bug de blocage sur Skeleton
- Le composant `App.tsx` utilise `isLoading || isProfileLoading` pour afficher un squelette public.
- `AuthContext` démarre `isLoading=true` et dépend de deux flux asynchrones:
  - `refreshSession(true)`
  - `supabase.auth.onAuthStateChange(...)`
- Cette redondance est risquée car le `useEffect` d'initialisation peut terminer avec `setIsLoading(false)` mais le listener `onAuthStateChange` peut ensuite remettre en cause l'état si une session invalide est reçue ou si l'événement est manquant.
- En pratique, la combinaison de `getSession()` et `onAuthStateChange` peut générer un état d'attente prolongé si une réponse `null` arrive avant une revalidation claire ou si le listener est attaché après un état de session déjà restauré.

### Point critique sur la restauration de session
- `AuthContext` initialise `hasInitializedSessionRef.current` et un timeout de secours de 3 secondes.
- Ce timeout est annulé dans le `.finally` de `refreshSession(true)` qui appelle `setIsLoading(false)`.
- Si `refreshSession(true)` n'aboutit jamais ou si une promesse reste pendante, le fallback de 3 secondes est la seule sécurité.
- Cependant, la logique interne de `refreshSession` n'annule pas explicitement le listener ou n'empêche les états de course entre `refreshSession` et `onAuthStateChange`.

## 2. Cartographie des instances Supabase

### Client global unique
- `src/integrations/supabase/client.ts`
  - Contient la seule instanciation `createClient<Database>(...)` pour le runtime du navigateur.
  - Utilise un proxy pour instancier le client à la première utilisation.
  - Configure `auth.storage` en `localStorage`, `persistSession: true`, `autoRefreshToken: true`.

### Fichiers hérités ou serveur
- `src/integrations/supabase/candidate-auth.ts`
  - Hérite de `supabase` depuis `src/integrations/supabase/client`.
  - Ne crée pas de client distinct.
- `src/integrations/supabase/client.server.ts`
  - Réexporte `supabase` comme `supabaseAdmin`.
  - Pas de nouvelle instanciation.

### Autres usages du client global
- `src/features/authentication/api/authApi.ts`
- `src/features/authentication/context/AuthContext.tsx`
- `src/features/candidates/api/*`
- `src/features/jobs/api/jobsApi.ts`
- `src/features/profile/components/sections/DocumentsSection.tsx`
- `src/features/local-guides/localGuideService.ts`
- `src/hooks/pages.ts`
- `src/hooks/useNotifications.ts`
- `src/pages/admin/*`
- `src/pages/public/AuthPage.tsx`
- `src/services/*`

### Instances de `createClient` hors runtime navigateur
- `scripts/generateJobEmbeddings.ts`
  - Crée un client Supabase pour un script Node.js distinct, sans impact sur l'application client.
- `vite.config.ts`
  - Utilise `createClient` uniquement dans une configuration de build/preview.

## 3. Analyse du script de restauration de session

### `AuthContext` / `refreshSession`
- `refreshSession` est le cœur de la restauration de session.
- Il met `isLoading=true` sauf lorsque `silent=true`.
- Il appelle trois fois maximum `authApi.getCandidateSession()` en cas d'erreur réseau.
- Sur session `null`, il réinitialise `session=null`, `profile=null`, `isProfileLoading=false`.
- En cas d'erreur, il positionne `error`, `session=null`, `profile=null`, `isProfileLoading=false`.
- En `finally`, il remet `isLoading=false` si `silent` est faux.

### `useEffect` de démarrage
- Un `useEffect` attaché au montage démarre `refreshSession(true)` une seule fois.
- Il définit un timeout de 3 secondes pour forcer `isLoading=false` si la requête prend trop longtemps.
- Ce timeout est annulé dans le `.finally`, donc il ne protège que si `refreshSession` résout ou rejette.
- Le hook de démarrage ne prend pas en compte l’abandon d’une promesse si le composant se démonte avant la fin.

### `onAuthStateChange`
- Un listener est enregistré et désinscrit au démontage.
- Les états gérés sont:
  - `SIGNED_IN`, `TOKEN_REFRESHED`, `USER_UPDATED`
  - `INITIAL_SESSION`
- Si `nextSession` est `null`, le listener efface `session`, `profile`, `isProfileLoading`, `isLoading`.
- Si `nextSession` est non nul, le listener résout les rôles et met à jour la session.
- `hasHandledAuthEvent` garantit que le premier événement peut désactiver le chargement.

### Risques identifiés
- `sync` entre `refreshSession(true)` et `onAuthStateChange` : les deux flux appellent `setSession` et `setIsLoading(false)`, ce qui peut créer une condition de course ou un état incohérent.
- `onAuthStateChange` suppose que l’événement `INITIAL_SESSION` arrive toujours ; si le listener est attaché après que Supabase a déjà restauré la session, il peut manquer cet événement.
- `getCandidateSession()` retourne `null` pour session non confirmée, mais ne nettoie pas le storage. Cela est correct, mais si la session a réellement expiré, la logique va déconnecter l'utilisateur sans autre nuance.
- Si `supabase.auth.getSession()` reste bloqué ou rejette, `refreshSession(true)` peut rester en attente jusqu’au timeout externe. Un rejet est capturé, mais l’état de chargement est potentiellement remis à false seulement au `.finally` du hook.

### Profil candidat et promesse suspendue
- `useEffect` courbe `session?.user?.id` pour déclencher le chargement du profil.
- Si `session` change rapidement plusieurs fois, `loadProfile` peut être lancé plusieurs fois et `isProfileLoading` reste vrai jusqu’au dernier appel terminé.
- Pas de `await` suspendu non géré, mais le callback async `loadProfile` ne renvoie rien au hook, donc toute exception est capturée et `setIsProfileLoading(false)` exécuté.
- Aucun `Promise` n’est laissé en inconsistance apparente, mais la logique `profile` dépend fortement d’une session stable après restauration.

## 4. Audit du nettoyage du stockage

### Fonctions de nettoyage trouvées
- `src/features/authentication/utils/authStorage.ts`
  - `clearAuthStorage()` supprime les clés locales trouvées dans `localStorage` et `sessionStorage` :
    - clés commençant par `sb-`
    - clés commençant par `supabase.auth`
    - clés contenant `auth-token`, `auth-session`, `auth-token-code-verifier`
- `src/features/authentication/api/authApi.ts`
  - `logoutCandidate()` appelle `supabase.auth.signOut()` puis `clearAuthStorage()`.
- `src/features/authentication/utils/emailValidation.ts`
  - Appelle `signOut()` pour email non confirmé.
- `src/integrations/supabase/candidate-auth.ts`
  - Appelle `supabase.auth.signOut()` dans certains flux de signup/validation.
- `src/pages/public/AuthPage.tsx`
  - Appelle `clearAuthStorage()` puis `supabase.auth.signOut()` dans une logique de login/logout.

### Nettoyage automatique au démarrage
- Aucune des fonctions de nettoyage n’est appelée directement au montage du `AuthContext`.
- `authApi.getCandidateSession()` contient explicitement un commentaire indiquant de ne pas vider le stockage sur session nulle.
- `App.tsx` valide la session restaurée, mais ne déclenche pas de nettoyage automatique.
- Conclusion : aucun `localStorage.clear` ou `clearAuthStorage` n’est exécuté automatiquement au démarrage dans le flux normal de récupération de session.

## 5. Analyse d'impact

### Ce qui est sûr de corriger
- Réduire la duplication entre `refreshSession(true)` et le listener `onAuthStateChange`.
- Garantir que le client Supabase ne déclenche qu’un seul flux de restauration de session sur F5.
- Améliorer la gestion de `isLoading` pour qu'il se termine de manière déterministe même si `getSession()` retourne `null` ou est lent.
- Ajouter un traitement explicite du cas `INITIAL_SESSION` manquant ou du `nextSession` `null` sans laisser `isLoading` en attente.

### Ce qu’il faut éviter
- Ne pas supprimer `clearAuthStorage()` de `logoutCandidate()` : c’est un comportement voulu pour déconnexion explicite.
- Ne pas changer la politique de stockage Supabase en `auth.storage` sans tester le comportement des tokens persistés.
- Ne pas supposer qu’une session `null` signifie forcément une déconnexion utilisateur définitive pendant l’initialisation.

### Zone de risque élevé
- Le code actuel mélange plusieurs points de vérité pour l’état de chargement et la session initiale : `refreshSession`, `onAuthStateChange`, timeout de 3 s.
- Rendre le flux plus explicite et séquentiel est essentiel pour éviter une UX bloquée.

## 6. Plan d'action recommandé

1. Centraliser la restauration de session
   - Choisir un seul point de vérité : soit `supabase.auth.getSession()` au montage, soit `onAuthStateChange` avec `INITIAL_SESSION`, mais ne pas les traiter comme deux flux séparés concurrents.

2. Simplifier la logique `isLoading`
   - Initialiser `isLoading` à `true`.
   - Désactiver `isLoading` dès que le premier flux asynchrone de session est résolu (session valide ou `null`), sans dépendre de plusieurs callbacks concurrents.
   - Conserver un timeout de secours uniquement comme filet de sécurité, pas comme mécanisme principal.

3. Mieux gérer `nextSession === null`
   - Lors d’un `INITIAL_SESSION` ou d’un événement de changement, expliciter le cas de session `null` et garantir `setIsLoading(false)`.
   - Ne pas effacer le profil si la session est temporairement indisponible sans vérification supplémentaires.

4. Auditer les scénarios de session non confirmée
   - Vérifier que `getCandidateSession()` retourne bien `null` uniquement pour les sessions non confirmées et pas pour les sessions valides restaurées.
   - Si nécessaire, distinguer session expirée vs email non confirmé dans le state et dans l’UX.

5. Tester le rechargement F5
   - Recharger la page avec une session candidate existante.
   - Vérifier la valeur de `supabase.auth.getSession()` et l’événement `INITIAL_SESSION` dans le navigateur.
   - Vérifier que `App.tsx` sort bien du skeleton et passe en layout candidat ou public selon la session.

## 7. Résumé
- Il n’y a pas de double instanciation Supabase dans le code client `src/`.
- Le problème se trouve très probablement dans la coordination entre restauration de session et gestion du `isLoading` de `AuthContext`.
- Le nettoyage du stockage n’est pas déclenché automatiquement au démarrage.
- Le correctif doit se concentrer sur la séquentialisation de `refreshSession` / `onAuthStateChange` et sur un état de chargement déterministe.
