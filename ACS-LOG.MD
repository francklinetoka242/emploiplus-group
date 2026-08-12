# Vérification factuelle du correctif

## 1) Fonction `login()` actuelle (extrait complet)
Fichier : src/features/authentication/context/AuthContext.tsx

```ts
const login = useCallback(
  async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setIsProfileLoading(true);

    try {
      const data = await authApi.loginCandidate(email, password);

      // If signInWithPassword returned a session, use it directly to update the context.
      const sessionFromSignIn = (data as any)?.session ?? null;

      if (sessionFromSignIn) {
        // Resolve roles (with timeout) but set session immediately so UI sees authenticated state.
        const resolved = await resolveSessionRolesSafely(sessionFromSignIn);
        startTransition(() => {
          setSession(resolved ?? sessionFromSignIn);
        });
      } else {
        // Fallback: try to refresh session from storage / supabase client
        const refreshed = await refreshSession(true);
        if (!refreshed) {
          throw new Error("Impossible de récupérer la session après connexion.");
        }
      }

      // Ensure profile is loaded before resolving
      await refetchProfile();

      return data;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : String(err);
      setError(nextError);
      throw err;
    } finally {
      setIsProfileLoading(false);
      setIsLoading(false);
    }
  },
  [refreshSession, refetchProfile],
);
```

- Ce que faisait la version *avant* le correctif :
  - Appelait `authApi.loginCandidate(...)` puis appelait systématiquement `await refreshSession(true)` (qui exécute `authApi.getCandidateSession()` → `supabase.auth.getSession()`), puis `refetchProfile()`. La mise à jour du contexte `session` dépendait donc du `getSession()` ou de `onAuthStateChange`, provoquant la condition de course.

- Ce que fait la version *maintenant* :
  - Appelle `authApi.loginCandidate(...)`.
  - Si `loginCandidate` retourne une `session` dans `data.session`, le code appelle `resolveSessionRolesSafely(session)` (await), puis fait `startTransition(() => setSession(resolved ?? sessionFromSignIn))`.
  - Sinon (pas de session retournée), il retombe sur `refreshSession(true)` (comportement fallback inchangé).
  - Enfin, appelle `refetchProfile()`.

- À quel moment `session` est récupérée :
  - Soit à partir de la valeur retournée par `authApi.loginCandidate(...)` (si `data.session` présent) — cette session est stockée dans `sessionFromSignIn`.
  - Sinon via `refreshSession(true)` (qui appelle `authApi.getCandidateSession()` → `supabase.auth.getSession()`).

- À quel moment `setSession()` est appelé :
  - Si `sessionFromSignIn` existe : après `await resolveSessionRolesSafely(sessionFromSignIn)` le code appelle `startTransition(() => setSession(resolved ?? sessionFromSignIn))`.
    - Remarque importante : le `setSession()` est appelé **après** la résolution (ou le timeout) de `resolveSessionRolesSafely`.
  - Si `sessionFromSignIn` absent et `refreshSession(true)` réussit : `refreshSession` lui-même appelle `setSession(...)` (via startTransition) à l'intérieur.

- À quel moment `user` devient disponible :
  - `user` est dérivé de `session?.user`. `user` devient donc disponible immédiatement après que `setSession(...)` ait été exécuté et React ait rendu. Dans le chemin principal (sessionFromSignIn present), cela se produit après le `await resolveSessionRolesSafely(...)` puis le `setSession(...)`.

- À quel moment `refreshSession(true)` est encore appelé :
  - Uniquement dans le cas où `authApi.loginCandidate(...)` n'a pas fourni de `data.session` (le `else` du code). Dans ce cas on exécute `const refreshed = await refreshSession(true);` et on exige qu'il retourne une session valide sinon on lève une erreur.

---

## 2) Résultat exact de `authApi.loginCandidate()`
Fichier : src/features/authentication/api/authApi.ts

Fonction complète (extrait pertinent) :

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

- Ce que retourne `loginCandidate()` exactement :
  - Il retourne la variable `data` renvoyée par `supabase.auth.signInWithPassword(...)`.
  - La forme de `data` provient directement du client Supabase : typiquement un objet qui peut contenir `session` et `user` (ex. `{ session: Session | null, user: User | null, ... }`) suivant la version de `@supabase/supabase-js`.
  - Si `signInWithPassword` renvoie une erreur, `loginCandidate` la propage (throw).

- Vérification si `data.session` / `data.user` existent :
  - Le code de `loginCandidate` accède explicitement à `data.session?.user` pour déterminer `user`, donc `data.session` est attendu et possible.
  - En conséquence, `AuthContext.login()` récupère `(data as any)?.session` — la session retournée par Supabase est bien transmise à `AuthContext.login()` quand `signInWithPassword` la renvoie.

---

## 3) Analyse du fallback `refreshSession(true)`

Rappel du comportement corrigé :
- Si `signInWithPassword` retourne une session (`data.session`), le code USE cette session.
- Sinon, on exécute `refreshSession(true)` qui appelle `authApi.getCandidateSession()` → `supabase.auth.getSession()` (avec retries).

### Cas A — `signInWithPassword()` → session disponible
- Flux : `loginCandidate()` retourne `data.session` → `AuthContext` appelle `resolveSessionRolesSafely(sessionFromSignIn)` (await) → `setSession(...)`.
- Comportement : la session est maintenant injectée dans le contexte sans effectuer `getSession()` depuis le client Supabase.
- Conclusion : ce chemin évite la lecture immédiate concurrente de `getSession()` et la cause principale du double-clic (lecture trop précoce de `getSession()`) est **partiellement** évitée.

Important à noter (cause résiduelle) :
- Le code **attend** `resolveSessionRolesSafely(...)` (via `await`) AVANT d'appeler `setSession(...)`. `resolveSessionRolesSafely` effectue une résolution de rôles et peut attendre jusqu'à 2500 ms (timeout). Donc `setSession` **peut être retardé** pendant cette résolution — ce délai peut toujours empêcher la navigation immédiate après le premier clic si la résolution des rôles est lente. Autrement dit : la session est disponible, mais la mise à jour du contexte est retardée jusqu'à la fin (ou timeout) de la résolution des rôles.

### Cas B — `signInWithPassword()` → session null
- Flux : `loginCandidate()` ne retourne pas de session → `AuthContext` appelle `refreshSession(true)` → `authApi.getCandidateSession()` appelle `supabase.auth.getSession()` → potentielle race persistante.
- Ce chemin **reste** vulnérable au problème initial : si `supabase.auth.getSession()` retourne `null` à cause de la latence interne de supabase-js (écriture dans storage / internal restore), `refreshSession(true)` peut échouer/retry et l'UI restera non authentifiée jusqu'à ce que `onAuthStateChange` ou un retry apporte la session.
- Conclusion : ce fallback peut encore provoquer un comportement nécessitant 2 clics dans les cas où `signInWithPassword` ne fournit pas de session (ou si Supabase renvoie session=null pour d'autres raisons).

---

## 4) Vérification de `onAuthStateChange(...)`
Fichier : src/features/authentication/context/AuthContext.tsx (bloc d'initialisation)

Extrait (tel quel) :

```ts
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
  console.log("[AuthContext] onAuthStateChange event:", {
    event,
    email: nextSession?.user?.email ?? null,
    session: nextSession,
  });

  if (!isMounted) return;

  setTimeout(() => {
    if (!isMounted) return;

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      if (nextSession) {
        startTransition(() => {
          setSession(nextSession);
        });
      }
    } else if (event === "SIGNED_OUT") {
      startTransition(() => {
        setSession(null);
      });
    }
  }, 0);
});
```

- `setTimeout(..., 0)` : existe toujours.
- `startTransition` : existe toujours.
- Où utilisés : dans le `onAuthStateChange` callback enregistré dans le `useEffect` d'initialisation du `AuthProvider`.
- Ce qu'ils font :
  - `setTimeout(..., 0)` repousse l'exécution du bloc d'un tick (macro-task), introduisant un micro-délai.
  - `startTransition` marque l'état comme "transition" (React concurrent mode) et peut rendre la mise à jour non urgent(e).
- Impact possible :
  - Ces deux mécanismes introduisent un petit délai entre l'événement d'auth (p.ex. `SIGNED_IN`) et l'effet visible (`session` mis à jour dans le contexte). Ainsi, si on dépend exclusivement de `onAuthStateChange` pour observer la session, un court délai existe toujours.
  - Dans le chemin principal (on utilise la session renvoyée par `signInWithPassword`), `onAuthStateChange` est un mécanisme additionnel mais reste susceptible de mettre à jour le contexte (après un léger délai) si le client Supabase émet l'événement.

---

## 5) Flux complet après correctif — mappage code → étape

1. CandidateLoginPage.onSubmit
   - Fichier : src/pages/candidate/CandidateLoginPage.tsx
   - Fonction : `onSubmit` appelle `login(values.email, values.password)` (exposé par `useAuth()`).

2. useAuth() → AuthContext.login()
   - Fichier : src/features/authentication/context/AuthContext.tsx
   - Fonction : `login(email, password)` (extrait ci-dessus).

3. `authApi.loginCandidate()`
   - Fichier : src/features/authentication/api/authApi.ts
   - Appel : `supabase.auth.signInWithPassword({ email, password })`. Retourne `data` (éventuellement `{ session, user }`).

4. `signInWithPassword()` (Supabase SDK)
   - Fournit (selon cas) `data.session` et `data.user` synchrones dans la réponse.

5. `session` (si présent dans `data.session`)
   - Récupéré immédiatement dans `AuthContext.login()` comme `sessionFromSignIn`.

6. `AuthContext.setSession()`
   - **Actuel comportement** : le code attend `await resolveSessionRolesSafely(sessionFromSignIn)` puis appelle `startTransition(() => setSession(resolved ?? sessionFromSignIn))`.
   - (Sinon, fallback via `refreshSession(true)` qui appelle `getSession()` et invoque `setSession(...)` à l'intérieur.)

7. `user` devient disponible
   - `user` = `session.user` ; devient disponible dans le contexte après exécution de `setSession(...)` et rerender React.

8. `isAuthenticated` devient true
   - `isAuthenticated` est dérivé de `Boolean(session)` ; devient true après `setSession`.

9. `roles`
   - Résolution : `resolveSessionRolesSafely()` a tenté de résoudre les rôles (DB call) avant le `setSession` dans le code actuel; si la résolution a retourné une version enrichie, `setSession` contient `user.app_metadata.roles = resolvedRoles`; sinon la session initiale est utilisée et `roles` restera vide jusqu'à une résolution ultérieure.

10. CandidateLoginPage `useEffect` observe `isAuthenticated && user` et exécute `navigate(redirectUrl)`
    - Fichier : src/pages/candidate/CandidateLoginPage.tsx
    - Ce `useEffect` déclenchera la navigation dès que les conditions sont remplies (c.-à-d. après que `setSession` ait été appliqué et que React ait rendu).

---

## 6) Vérification spéciale de la redirection (CandidateLoginPage)

Fichier : src/pages/candidate/CandidateLoginPage.tsx — useEffect pertinent :

```ts
useEffect(() => {
  if (isAuthenticated && user) {
    const isAdmin = Array.isArray(roles) && roles.includes("admin");
    const redirectUrl = isAdmin ? "/admin/dashboard" : "/candidate/dashboard";
    navigate(redirectUrl, { replace: true });
  }
}, [isAuthenticated, user, roles, navigate]);
```

- Le premier clic peut provoquer `isAuthenticated = true` et `user != null` **si** `setSession(...)` est exécuté avant la fin du `login()` (et donc avant le `finally` qui met `isLoading` à false).
- Dans le chemin actuel où `data.session` est présent mais la fonction attend `resolveSessionRolesSafely(...)` AVANT `setSession`, la redirection ne peut se produire tant que `setSession` n'a pas été appelé. Ainsi, si `resolveSessionRolesSafely` est lent, la navigation peut être retardée et le premier clic ne déclenchera pas la redirection immédiatement.
- La logique de sélection `admin → /admin/dashboard` vs `candidate → /candidate/dashboard` est basée sur `roles`. Dans le code actuel, `roles` est dérivé de la session (via `getAuthMetadataFromSession(session)`), donc si `setSession` inclut déjà les rôles résolus, la navigation choisira la bonne destination immédiatement ; sinon si `roles` n'est pas encore résolu, `isAdmin` peut être false au moment du test et rediriger par défaut vers `/candidate/dashboard` (ou l'application peut attendre que `roles` change — mais dans ce code la redirection est recalculée aussi quand `roles` change, car `roles` est dans la dépendance du useEffect).

---

## 7) Risque lié aux rôles (séparation AUTHENTIFICATION / AUTORISATION)

- `session disponible` et `roles disponibles` sont **deux étapes distinctes** :
  - `session` est fourni par Supabase et peut être disponible immédiatement à la réponse du `signInWithPassword`.
  - `roles` sont résolus via `resolveSessionRoles()` (lecture de `user_roles` en DB) — opération asynchrone, potentiellement lente.
- Dans l'implémentation actuelle du correctif :
  - `resolveSessionRolesSafely(sessionFromSignIn)` est `await`é avant `setSession(...)`. Donc **le code attend la résolution des rôles (ou le timeout)** avant d'appeler `setSession` (donc `user` et `isAuthenticated`).
  - Conséquence : la redirection ne sera déclenchée qu'après la résolution (ou timeout) — ce qui garantit que `roles` sont disponibles au moment du `setSession`, mais au prix d'un délai (jusqu'à 2.5s possible).
- Est-ce que la redirection peut être déclenchée avant que les rôles soient disponibles ?
  - Avec l'implémentation actuelle : **non**, parce que `setSession` est appelé après la tentative de résolution des rôles (ou fallback). Donc la redirection ne survient qu'une fois `setSession` défini, et `roles` sont pris en compte si la résolution a complété avec succès.
  - Toutefois, si la résolution échoue rapidement et retourne la session sans rôles (via timeout), `roles` seront vides et l'effet de redirection peut choisir la voie par défaut (non-admin).

---

## 8) Routes protégées — effet possible du nouveau comportement

- Scénario possible :
  - `session` devient valide (set via `setSession`) mais `roles` encore vide (si on mettait session avant résolution) → certaines guards basées sur `roles` pourraient refuser l'accès.
- Dans l'implémentation actuelle :
  - `setSession` est appliqué **après** la résolution des rôles (ou après timeout de `resolveSessionRolesSafely`), donc il est peu probable que l'on se retrouve dans l'état `session valide` + `roles temporairement vide` **immédiatement après setSession**, car le code attend la résolution avant de setSession.
  - Si la résolution a timed out et n'a pas enrichi les rôles, `roles` seront vides effectivement au moment du `setSession`. Dans ce cas `RoleGuard` (qui vérifie `roles`) pourrait rediriger si roles manquent. Toutefois `RoleGuard` affiche un skeleton pendant `loading`, et son `loading` provient du hook `useRoles` qui s'appuie sur `AuthContext`. Concrètement, il reste un risque fonctionnel si la résolution des rôles se fait séparément et plus tard.
- Résumé : le nouveau comportement réduit le risque d'une lecture prématurée `session && roles manquants` (car on attend la résolution), mais s'il y a un timeout ou une résolution lente, il peut y avoir un retard dans l'accès aux routes.

---

## CONCLUSION (format exigé)

### CORRECTIF ACTUEL

#### Ce qui est réellement corrigé
- Le code utilise désormais la session retournée par `supabase.auth.signInWithPassword(...)` (via `authApi.loginCandidate()`) lorsqu'elle est présente, évitant ainsi d'appeler immédiatement `supabase.auth.getSession()` comme unique source de vérité après signin. Cela élimine la cause principale de la race entre écriture du token en storage et lecture immédiate de `getSession()` dans le cas où `signInWithPassword` fournit la session synchronement.

#### Ce qui n'est pas corrigé
- Le code **attend** `resolveSessionRolesSafely(sessionFromSignIn)` (await) avant d'appeler `setSession(...)`. Parce que `resolveSessionRolesSafely` peut effectuer un appel DB et peut retarder jusqu'à ~2500 ms (timeout), la mise à jour du `AuthContext.session` — et donc la disponibilité de `user`/`isAuthenticated` — peut être retardée. Ce délai peut encore empêcher la redirection immédiate sur le premier clic si la résolution des rôles est lente.
- Le chemin fallback où `signInWithPassword()` ne retourne pas de `session` reste inchangé : il retombe sur `refreshSession(true)` qui (via `getSession()`) peut toujours rencontrer la race initiale. Ce cas peut encore nécessiter un second clic si `getSession()` est temporairement null.
- `onAuthStateChange` contient toujours `setTimeout(..., 0)` et `startTransition(...)`, ce qui introduit un petit délai si l'application dépend de cet événement pour synchroniser la session.

#### Risque que le double clic persiste
MOYEN

Pourquoi : le correctif évite la race classique lorsque `signInWithPassword` renvoie la session, mais la stratégie actuelle attend la résolution des rôles avant de `setSession` (introduisant un nouveau point de latence). De plus, le fallback (absence de session dans la réponse) reste vulnérable à la race initiale. Enfin, `onAuthStateChange` continue d'introduire un micro-délai.

#### Fichiers actuellement concernés
- `src/features/authentication/context/AuthContext.tsx`
- `src/features/authentication/api/authApi.ts`
- `src/features/authentication/context/AuthContext.tsx` (pour `onAuthStateChange` — même fichier, mentionné car impacte délai)
- `src/pages/candidate/CandidateLoginPage.tsx` (consommateur de `isAuthenticated`, `user`, `roles`)

#### Modifications supplémentaires nécessaires
- Pour réduire le risque à `FAIBLE`, il conviendrait **(à valider et appliquer si tu veux)** de :
  1. Ne pas `await` complètement `resolveSessionRolesSafely` avant de `setSession`. Appeler `setSession(sessionFromSignIn)` immédiatement, puis lancer `resolveSessionRolesSafely(sessionFromSignIn)` en tâche de fond et `setSession(resolved)` quand disponible. (Cela rend `user`/`isAuthenticated` immédiatement disponibles et évite les délais de redirection.)  
  2. Conserver `roles` comme étape d'autorisation distincte ; la redirection peut se produire sur `isAuthenticated && user`, et un second `useEffect` ou la mise à jour des `roles` peut ajuster la navigation si nécessaire (p.ex. replace/redirect si destination admin détectée plus tard).  
  3. Évaluer le besoin réel du `setTimeout(...,0)` dans `onAuthStateChange` et envisager de le supprimer pour réduire encore le délai entre l'événement et `setSession`.  
  4. Optionnel : améliorer `authApi.loginCandidate()` pour garantir et documenter si `data.session` est systématiquement fourni par la version de `@supabase/supabase-js` utilisée ; si oui, privilégier ce flux.

Si aucune modification additionnelle n'est demandée immédiatement :
```
Aucune modification supplémentaire nécessaire à ce stade.
```

---

Fin du rapport.
# Audit du système d'authentification — EmploiPlus Group

## 1. Résumé exécutif

Ce document décrit l'analyse complète du système d'authentification (Supabase + React Context) et explique pourquoi la connexion nécessite deux clics dans l'UI. Résumé : le problème provient d'une condition de course entre l'appel de connexion (`supabase.auth.signInWithPassword`) et la lecture synchronisée de la session via `supabase.auth.getSession()` dans le `AuthProvider` (refresh/initialisation). Le listener `onAuthStateChange` existe et finit par mettre à jour le contexte, mais cette mise à jour arrive de façon asynchrone (décalée via `setTimeout(…,0)` + `startTransition`) ; la tentative immédiate de lecture/synchronisation peut échouer (retour `null` ou ancien état) et l'UI n'est pas redirigée au premier clic.

## 2. Architecture actuelle

- Supabase client centralisé : [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
  - `createClient(...)` est utilisé pour créer une instance unique.
  - Options importantes : `auth.storage = window.localStorage`, `storageKey = 'emploiplus-auth-token'`, `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: false`, `flowType: 'implicit'`.

- Auth feature : [src/features/authentication](src/features/authentication)
  - `AuthContext` / `AuthProvider` : [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
  - API wrappers (login, logout, getSession) : [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts)
  - Hooks `useAuth`, `useRoles`, `usePermissions` exposent le contexte.
  - Guards/Protected routes : `AuthenticationGuard`, `ProtectedRoute`, `RoleGuard`, `PermissionGuard`.

## 3. Authentification Candidat (flux détaillé)

Composant d'entrée : [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)

Parcours complet :

- Formulaire candidat → `onSubmit` appelle `login(values.email, values.password)` exposé par `useAuth()`.
  - Fichier : `CandidateLoginPage.tsx`
  - Fonction : `onSubmit`

- `login` (AuthContext)
  - Fichier : `AuthContext.tsx`
  - Fonction : `login(email, password)`
  - Comportement :
    1. `setIsLoading(true)`
    2. appelle `authApi.loginCandidate(email, password)`
    3. appelle `refreshSession(true)` (silent)
    4. attend `refetchProfile()`
    5. résout ou lève une erreur

- `authApi.loginCandidate`
  - Fichier : `authApi.ts`
  - Fonction : `loginCandidate`
  - Comportement : `await supabase.auth.signInWithPassword({ email, password })` puis vérification `email_confirmed_at` et retourne `data`.

- `refreshSession(true)`
  - Fichier : `AuthContext.tsx` → `refreshSession(silent?: boolean)`
  - Comportement : appelle `authApi.getCandidateSession()` qui fait `supabase.auth.getSession()` ; si session OK, `setSession(nextSession)` puis `resolveSessionRolesSafely(nextSession)` et `setSession(resolvedSession)`.

- Destination finale : `CandidateLoginPage` observe `isAuthenticated && user` via `useAuth()` et effectue `navigate(redirectUrl)` (redirect vers `/candidate/dashboard` ou `/admin/dashboard` selon `roles`).

Remarques / points d'attention :

- `loginCandidate` se contente d'appeler `supabase.auth.signInWithPassword(...)` — la mise à jour contextualisée (`setSession`) dépend d'un appel ultérieur à `getSession()` (via `refreshSession`) ou de l'événement `onAuthStateChange` géré dans `AuthContext`.
- `refreshSession(true)` utilise `authApi.getCandidateSession()` → `supabase.auth.getSession()` qui peut retourner `null` si la restauration interne n'est pas encore visible.

## 4. Authentification Admin

- Il n'existe pas de `AdminLoginPage` séparée ; l'application réutilise le même mécanisme d'authentification. Le rôle `admin` est déterminé ensuite et la page `CandidateLoginPage` redirige vers `/admin/dashboard` si `roles` contient `admin`.
- Conclusion : Admin et Candidat utilisent le même mécanisme d'auth (mêmes appels Supabase, même `AuthProvider`). Le bug impacte donc les deux profils.

## 5. Gestion de la session Supabase

- Client centralisé : [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
  - PersistSession: activé (`persistSession: true`) ; stockage: `localStorage`.
  - `storageKey` personnalisé: `'emploiplus-auth-token'`.
  - `autoRefreshToken: true` et `flowType: 'implicit'` (option notable).

- `authApi.getCandidateSession()` appelle `supabase.auth.getSession()` et retourne `data.session` ou `null`. *Important :* la fonction retourne `null` si `user.email_confirmed_at === null` (cas email non confirmé).

## 6. AuthProvider / Context

- Fichier principal : [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
- États exposés : `session`, `user`, `profile`, `roles`, `permissions`, `isLoading`, `isProfileLoading`, `error`, `isAuthenticated`.
- Initialisation :
  - `useEffect` d'initialisation exécute `supabase.auth.getSession()` (wrapped by a 5s timeout) et `resolveSessionRolesSafely(...)` si une session est trouvée.
  - `hasInitializedSessionRef` empêche la ré-initialisation.
- `onAuthStateChange` : attaché dans le même `useEffect` (voir section suivante).

## 7. onAuthStateChange

- Déclaration / initialisation : dans `AuthContext` (même `useEffect` que l'init session). Voir `supabase.auth.onAuthStateChange(...)` dans `AuthContext.tsx`.

- Comportement observé :
  - Le callback logge l'événement et exécute, dans un `setTimeout(..., 0)`, un `startTransition` pour `setSession(nextSession)` lors de `SIGNED_IN` et `TOKEN_REFRESHED`, et `setSession(null)` pour `SIGNED_OUT`.

- Effets :
  - L'utilisation de `setTimeout(..., 0)` + `startTransition` rend la mise à jour du state asynchrone et retardée d'au moins un tick (micro/macro-tâche). Ceci augmente la probabilité d'une condition de course si le code appelant tente de lire la session immédiatement après `signInWithPassword`.
  - Il n'y a qu'un seul listener `onAuthStateChange` dans l'app (pas de listeners multiples détectés).

## 8. Routes protégées

- `ProtectedRoute` compose `AuthenticationGuard` -> `RoleGuard` -> `PermissionGuard`.
- `AuthenticationGuard` : si `isLoading` est vrai → rendu d'un skeleton ; sinon si `!user` → redirige vers `/candidate/login`.
  - Donc tant que `AuthProvider.isLoading` est vrai, les guards n'expirent pas la session.
- `RoleGuard` et `PermissionGuard` se basent sur des hooks (`useRoles`, `usePermissions`) qui lisent `session` / `user` depuis le `AuthContext`.

## 9. Gestion des rôles

- Rôles : combinent `user.app_metadata.roles` et les données de `public.user_roles` lues via `supabase.from('user_roles').select('role')` (voir `resolveSessionRoles` dans `AuthContext.tsx`).
- Cette résolution est asynchrone (DB call) et exécutée via `resolveSessionRolesSafely(...)` qui a un timeout (2.5s) : pendant ce temps, `roles` peut être vide ou incomplet.
- Donc la détermination du rôle est une seconde source d'asynchronisme (mais la redirection initiale ne dépend pas directement des rôles, la page login vérifie `isAuthenticated && user` et choisit la destination en testant `roles`).

## 10. Sources de vérité / multiples états utilisateur

- Sources observées :
  - `supabase` session (via `supabase.auth.getSession()`)
  - `AuthContext.session` et `AuthContext.user`
  - `profile` (table `candidates`) et `roles`/`permissions` provenant d'API/DB
- Source de vérité utilisée pour l'UI : `AuthContext.session` / `isAuthenticated`.
- Risque de désynchronisation : si `supabase` et `AuthContext` ne sont pas synchrones (race entre `getSession()` et `onAuthStateChange`), la UI pouvant lire `isAuthenticated` avant que le contexte ne reflète la nouvelle session.

## 11. Instances Supabase

- Une instance principale utilisée pour l'app dans `src/integrations/supabase/client.ts` (singleton via `globalThis.__supabaseInstance`).
- D'autres `createClient` existent dans build scripts / prerender / vite config, mais pas dans le runtime React client.

## 12. Chronologie probable du PREMIER CLIC (reconstituée)

1. Utilisateur remplit credentials et clique "Se connecter".
2. `CandidateLoginPage.onSubmit` appelle `login(email,password)`.
3. `AuthContext.login` appelle `authApi.loginCandidate` → `supabase.auth.signInWithPassword(...)`.
   - Le serveur Supabase accepte les identifiants → réponse OK ; les jetons sont écrits en storage (localStorage) par la librairie Supabase.
4. `AuthContext.login` appelle immédiatement `refreshSession(true)` qui exécute `supabase.auth.getSession()`.
   - Si la restauration interne de la session n'est pas encore visible (timing interne de supabase-js, écriture storage vs état interne), `getSession()` peut retourner `null` ou un état incomplet.
5. `refreshSession(true)` échoue (ou retourne `null`) ou attend les retries ; il peut ne pas mettre `session` dans le `AuthContext`.
6. `onAuthStateChange` du `AuthContext` finira par recevoir l'événement `SIGNED_IN` etappelera `setSession(nextSession)` mais avec `setTimeout(...,0)` + `startTransition` → update asynchrone d'un tick.
7. Entretemps, `CandidateLoginPage` n'observe pas `isAuthenticated` (toujours false) → pas de `navigate()` → l'utilisateur reste sur le formulaire.

## 13. Chronologie probable du DEUXIÈME CLIC

1. Après un court délai le listener `onAuthStateChange` a mis à jour `AuthContext.session` (ou la seconde tentative `getSession()` réussit).
2. La variable `isAuthenticated` devient `true` et `user` devient non-null.
3. Si l'utilisateur clique à nouveau sur "Se connecter" (ou le composant se ré-render autrement), la condition `isAuthenticated && user` est désormais vraie et le `useEffect` du `CandidateLoginPage` exécute la navigation vers le dashboard.

## 14. Cause racine

### Cause principale

Condition de course entre :

- l'appel direct à `supabase.auth.signInWithPassword()` (via `authApi.loginCandidate`) qui envoie la requête et écrit les jetons en storage ;
- la lecture immédiate de la session via `supabase.auth.getSession()` dans `refreshSession(true)` (appelée directement après), qui peut renvoyer `null` si le client Supabase interne n'a pas encore synchronisé son état à partir du storage ;
- la mise à jour du contexte déclenchée par `onAuthStateChange` est décalée volontairement (utilisation de `setTimeout(...,0)` + `startTransition`) ce qui retarde encore la visibilité côté React.

Concrètement : `login()` suppose qu'un appel immédiat à `getSession()` reflétera la nouvelle session, mais ce n'est pas garanti par supabase-js dans toutes les conditions (race between storage write and internal restore). L'application a donc une fenêtre de temps où Supabase a des jetons valides dans le storage mais `AuthContext.session` reste `null` → UI n'effectue pas la redirection.

### Causes secondaires potentielles

- `flowType: 'implicit'` et `storageKey` personnalisé : options non-standard qui peuvent interagir avec la logique interne de persistance (attention si supabase-js attend des clés `sb-...`).
- `resolveSessionRolesSafely` ajoute une résolution asynchrone supplémentaire (DB call) et, bien que sa latence n'empêche pas la navigation initiale, elle complexifie le flux et prolonge la période pendant laquelle `roles` peut être vides.
- `startTransition` et `setTimeout(...,0)` dans le listener ajoutent un retard volontaire rendant les mises à jour moins immédiates.

### Preuves dans le code

- Fichier : [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
  - Code concerné : options du client Supabase (storage/localStorage, `storageKey`, `persistSession: true`, `autoRefreshToken: true`, `flowType: 'implicit'`).

- Fichier : [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts)
  - Fonction : `loginCandidate`
  - Code concerné : `await supabase.auth.signInWithPassword({ email, password })` (c'est l'appel de connexion) et `getCandidateSession()` utilise `supabase.auth.getSession()`.

- Fichier : [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
  - Fonctions / lignes concernées :
    - initialisation : appel `supabase.auth.getSession()` avec timeout 5000 (initSession)
    - `onAuthStateChange` callback : met à jour `session` dans un `setTimeout(...,0)` puis `startTransition`.
    - `login` appelle `authApi.loginCandidate(...)` puis `await refreshSession(true)`.

## 15. Causes secondaires

- StockageKey personnalisé + flowType : vérifiez la compatibilité avec la version de `@supabase/supabase-js` utilisée.
- Répétitions de setSession (set via getSession puis via resolveSessionRolesSafely) ; la double attribution ajoute de la complexité mais n'est pas la cause principale.

## 16. Fichiers concernés (liste courte)

- `src/integrations/supabase/client.ts` — création client et options d'auth
- `src/features/authentication/api/authApi.ts` — `loginCandidate`, `getCandidateSession`
- `src/features/authentication/context/AuthContext.tsx` — initialisation, `onAuthStateChange`, `refreshSession`, `login`
- `src/pages/candidate/CandidateLoginPage.tsx` — formulaire et `useEffect` de redirection
- `src/features/authentication/guards/AuthenticationGuard.tsx` — guard principal
- `src/features/authentication/guards/ProtectedRoute.tsx` — composition des guards

## 17. Risques et impacts

- Une correction mal maîtrisée (par exemple forcer le `getSession()` synchrone) peut casser :
  - logout (clearAuthStorage et synchro session),
  - refresh automatique de token,
  - protections de routes (si `isLoading` mal géré),
  - la résolution des rôles (si on court-circuite `resolveSessionRolesSafely`).

## 18. Recommandation technique pour la correction

- Ne pas modifier le code ici — recommandations haut-niveau seulement :
  1. Faire confiance à `onAuthStateChange` comme source canonique d'événements d'auth (ou, inversement, s'assurer que `signInWithPassword` met immédiatement à jour le client avant de lire `getSession`).
  2. Éviter d'appeler immédiatement `getSession()` juste après `signInWithPassword` sans attendre un signal (événement `SIGNED_IN` ou une promesse fournie par `signInWithPassword` contenant la session). Ajouter un petit délai/loop retry déterministe ou attendre explicitement la résolution `data.session` retournée par `signInWithPassword` puis l'utiliser plutôt que d'appeler `getSession()` aveuglément.
  3. Supprimer le `setTimeout(...,0)` dans `onAuthStateChange` (ou au moins documenter la raison) pour réduire le délai entre l'event et la mise à jour du contexte.
  4. Centraliser la logique de rafraîchissement dans `onAuthStateChange` + `getSession()` de façon ordonnée : utiliser `INITIAL_SESSION` ou `SIGNED_IN` events comme source de vérité.
  5. Revoir `storageKey` / `flowType` si la version de supabase-js présente des incompatibilités connues.

## 19. Conclusion (réponses directes)

1) Pourquoi le premier clic crée-t-il la session mais ne connecte-t-il pas immédiatement l'UI ?
   - Parce que la mise à jour visible par React (`AuthContext.session`) n'est pas garantie immédiatement après `signInWithPassword`. L'application appelle `getSession()` immédiatement (race) et le listener `onAuthStateChange` mettra à jour le contexte un peu plus tard ; entre-temps `isAuthenticated` reste false.

2) Pourquoi le deuxième clic fonctionne-t-il ?
   - Parce qu'entre-temps la session a déjà été persistée et `AuthContext` a été mis à jour (via `onAuthStateChange`) ; la condition `isAuthenticated && user` est alors vraie et la redirection s'effectue.

3) Le problème est-il commun à Admin et Candidat ?
   - Oui : les deux utilisent le même `AuthProvider` / flux Supabase. La seule différence est la destination après login (rôle), mais l'origine du bug est commune.

4) Quelle est la cause racine exacte ?
   - Condition de course entre la persistance/interne de session de `@supabase/supabase-js` et la lecture immédiate via `supabase.auth.getSession()` ; la mise à jour du contexte se produit plus tard via `onAuthStateChange` (décalé), rendant l'UI non synchronisée au premier clic.

5) Quels fichiers faudra-t-il probablement modifier pour corriger proprement ?
   - `src/features/authentication/context/AuthContext.tsx`
   - `src/features/authentication/api/authApi.ts` (optionnel)
   - `src/integrations/supabase/client.ts` (vérification options)

6) Existe-t-il un risque de casser le logout, les routes protégées ou le refresh de session avec une mauvaise correction ?
   - Oui, voir la section Risques ci-dessus. Toute modification doit préserver les invariants : nettoyage correct du storage, refresh des tokens, et comportement déterministe des guards.

---

Si tu veux, je peux maintenant proposer un patch de correction sûr (branche + tests) et détailler une implémentation étape-par-étape. Souhaites-tu que je prépare cela ?
