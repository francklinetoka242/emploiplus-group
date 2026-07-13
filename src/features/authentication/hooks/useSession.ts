import { useMemo } from "react";
import { useAuth } from "./useAuth";

export function useSession() {
  const { session, loading, error, refreshSession, logout, isAuthenticated } = useAuth();

  return useMemo(
    () => ({
      session,
      loading,
      error,
      refreshSession,
      logout,
      isAuthenticated,
    }),
    [session, loading, error, refreshSession, logout, isAuthenticated],
  );
}
