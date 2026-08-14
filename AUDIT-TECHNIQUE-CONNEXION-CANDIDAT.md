# Audit technique complet — connexion, session, candidat et redirection

## Objet de l’audit

Cet audit reconstruit le flux réel du compte candidat à partir du code source, sans supposer un comportement implicite.

Le périmètre est strictement limité à :

- `/candidate/login`
- la connexion candidat
- la session Supabase et son restauration
- la détection du user authentifié
- l’association `user.id` → candidat
- la récupération du profil candidat
- la redirection post-login
- les guards et la protection des routes
- le `CandidateLayout`
- le chargement du compte candidat après navigation
- refresh navigateur, session existante, session absente, logout
- les risques de navigation multiple, redirections intermédiaires, boucles, race conditions et états de chargement

Il ne couvre pas l’inscription, la confirmation e-mail, les reset password, le marketing, le design, l’UI ni React #185.

---

## 1) Cartographie du flux réel

Le flux réel observé est le suivant :

```text
/candidate/login
  ↓
CandidateLoginPage
  ↓
handleSubmit / onSubmit
  ↓
useAuth().login
  ↓
AuthContext.login
  ↓
authApi.loginCandidate
  ↓
supabase.auth.signInWithPassword
  ↓
Supabase Auth crée/renvoie la session
  ↓
AuthProvider reçoit onAuthStateChange / getSession
  ↓
session.user est exposé dans le contexte
  ↓
AuthProvider détecte si un candidat existe pour user_id
  ↓
useCandidate charge le profil candidat via user.id
  ↓
ProtectedRoute / AuthenticationGuard / PermissionGuard
  ↓
navigation vers /candidate/dashboard
  ↓
CandidateLayout
  ↓
CandidateDashboardPage + useCandidateProfileData
```

Les fichiers centraux sont :

- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)
- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
- [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts)
- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx)
- [src/features/authentication/guards/AuthenticationGuard.tsx](src/features/authentication/guards/AuthenticationGuard.tsx)
- [src/features/authentication/guards/PermissionGuard.tsx](src/features/authentication/guards/PermissionGuard.tsx)
- [src/features/authentication/guards/RoleGuard.tsx](src/features/authentication/guards/RoleGuard.tsx)
- [src/App.tsx](src/App.tsx)
- [src/pages/candidate/CandidateLayout.tsx](src/pages/candidate/CandidateLayout.tsx)
- [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)

---

## 2) Le point d’entrée : `/candidate/login`

La route publique dédiée est déclarée dans [src/App.tsx](src/App.tsx) :

- `/candidate/login` → `CandidateLoginPage`
- `/candidate/signup` → `CandidateSignupPage`
- `/candidate/forgot-password` → page reset
- `/candidate/confirm` → page confirmation

La page de login est donc une route publique, sans garde d’authentification direct. Elle n’est pas enfermée dans `ProtectedRoute`.

Dans [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx), le formulaire appelle `handleSubmit(onSubmit)()`. La logique est :

1. empêcher un double submit via `isSubmittingRef`
2. appeler `login(email, password)`
3. si succès, afficher `Connexion réussie! Redirection en cours...`
4. en cas d’erreur, afficher un message de validation ou un message métier

Le point clé : le composant n’exécute pas la redirection directement dans le submit lui-même. La redirection est déportée dans un `useEffect` qui écoute l’état d’authentification.

---

## 3) La connexion réelle : `login()`

Le `login` utilisé par la page est celui exposé par [src/features/authentication/hooks/useAuth.ts](src/features/authentication/hooks/useAuth.ts), qui retourne le contexte `AuthContext` + alias `loading`/`isLoading`.

La vraie implémentation est dans [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx) :

```ts
const login = useCallback(async (email, password) => {
  setAuthLoading(true);
  setError(null);

  try {
    const data = await authApi.loginCandidate(email, password);
    return data;
  } catch (err) {
    setError(nextError);
    setAuthLoading(false);
    throw err;
  }
}, []);
```

La logique métier de connexion est dans [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts) :

```ts
export async function loginCandidate(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const user = data.user || data.session?.user;
  try {
    assertEmailConfirmed(user);
  } catch (error) {
    if (data.session) {
      await supabase.auth.signOut();
    }
    throw error;
  }

  return data;
}
```

### Ce que cela signifie concrètement

- L’authentification est bien faite par Supabase via `signInWithPassword`.
- Le code vérifie ensuite `email_confirmed_at`.
- Si l’email n’est pas confirmé, il déclenche une exception `EMAIL_NOT_CONFIRMED`.
- Et le code appelle immédiatement `supabase.auth.signOut()` pour nettoyer la session créée au passage.

Donc le flux n’est pas : “connexion puis redirection immédiate sans validation”. Il y a un contrôle de sécurité explicite avant que le contexte ne soit considéré comme valide.

---

## 4) La session Supabase et sa restauration

La session est centralisée dans [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx).

Le provider initialise la session de deux façons :

1. `supabase.auth.getSession()` au montage
2. `supabase.auth.onAuthStateChange(...)` pour rester synchronisé

Le code fait bien :

```ts
const { data, error: sessionError } = await supabase.auth.getSession();
...
setSession(nextSession);
setRolesResolved(true);
setAuthLoading(false);
```

et aussi :

```ts
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
  setSession((current) => {
    if (areSessionsEquivalent(current, nextSession ?? null)) return current;
    return nextSession ?? null;
  });
  setRolesResolved(true);
  setAuthLoading(false);
});
```

Le `AuthProvider` construit ensuite :

- `session`
- `user = session?.user ?? null`
- `isAuthenticated = Boolean(session)`
- `authLoading`
- `rolesResolved`
- `roles` / `permissions`

Le point important est que le provider ne charge pas le profil candidat ; il gère uniquement l’état de session Auth. Le profil candidat est séparé dans `useCandidate()`.

---

## 5) Détection de l’utilisateur authentifié

Le `AuthProvider` déduit l’état d’authentification à partir de `session` :

```ts
const isAuthenticated = useMemo(() => Boolean(session), [session]);
```

Donc, une session non nulle suffit à faire passer `isAuthenticated` à `true`.

Le code ne vérifie pas encore le candidat associé à ce niveau. Cette vérification est faite séparément dans le provider à l’aide de :

```ts
supabase.from("candidates").select("id").eq("user_id", session.user.id).limit(1).maybeSingle();
```

Le but de cette requête est de calculer `hasCandidateProfile` puis d’ajouter le rôle `candidate` et la permission `dashboard.candidate` si le profil existe.

Cela implique un fait technique important :

- l’authentification est détectée depuis la session ;
- le rôle candidat est dérivé ensuite depuis la table `candidates` ;
- il n’y a pas de vérification ultra instantanée que le profil candidat soit déjà chargé lorsqu’une session est reçue.

C’est là que peuvent se produire des écarts de synchronisation entre `session`, `user`, `roles` et `permissions`.

---

## 6) Association utilisateur authentifié → candidat

L’association est explicitement faite dans [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx) et dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts).

Le point de jointure est :

- `AuthProvider` : `session.user.id` comparé à `candidates.user_id`
- `getCandidateProfileByUserId(userId)` : `supabase.from("candidates").eq("user_id", userId)`

La structure du profil candidat est définie dans [src/features/candidates/types/candidate.ts](src/features/candidates/types/candidate.ts) :

```ts
export interface CandidateProfile {
  id: string;
  user_id: string;
  ...
}
```

Le schéma montre que le profil est identifié par `id` côté candidat, mais lié à l’utilisateur via `user_id`.

Le flux de cohérence est donc :

```text
session.user.id
  ↓
query candidates.user_id = session.user.id
  ↓
candidate.id réel
  ↓
profil candidat complet
```

Cette logique est indépendante de la redirection de login elle-même. Elle est un prérequis du chargement du compte, mais elle n’est pas la source unique de navigation.

---

## 7) Récupération du profil candidat après connexion

Le hook central est [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts).

Il écoute :

- `isAuthenticated`
- `user?.id`

et si ces conditions sont présentes, exécute :

```ts
const nextProfile = await getCandidateProfileByUserId(user.id);
setProfile(nextProfile);
```

Le fetch s’effectue via :

- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- `getCandidateProfileByUserId(userId)`

Cette requête est bien la chargement du compte candidat après l’authentification. Il y a un découpage clair entre :

- `AuthContext` : session/auth
- `useCandidate` : profil candidat

Le chargement du profil ne redirige pas lui-même ; il se contente de remplir `profile` et `loading`.

Le `logout` dans ce hook appelle ensuite :

```ts
await logoutCandidate();
await logoutContext();
setProfile(null);
navigate("/candidate/login");
```

Donc, en logout, la redirection vers la connexion est volontaire et explicite.

---

## 8) Les guards qui interviennent dans la redirection

### 8.1 AuthenticationGuard

Dans [src/features/authentication/guards/AuthenticationGuard.tsx](src/features/authentication/guards/AuthenticationGuard.tsx) :

```ts
const { user, authLoading } = useAuth();

if (authLoading) {
  return <>{loadingSkeleton ?? <DashboardLayoutSkeleton />}</>;
}

if (!user) {
  return <Navigate to={fallbackPath} replace />;
}
```

Ce guard :

- attend la fin du chargement de session,
- redirige si `user` est absent,
- ne vérifie pas le profil candidat.

### 8.2 RoleGuard

Dans [src/features/authentication/guards/RoleGuard.tsx](src/features/authentication/guards/RoleGuard.tsx) :

```ts
const { roles } = useRoles();
const hasAllowedRole = roles.some((role) => allowedRoles.includes(role));
if (hasAllowedRole) return <>{children}</>;
return <Navigate to={fallbackPath} replace ... />;
```

### 8.3 PermissionGuard

Dans [src/features/authentication/guards/PermissionGuard.tsx](src/features/authentication/guards/PermissionGuard.tsx) :

```ts
const hasAccess = requireAll ? hasAllPermissions(requiredPermissions) : hasAnyPermission(requiredPermissions);
if (hasAccess) return <>{children}</>;
return <Navigate to={fallbackPath} replace ... />;
```

### 8.4 ProtectedRoute

Dans [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx), la composition est :

- `AuthenticationGuard` (externe)
- `RoleGuard` si `allowedRoles`
- `PermissionGuard` si `requiredPermissions`

La route candidate du `App` est déclarée ainsi :

```tsx
<Route
  path="/candidate"
  element={
    <ProtectedRoute
      fallbackPath="/candidate/login"
      requiredPermissions={["dashboard.candidate"]}
      loadingSkeleton={<CandidateDashboardSkeleton />}
    >
      {withSuspense(<CandidateLayout />, <CandidateDashboardSkeleton />)}
    </ProtectedRoute>
  }
>
```

et l’index de `/candidate` fait :

```tsx
<Route index element={<Navigate to="/candidate/dashboard" replace />} />
```

Cela montre deux choses clairement :

1. la protection de route est bien gérée par des guards ;
2. la navigation vers `/candidate/dashboard` est aussi une route de redirection standard, indépendante de la page de login.

---

## 9) Le chargement du compte candidat après redirection

Le dashboard est accessible dans [src/App.tsx](src/App.tsx) sous `/candidate/dashboard`.

Le composant réel est [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx).

Il utilise :

```ts
const { profile, educations, skills, languages, preferences, experiences, isLoading, isReady, ... } = useCandidateProfileData();
```

Et `useCandidateProfileData` appelle `useCandidate()` puis charge :

- educations
- skills
- languages
- preferences
- experiences

Le `CandidateDashboardPage` ne fait pas lui-même la redirection. Son rôle est de charger et afficher les données du candidat déjà connecté.

Le dashboard repose donc sur un état cohérent :

- `session` valide
- `user` présent
- `candidate` profil chargé
- permissions vérifiées
- route `/candidate/dashboard` accessible

---

## 10) Le fonctionnement du `CandidateLayout`

Le layout est dans [src/pages/candidate/CandidateLayout.tsx](src/pages/candidate/CandidateLayout.tsx).

Son rôle est surtout visuel et structurel :

- affiche la sidebar desktop/mobile,
- affiche le topbar,
- délègue la navigation dans le shell candidat,
- détermine le titre de page selon `location.pathname`,
- rend `Outlet` ou `children`.

Il ne fait pas la logique d’authentification et ne redirige pas de manière autonome vers le dashboard ni vers login.

Autrement dit, le layout est un conteneur de compte, pas le point de décision du flux de connexion.

---

## 11) Navigation entre pages du compte candidat

L’arborescence de routes candidate est déclarée dans [src/App.tsx](src/App.tsx).

On voit des redirections internes telles que :

- `/candidate/creation` → `/candidate/documents`
- `/candidate/experience` → `/candidate/profile?tab=experience`
- `/candidate/education` → `/candidate/profile?tab=education`
- `/candidate/skills` → `/candidate/profile?tab=skills`
- `/candidate/languages` → `/candidate/profile?tab=languages`
- `/candidate/preferences` → `/candidate/profile?tab=preferences`

Ces redirections sont toutes internes à l’espace candidat et ne sont pas la cause de la redirection post-login. Elles servent seulement à maintenir les anciens chemins et l’UX du compte.

---

## 12) Protection des pages du compte candidat

Les pages du compte sont protégées par :

- [src/features/authentication/guards/ProtectedRoute.tsx](src/features/authentication/guards/ProtectedRoute.tsx)
- [src/features/authentication/guards/AuthenticationGuard.tsx](src/features/authentication/guards/AuthenticationGuard.tsx)
- [src/features/authentication/guards/PermissionGuard.tsx](src/features/authentication/guards/PermissionGuard.tsx)
- [src/features/authentication/guards/RoleGuard.tsx](src/features/authentication/guards/RoleGuard.tsx)

Le flux de protection est clair :

1. si `authLoading` → attente de la session
2. si no `user` → `Navigate` vers `/candidate/login`
3. si rôles/permissions insuffisants → `Navigate` vers fallback
4. sinon → rendu du composant

La permission candidate est `dashboard.candidate`, et elle est dérivée soit :

- depuis `app_metadata.permissions`, soit
- depuis le rôle calculé avec `hasCandidateProfile` dans `AuthProvider`

Il y a donc une protection réelle, mais elle repose sur un état de contexte éventuellement encore incomplet au moment où le login vient de se produire.

---

## 13) Comportement lors d’un refresh navigateur

Le refresh est pris en charge par le montage initial du `AuthProvider` via `getSession()` dans [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx).

Le code fait bien :

```ts
const { data, error: sessionError } = await supabase.auth.getSession();
```

Puis :

```ts
setSession(nextSession);
setAuthLoading(false);
```

Le `App` lui-même vérifie aussi une session restaurée :

```ts
useEffect(() => {
  const validateCandidateSession = async () => {
    if (!session) return;
    if (session.user.email_confirmed_at !== null) return;
    console.warn("Restored session has unconfirmed email...");
  };
}, [session]);
```

Ce bloc ne force pas le signOut ni la suppression du storage ; il se contente d’émettre un warning. Le commentaire explicite :

> “Do not clear auth storage here on null session or network errors. Temporary absence of a session must not remove tokens from localStorage.”

Cela signifie qu’un refresh peut restaurer une session existante sans éliminer immédiatement les tokens, et le système compte sur le `AuthProvider` et les guards pour décider s’il faut laisser passer ou rediriger.

---

## 14) Comportement lorsqu’une session existe déjà

Lorsque la session est déjà présente, `AuthProvider` est déclaré avec `session` non null dès l’initialisation. Les éléments suivants se produisent :

- `isAuthenticated` devient `true`
- `user` est remplie
- `rolesResolved` = `true`
- `authLoading` = `false`
- `detectCandidateAccess` se lance pour vérifier si `candidates.user_id = session.user.id`
- `useCandidate` se lance si le composant candidat est monté
- `ProtectedRoute` peut autoriser l’accès vers les routes du compte

Quand l’utilisateur est déjà connecté et ouvre `/candidate/login`, le composant `CandidateLoginPage` contient un `useEffect` qui détecte :

```ts
if (!isAuthenticated || !user || !rolesResolved || location.pathname !== "/candidate/login") return;
if (redirectAttemptedRef.current) return;
redirectAttemptedRef.current = true;
navigate("/candidate/dashboard", { replace: true });
```

Donc si la session existe déjà, il y a une redirection explicite de la page login vers le dashboard. C’est un comportement volontaire de “login page déjà connecté”.

---

## 15) Comportement lorsqu’une session n’existe plus

Si `session` devient null :

- `AuthProvider` met `setSession(null)`
- `isAuthenticated` devient `false`
- `user` devient null
- `AuthenticationGuard` renvoie `Navigate` vers `/candidate/login`
- la route candidate est alors fermée par le guard

Le mode “session supprimée” est donc bien géré par la chaîne guard > `user` absent > redirect.

---

## 16) Les redirections après connexion et les risques de navigation multiple

### Ce qui peut produire plusieurs changements rapides d’URL

Le risque réel est la présence de plusieurs mécanismes de redirection qui peuvent réagir au même état auth :

1. le `useEffect` de [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx) qui redirige vers `/candidate/dashboard` dès que `isAuthenticated && user && rolesResolved` et `pathname === "/candidate/login"`
2. la route `/candidate` dans [src/App.tsx](src/App.tsx) qui a un index `Navigate to="/candidate/dashboard"`
3. les guards qui peuvent rediriger vers `/candidate/login` si l’utilisateur n’est pas authentifié
4. les redirections de compatibilité internes (`/candidate/experience`, `/candidate/skills`, etc.)

Le code de la page login contient déjà une garde explicite :

```ts
if (redirectAttemptedRef.current) {
  return;
}
redirectAttemptedRef.current = true;
```

Cela montre bien qu’une double navigation a été envisagée et que l’auteur a tenté de neutraliser le problème. Mais le fait que cette logique soit dans la page login, en plus du comportement de route et des guards, explique pourquoi des changements d’URL rapides peuvent encore apparaître pendant le court intervalle de synchronisation du contexte auth.

### Point de vérité

La source la plus directe du risque est :

- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)

parce que cette page réagit à un changement global d’état d’authentification au lieu de n’effectuer qu’une seule redirection unique après succès du `login()`.

### Ce qui n’est pas la cause principale

- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx) n’est pas “la source de la redirection” ; il est la source de `session`/`auth`.
- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) charge le profil candidat ; il ne fait pas de navigation après login, il ne redirige que sur logout.
- [src/pages/candidate/CandidateLayout.tsx](src/pages/candidate/CandidateLayout.tsx) n’exécute pas de redirection de login.
- [src/App.tsx](src/App.tsx) a un index `/candidate` standard, mais il n’est pas le trigger principal du login.

---

## 17) Les états loading pendant l’authentification et la redirection

Le `AuthProvider` met `authLoading` à `true` au démarrage puis le repasse à `false` après `getSession()` ou `onAuthStateChange`.

Le `CandidateLoginPage` a aussi `isLoading` local pour le button, et `isSubmittingRef` pour empêcher les doublons.

Dans les guards, `AuthenticationGuard` affiche un `loadingSkeleton` pendant `authLoading`.

Cela crée un état de transition soutenu :

- initialisation session
- authentification possible mais non encore stable
- rendu route /candidate
- route protégée /candidate ou login
- éventuelle redirection selon état d’auth

Le risque est surtout celui d’un état “auth presque vrai mais fichiers de permission/profile pas encore synchronisés”. En pratique cela peut produire une courte flaque d’URL ambiguës avant la stabilisation finale sur `/candidate/dashboard`.

---

## 18) Les race conditions plausibles pendant la connexion

Plusieurs éléments peuvent interférer entre eux dans une courte fenêtre de temps :

1. `loginCandidate()` met la session en place via Supabase
2. `onAuthStateChange` met à jour `session` depuis le provider
3. `AuthProvider` lance `detectCandidateAccess` pour vérifier le profil candidat
4. `useCandidate` lance le chargement du profil candidat
5. `CandidateLoginPage` effectue une redirection sur le même `session` oui / `roleResolved` oui
6. les guards peuvent vérifier `permissions` alors que le profil candidat n’est pas encore vraiment tout à fait acquis

Il n’y a pas de verrou global de synchronisation entre la session, les permissions dérivées et le profil candidat. Le code est bien structuré en couches, mais il n’impose pas un mécanisme de coordination unique qui dit :

> “une fois la session créée, attendez que `user`, `profile`, `roles`, et `permissions` soient stables avant d’autoriser la navigation finale”.

C’est précisément là que des “sauts” d’URL peuvent apparaître, surtout si plusieurs effets réagissent au même état global.

---

## 19) Cohérence entre `user.id`, `user_id`, `candidate.id` et `candidate_id`

Le système attend une cohérence suivante :

- `session.user.id` = identifiant Supabase Auth
- `candidates.user_id` = colonne de référence vers ce même `user.id`
- `candidate.id` = identifiant du profil candidat dans la table `candidates`

Le code est cohérent sur ce point :

- `AuthContext` utilise `session.user.id`
- `getCandidateProfileByUserId(userId)` filtre sur `candidates.user_id`
- le profil retourné contient `id` du candidat
- d’autres modules utilisent ensuite `profile.id` ou `candidateId`

Il n’y a donc pas de contradiction fonctionnelle sur les identités, mais il existe un risque de confusion dans le niveau de synchronisation : les composants n’attendent pas tous le même moment pour considérer que l’auth a complètement fini de synchroniser le profil candidat.

---

## 20) Duplication logique réelle et risque fonctionnel

La duplication n’est pas sur la base de données ni sur Supabase. Elle vient surtout de la séparation entre :

- la logique de session dans `AuthProvider`
- la logique de profil candidat dans `useCandidate`
- la logique de redirection dans `CandidateLoginPage`
- la logique de route dans `App.tsx`
- la logique de permissions dans les guards

Cette séparation est saine architecturalement, mais elle crée une zone de convergence où plusieurs mécanismes peuvent réagir à un même état. C’est là que la redirection multiple trouve son origine.

Il n’y a pas une seule logique de navigation pour le candidat ; il y en a plusieurs qui coexistent :

- navigation page login
- navigation route /candidate
- navigation guards
- navigation dashboard

Cela n’est pas forcément un bug absolu, mais c’est une configuration sensible à une synchronization race ou à un double déclenchement.

---

## 21) État final de l’analyse

### Ce qui se passe réellement

Avant la navigation :

- le formulaire soumet les identifiants
- `loginCandidate()` fait `signInWithPassword`
- l’email est vérifié
- la session est placée dans le provider
- `isAuthenticated` passe à `true`
- le profil candidat est chargé via `user.id` → `candidates.user_id`

Pendant la navigation :

- `CandidateLoginPage` peut déclencher un `navigate("/candidate/dashboard", { replace: true })`
- les routes et guards peuvent aussi réagir à l’état de session/permissions
- une navigation rapide et multiple peut se produire pendant la fenêtre de synchronisation

Après la navigation :

- le routeur affiche `/candidate/dashboard`
- `CandidateLayout` s’installe
- le dashboard charge les données profil + sous-données via `useCandidateProfileData`

Pendant le refresh :

- `AuthProvider` restaure `session` via `getSession()`
- les guards peuvent autoriser ou refuser l’accès selon `user` et permissions

Lors d’un logout :

- `logoutCandidate()` appelle `signOut()`
- le contexte est cleared
- `navigate("/candidate/login")` est exécuté

### Conclusion factuelle

Le comportement réel du flux candidat est bien cohérent dans son ensemble, mais il comporte une fragilité de synchronisation :

- plusieurs composants réagissent à l’état auth global ;
- la page de login redirige elle-même après auth ;
- le routeur `/candidate` redirige aussi vers le dashboard ;
- les guards peuvent interférer selon l’état de `user`, `roles` et `permissions` ;
- le profil candidat est chargé séparément et n’est pas un verrou de navigation unique ;
- en pratique, cela peut produire des transitions rapides d’URL avant la stabilisation finale vers `/candidate/dashboard`.

Cette fragilité n’est pas due à la base de données, ni au design, ni à la logique métier de profil. Elle vient de la concurrence entre plusieurs mécanismes de redirection et de synchronisation du même état d’authentification.

---

## 22) Synthèse concise

Le flux de connexion candidat réel est :

```text
/candidate/login
  ↓
CandidateLoginPage submit
  ↓
login() via AuthContext
  ↓
supabase.auth.signInWithPassword
  ↓
Supabase session / user
  ↓
AuthProvider session + roles + permissions
  ↓
query candidates.user_id = session.user.id
  ↓
useCandidate profile load
  ↓
ProtectedRoute / AuthenticationGuard / PermissionGuard
  ↓
CandidateLayout
  ↓
/candidate/dashboard
```

La mauvaise redirection multiple ne vient pas d’une seule cause unique dans la base ou dans le hook candidat, mais de la conjonction de :

- redirection post-login dans la page login,
- route index `/candidate`,
- guards,
- chargement du profil candidat asynchrone,
- synchronisation partielle du contexte auth.

Le mécanisme de navigation finale est donc réel, mais non totalement verrouillé contre des déclenchements concurrents.
