export function clearAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const authLocalKeys = Object.keys(localStorage);
    for (const key of authLocalKeys) {
      if (typeof key !== "string") continue;
      if (
        key.startsWith("sb-") ||
        key.startsWith("supabase.auth") ||
        key.includes("auth-token") ||
        key.includes("auth-session") ||
        key.includes("auth-token-code-verifier")
      ) {
        localStorage.removeItem(key);
        continue;
      }
      if (
        key === "sb-zhldgrvmmdhtlsnsxuys-auth-token" ||
        key === "sb-zhldgrvmmdhtlsnsxuys-auth-token-code-verifier"
      ) {
        localStorage.removeItem(key);
      }
    }

    const authSessionKeys = Object.keys(sessionStorage);
    for (const key of authSessionKeys) {
      if (typeof key !== "string") continue;
      if (key.startsWith("sb-") || key.startsWith("supabase.auth") || key.includes("auth")) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn("[authStorage] clearAuthStorage failed", error);
  }
}
