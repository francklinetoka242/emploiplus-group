export type NativeSessionMessage =
  | {
      type: "AUTHENTICATED";
      token: string;
      refreshToken?: string;
      expiresIn?: number;
      user: { id: string; email?: string | null; full_name?: string | null };
    }
  | { type: "SIGNED_OUT" };

export function sendSessionToNative(payload: NativeSessionMessage): void {
  if (typeof window === "undefined") return;
  const win = window as any;
  if (win.ReactNativeWebView?.postMessage) {
    win.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }
}

export function getSessionTokenFromNativeOrStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as Window & {
    __NATIVE_SESSION__?: { token?: string | null };
  };

  const nativeToken = win.__NATIVE_SESSION__?.token ?? null;

  if (nativeToken) {
    return nativeToken;
  }

  const storageKeys = [
    "sb-access-token",
    "emploiplus-auth-token",
    "supabase.auth.token",
    "auth-token",
  ];

  for (const key of storageKeys) {
    const value = window.localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
}
