# Communication de session Web → App mobile

## 1) Contexte et problème

L'application mobile affiche le site web dans une WebView native. Lorsque le candidat se connecte sur le site web (`/candidate/login`), le site doit prévenir explicitement le conteneur natif que la connexion a réussi et lui transmettre :

- le statut d'authentification,
- le JWT / token de session,
- l'utilisateur courant.

Sans cette communication, l'application native ne sait pas qu'un candidat est connecté et ne peut pas réhydrater son état dans le shell mobile.

Le point d'intégration clé est le navigateur web embarqué dans la WebView, qui doit appeler :

```js
window.ReactNativeWebView?.postMessage(JSON.stringify(payload))
```

---

## 2) Objectif

Nous voulons un mécanisme simple, fiable, et réutilisable pour :

1. Détecter si le site est lancé dans la WebView native.
2. Émettre un message JSON structuré lors de la connexion réussie.
3. Émettre un message JSON structuré lors de l'initialisation de session.
4. Émettre un message JSON structuré lors de la déconnexion.
5. Garantir que les routes protégées lisent aussi bien les tokens du `localStorage` que les tokens éventuellement réinjectés par la WebView mobile.

---

## 3) Utilitaire de communication vers React Native

Créer un utilitaire dédié dans le code web, par exemple `src/lib/sendSessionToNative.ts`.

### Code exact à insérer

```ts
export type NativeSessionMessage =
  | {
      type: "USER_LOGIN";
      isAuthenticated: true;
      token: string;
      user: {
        id: string;
        email?: string | null;
        full_name?: string | null;
      };
    }
  | {
      type: "USER_LOGOUT";
      isAuthenticated: false;
    };

export function sendSessionToNative(
  payload: NativeSessionMessage | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const reactNativeWebView = (window as Window & {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }).ReactNativeWebView;

  if (!reactNativeWebView || typeof reactNativeWebView.postMessage !== "function") {
    return;
  }

  if (!payload) {
    return;
  }

  reactNativeWebView.postMessage(JSON.stringify(payload));
}
```

### Exemple d'envoi lors d'une connexion réussie

```ts
sendSessionToNative({
  type: "USER_LOGIN",
  isAuthenticated: true,
  token: session.access_token,
  user: {
    id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata?.full_name ?? null,
  },
});
```

### Exemple d'envoi lors de la déconnexion

```ts
sendSessionToNative({
  type: "USER_LOGOUT",
  isAuthenticated: false,
});
```

### Message JSON attendu côté native

#### Connexion réussie / initialisation

```json
{
  "type": "USER_LOGIN",
  "isAuthenticated": true,
  "token": "VOTRE_TOKEN_JWT",
  "user": {
    "id": "123",
    "email": "candidat@test.com"
  }
}
```

#### Déconnexion

```json
{
  "type": "USER_LOGOUT",
  "isAuthenticated": false
}
```

---

## 4) Appel dans le flux de connexion (`login` / `AuthContext`)

Dans le contexte d'authentification, il faut notifier l'application native dès que la session est disponible, et aussi à chaque changement de session.

### Intégration dans le contexte d'authentification

```ts
import { sendSessionToNative } from "@/lib/sendSessionToNative";

const notifySessionToNative = useCallback((nextSession: Session | null) => {
  if (!nextSession?.access_token) {
    sendSessionToNative({
      type: "USER_LOGOUT",
      isAuthenticated: false,
    });
    return;
  }

  const user = nextSession.user;

  sendSessionToNative({
    type: "USER_LOGIN",
    isAuthenticated: true,
    token: nextSession.access_token,
    user: {
      id: user?.id ?? "unknown",
      email: user?.email ?? null,
      full_name: user?.user_metadata?.full_name ?? null,
    },
  });
}, []);
```

### À appeler lors de `getSession()` au bootstrap

```ts
useEffect(() => {
  let isMounted = true;

  const initSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      const nextSession = data.session ?? null;
      setSession(nextSession);

      if (nextSession) {
        notifySessionToNative(nextSession);
      } else {
        sendSessionToNative({
          type: "USER_LOGOUT",
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Session init failed:", error);
      sendSessionToNative({
        type: "USER_LOGOUT",
        isAuthenticated: false,
      });
    }
  };

  void initSession();

  return () => {
    isMounted = false;
  };
}, [notifySessionToNative]);
```

### À appeler lors de la connexion réussie

```ts
const login = useCallback(async (email: string, password: string) => {
  setAuthLoading(true);
  setError(null);

  try {
    const result = await authApi.loginCandidate(email, password);

    const nextSession = result?.session ?? null;
    if (nextSession) {
      notifySessionToNative(nextSession);
    }

    return result;
  } catch (err) {
    const nextError = err instanceof Error ? err.message : String(err);
    setError(nextError);
    throw err;
  } finally {
    setAuthLoading(false);
  }
}, [notifySessionToNative]);
```

### À appeler lors de la déconnexion

```ts
const logout = useCallback(async () => {
  setAuthLoading(true);

  try {
    await authApi.logoutCandidate();
    setSession(null);
    sendSessionToNative({
      type: "USER_LOGOUT",
      isAuthenticated: false,
    });
    return true;
  } catch (err) {
    const nextError = err instanceof Error ? err.message : String(err);
    setError(nextError);
    throw err;
  } finally {
    setAuthLoading(false);
  }
}, []);
```

---

## 5) Sécurisation des routes protégées (`ProtectedRoute` / `AuthContext`)

Il faut s'assurer que le code de garde de route lit aussi bien :

- le token présent dans le `localStorage` (Supabase / session standard),
- le token réinjecté par la WebView mobile ou un état global exposé par le nativemodule.

Sans cette vérification, on peut obtenir un faux négatif: le site pense que l'utilisateur n'est pas connecté alors que le shell natif a déjà injecté une session valide.

### Helper de lecture de session à partir de plusieurs sources

```ts
function getSessionFromAnySource(): {
  token: string | null;
  user: { id: string; email?: string | null } | null;
} {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const localStorageToken =
    localStorage.getItem("sb-access-token") ||
    localStorage.getItem("supabase.auth.token") ||
    localStorage.getItem("auth-token") ||
    null;

  const injectedSession = (window as Window & {
    __NATIVE_SESSION__?: {
      token?: string | null;
      user?: { id?: string; email?: string | null } | null;
    };
  }).__NATIVE_SESSION__;

  const token = injectedSession?.token || localStorageToken;
  const user = injectedSession?.user || null;

  return {
    token,
    user: user && user.id ? user : null,
  };
}
```

### Vérification de route protégée

```ts
const { token, user } = getSessionFromAnySource();
const sessionToken = session?.access_token ?? token;
const sessionUser = user ?? session?.user ?? null;

const isValidAuthState = Boolean(sessionToken) || Boolean(sessionUser?.id);

if (!isValidAuthState) {
  return <Navigate to="/candidate/login" replace />;
}
```

### Variante dans `AuthContext`

```ts
const initializeAuthFromStorageOrNative = useCallback(async () => {
  if (typeof window === "undefined") {
    return;
  }

  const injected = (window as Window & {
    __NATIVE_SESSION__?: { token?: string | null };
  }).__NATIVE_SESSION__;

  const tokenFromStorage = localStorage.getItem("sb-access-token");
  const tokenFromNative = injected?.token ?? null;
  const effectiveToken = tokenFromNative ?? tokenFromStorage;

  if (!effectiveToken) {
    setSession(null);
    setAuthLoading(false);
    return;
  }

  const { data } = await supabase.auth.getSession();
  const nextSession = data.session ?? null;
  setSession(nextSession);
  setAuthLoading(false);
}, []);
```

> Important : en pratique, si le système Supabase est déjà utilisé dans le web, la source de vérité reste `supabase.auth.getSession()`. Le support mobile consiste à réinjecter le token ou l'état dans la WebView, puis à fusionner cette information avec le flux normal d'authentification pour éviter les faux négatifs sur les routes protégées.

---

## 6) Recommandation de mise en œuvre

Pour un projet hybride mobile + web, la logique la plus robuste est la suivante :

1. Au démarrage du site dans la WebView, tenter `supabase.auth.getSession()`.
2. Si un token est injecté par le native, le considérer comme une source alternative valide.
3. Lorsqu'une session est active, appeler `sendSessionToNative(...)` avec `USER_LOGIN`.
4. Lorsqu'aucune session n'existe, appeler `sendSessionToNative(...)` avec `USER_LOGOUT`.
5. Dans les gardes de routes protégées, accepter toute session valide issue de `Supabase`, `localStorage`, ou re-injection native.

---

## 7) Code d'intégration final recommandé

```ts
// src/lib/sendSessionToNative.ts
export type NativeSessionMessage =
  | {
      type: "USER_LOGIN";
      isAuthenticated: true;
      token: string;
      user: {
        id: string;
        email?: string | null;
        full_name?: string | null;
      };
    }
  | {
      type: "USER_LOGOUT";
      isAuthenticated: false;
    };

export function sendSessionToNative(payload: NativeSessionMessage): void {
  if (typeof window === "undefined") {
    return;
  }

  const reactNativeWebView = (window as Window & {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }).ReactNativeWebView;

  if (!reactNativeWebView || typeof reactNativeWebView.postMessage !== "function") {
    return;
  }

  reactNativeWebView.postMessage(JSON.stringify(payload));
}
```

```ts
// dans AuthContext.tsx ou login.ts
const notifySessionToNative = useCallback((nextSession: Session | null) => {
  if (!nextSession?.access_token) {
    sendSessionToNative({
      type: "USER_LOGOUT",
      isAuthenticated: false,
    });
    return;
  }

  sendSessionToNative({
    type: "USER_LOGIN",
    isAuthenticated: true,
    token: nextSession.access_token,
    user: {
      id: nextSession.user.id,
      email: nextSession.user.email ?? null,
      full_name: nextSession.user.user_metadata?.full_name ?? null,
    },
  });
}, []);
```

```tsx
// dans ProtectedRoute.tsx / AuthenticationGuard.tsx
const sessionFromStorage = (() => {
  if (typeof window === "undefined") {
    return null;
  }

  const localStorageToken = localStorage.getItem("sb-access-token");
  const nativeSession = (window as any).__NATIVE_SESSION__;
  return nativeSession?.token ?? localStorageToken ?? null;
})();

const hasValidSession = Boolean(session?.access_token || sessionFromStorage);

if (!hasValidSession) {
  return <Navigate to="/candidate/login" replace />;
}
```

---

## 8) Résumé

Le flux recommandé est simple :

- la WebView détecte `window.ReactNativeWebView` ;
- elle envoie un message JSON structuré au native ;
- le message contient `USER_LOGIN` ou `USER_LOGOUT` ;
- le native reçoit le token + utilisateur courant ;
- les routes protégées acceptent la session issue du `localStorage` ou d’un contexte réinjecté depuis le native.

C’est la base minimale pour synchroniser correctement une session web dans une application mobile hybride.
