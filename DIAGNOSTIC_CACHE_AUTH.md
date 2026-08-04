# Diagnostic cache / authenticaton

## Contexte

Un blocage sur le `Skeleton` lors d'un rechargement `F5` est apparu juste après une modification visant à résoudre un problème de navigateur affichant une ancienne version de l'application.

## Objectif

Trouver l'origine du bug, auditer toute gestion de cache / PWA / service worker, vérifier la configuration Supabase et corriger les comportements d'effacement du stockage d'authentification.

## Audit effectué

### 1. Cache / PWA / Service Worker

- Recherche complète effectuée sur `serviceWorker`, `service-worker`, `caches.delete`, `navigator.serviceWorker`, `vite-plugin-pwa`, `registerServiceWorker`, `sw.ts`, `sw.js`, `manifest`.
- Aucun fichier de service worker ou plugin PWA n'a été trouvé dans le projet.
- Aucune logique de cache HTTP explicite ou de rafraîchissement forcé de la page dans `index.html`, `main.tsx`, `App.tsx` ou les fichiers de configuration.
- Conclusion : le bug n'est pas lié à un service worker ou à une stratégie PWA du projet.

### 2. Initialisation du client Supabase

- Fichier vérifié : `src/integrations/supabase/client.ts`
- Configuration correcte constatée :
  - `storage: typeof window !== "undefined" ? localStorage : undefined`
  - `persistSession: true`
  - `autoRefreshToken: true`
- Conclusion : la persistance de session Supabase est correctement activée et n'a pas été désactivée.

### 3. Intercepteurs / listeners de navigation

- Recherche dans `main.tsx`, `App.tsx`, `AuthContext.tsx` et autres fichiers de routage.
- Aucun script de vérification de version ou de blocage d'initialisation du démarrage n'a été trouvé.
- Le point d'entrée `main.tsx` se contente de monter l'application React classique.

### 4. Points critiques d'authentification et nettoyage de stockage

- `src/features/authentication/api/authApi.ts`
  - Vérifié : `getCandidateSession()` utilise `supabase.auth.getSession()`.
  - La version actuelle ne nettoie pas le storage si `data.session` est `null`.
  - `clearAuthStorage()` est conservé uniquement dans `logoutCandidate()`.
- `src/integrations/supabase/candidate-auth.ts`
  - Cette version legacy appelait `clearAuthStorage()` lorsqu'aucune session n'était trouvée.
  - Cette suppression a été supprimée pour éviter une invalidation prématurée du storage.
- `src/App.tsx`
  - Le code efface `localStorage` / `sessionStorage` uniquement lorsqu'une session restaurée a un email non confirmé.
  - Ce comportement est spécifique aux sessions non confirmées et ne devrait pas provoquer le blocage général sur F5 pour les utilisateurs confirmés.

## Diagnostics et conclusions

- Il n'y a pas de Service Worker ni de PWA dans le projet.
- Le client Supabase a une configuration valide pour la persistance de session.
- Le bug est très probablement causé par une invalidation prématurée du stockage d'authentification, pas par un cache de navigateur PWA.
- Le code le plus fragile se situe dans les points où `getSession()` retourne `null` et où le stockage est nettoyé ensuite.
- La formulation du bug correspond à un comportement de restauration de session interrompu par une suppression de tokens trop agressive.

## Modifications appliquées

- Création du fichier `DIAGNOSTIC_CACHE_AUTH.md` à la racine.
- Correction appliquée dans `src/integrations/supabase/candidate-auth.ts` :
  - suppression de `clearAuthStorage()` lorsque `getCandidateSession()` renvoie `null`.
  - ceci évite que l'absence temporaire de session au démarrage supprime les jetons du navigateur.
- Vérification de `src/features/authentication/api/authApi.ts` :
  - maintien de la persistance du stockage tant que la session n'est pas explicitement déconnectée.

## Fichiers impactés

- `DIAGNOSTIC_CACHE_AUTH.md`
- `src/integrations/supabase/candidate-auth.ts`
- `src/features/authentication/api/authApi.ts`
- `src/integrations/supabase/client.ts`
- `src/App.tsx`
- `src/features/authentication/context/AuthContext.tsx`

## Recommandation finale

- Tester le rechargement de page (`F5`) avec un utilisateur candidat déjà connecté.
- Vérifier que le `Skeleton` disparaît dès que Supabase restaure la session native.
- Si le bug persiste, le prochain point à inspecter est l'ordre des effets React dans `AuthContext` et l'usage de `onAuthStateChange` pendant le montage.
