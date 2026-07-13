export function clearAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    Object.keys(localStorage).forEach((key) => {
      if (typeof key !== "string") return;
      if (
        key.startsWith("sb-") &&
        (key.includes("auth-token") ||
          key.includes("auth-session") ||
          key.includes("auth-token-code-verifier"))
      ) {
        localStorage.removeItem(key);
      }
      if (
        key === "sb-zhldgrvmmdhtlsnsxuys-auth-token" ||
        key === "sb-zhldgrvmmdhtlsnsxuys-auth-token-code-verifier"
      ) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach((key) => {
      if (typeof key !== "string") return;
      if (key.startsWith("sb-") || key.includes("auth")) {
        sessionStorage.removeItem(key);
      }
    });

    sessionStorage.clear();
  } catch (error) {
    console.warn("[authStorage] clearAuthStorage failed", error);
  }
}
