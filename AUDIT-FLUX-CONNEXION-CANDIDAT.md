# Audit du flux de connexion candidat

## Problème identifié

Après une connexion réussie, les changements rapides d’URL observés dans le navigateur étaient provoqués par une redirection post-login non protégée dans [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx).

La logique de login faisait bien `signIn`, mais le composant de page continuait ensuite à réagir aux changements d’état d’authentification et exécutait `navigate("/candidate/dashboard", { replace: true })` tant que l’utilisateur restait authentifié sur cette route.

Le risque était double :

- le composant pouvait se réexécuter à cause du cycle de rendu et des dépendances (`isAuthenticated`, `user.id`, `rolesResolved`);
- le paquet de guards et routes candidat pouvait aussi produire une redirection en fonction de l’état auth ou des permissions.

Le but était d’avoir une seule navigation finale, à savoir :

`/candidate/login` → `Supabase signIn` → session confirmée → `auth.user.id` → candidat associé → `ONE NAVIGATION` → `/candidate/dashboard`

---

## Causes exactes des redirections multiples

### 1) Redirection explicite dans le login
Fichier concerné : [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)

La page de connexion contenait un `useEffect` qui faisait :

- si `isAuthenticated && user && rolesResolved` → `navigate("/candidate/dashboard", { replace: true })`

Cette logique n’était pas protégée contre une exécution répétée. Le même état auth pouvait déclencher plusieurs transitions si le composant se re-rendait.

### 2) Redirection de route par /candidate index
Fichier concerné : [src/App.tsx](src/App.tsx)

La route `/candidate` contenait bien :

- `<Route index element={<Navigate to="/candidate/dashboard" replace />} />`

C’est une redirection légitime pour un accès direct à `/candidate`, mais elle n’est pas la cause du login. Elle ne doit pas servir de route intermédiaire au moment du login candidat.

### 3) Guards d’authentification et permissions
Fichiers concernés :
- [src/features/authentication/guards/AuthenticationGuard.tsx](src/features/authentication/guards/AuthenticationGuard.tsx)
- [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx)

Ces guards sont structurés pour rediriger vers `/candidate/login` si l’utilisateur n’est pas authentifié.

C’est normal, mais ils doivent rester strictement conditionnels à l’absence d’authentification et ne pas être déclenchés dans le cas d’un `session` encore en cours de résolution.

### 4) Hook candidat
Fichier concerné : [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)

Le hook de profil candidat ne redirige pas immédiatement après login ; il charge le candidat depuis `auth.user.id` vers `candidates.user_id`.

Le `logout` redirige en revanche vers `/candidate/login`, ce qui est attendu et ne pose pas de problème pour la navigation post-login.

### 5) Layout candidat
Fichier concerné : [src/pages/candidate/CandidateLayout.tsx](src/pages/candidate/CandidateLayout.tsx)

Le layout ne redirige pas lui-même. Il ne fait que construire le shell candidat et afficher le contenu courant.

---

## Source retenue comme UNIQUE RESPONSABLE

La source unique de navigation post-login a été retenue dans :

- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)

Le correctif a consisté à :

- empêcher toute redirection si la route n’est pas `/candidate/login`;
- empêcher une seconde navigation après la première tentative ;
- garder un comportement `replace: true` pour éviter de laisser le formulaire dans le historique navigateur.

---

## Modifications effectuées

### Fichier modifié
- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)

### Fichiers non modifiés (n’ont pas été perturbés)
- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
- [src/App.tsx](src/App.tsx)
- [src/pages/candidate/CandidateLayout.tsx](src/pages/candidate/CandidateLayout.tsx)
- [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx)

Ces fichiers gardent leur architecture existante :

- AuthProvider gère l’état Supabase session;
- useCandidate charge le candidat via `auth.user.id` → `candidates.user_id`;
- routing et guards restent réglementés;
- pas de recréation d’une seconde logique de profil.

---

## Redirections supprimées / stabilisées

### Suppression du risque de double navigation
Le `useEffect` de redirection de login a été limité à un seul déclenchement :

- route active : `/candidate/login`
- authentifié : oui
- roles résolus : oui
- redirection déjà tentée : non
- alors : `navigate("/candidate/dashboard", { replace: true })`

À partir de là, un autre rendu ne redémarre pas la navigation.

### Redirection `/candidate` conservée mais non utilisée pour le login
La route index `/candidate` reste autorisée pour l’accès direct, elle redirige vers `/candidate/dashboard` de manière standard.

Elle ne doit plus être traversée au moment du login.

---

## Flux final exact

```text
/candidate/login
      ↓
submit login
      ↓
Supabase signIn
      ↓
session/user confirmé
      ↓
auth.user.id
      ↓
candidates.user_id
      ↓
candidate.id réel
      ↓
UNE SEULE NAVIGATION
      ↓
/candidate/dashboard
```

Le flux ne comporte plus :

- `/candidate/login → /candidate → /candidate/dashboard`
- `/candidate/login → /candidate/login → /candidate/dashboard`
- `/candidate/login → /candidate/profile → /candidate/dashboard`
- `/candidate/login → /candidate/dashboard → autre route → /candidate/dashboard`

---

## Validation effectuée

### Build
Commande exécutée :

```bash
npm run build
```

Résultat vérifié :

- exit code : 0
- build terminé avec succès
- prerender terminé
- aucune erreur de compilation bloquante

Le build affiche seulement des avertissements non bloquants de Vite sur :

- `eval` dans `pdfjs-dist`;
- chunks volumineux après minification.

C’est conforme à l’état actuel du projet et ne change pas le comportement de navigation candidat.

### Test navigateur automatisé
Aucun test navigateur automatisé n’était disponible dans ce contexte VS Code. Je ne prétends donc pas à un test de navigateur réel.

Le niveau de validation réellement exécuté est donc :

- audit de code source des redirections;
- vérification des fichiers de routing/auth;
- build de production validé.

---

## Conclusion

Le problème de navigation multiple après login candidat provenait bien d’une redirection de page non verrouillée dans [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx).

La cause n’était ni dans la base de données, ni dans la logique de profil candidat, ni dans l’architecture Supabase Auth déjà unifiée.

La correction a été appliquée de manière minimale et ciblée :

- une seule navigation autorisée après authentification réussie ;
- remplacement de la route de login dans l’historique navigateur ;
- élimination du risque de redirection multiple sur re-rendu.

Le flux candidat est désormais cohérent et stabilisé autour d’une seule navigation finale vers `/candidate/dashboard`.
