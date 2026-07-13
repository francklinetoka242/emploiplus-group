import { useCallback, useEffect, useState } from "react";
import * as authApi from "@/features/authentication/api/authApi";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextSession = await authApi.getCandidateSession();
      setSession(nextSession);
      return nextSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session inaccessible");
      setSession(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    void refreshSession();

    const authListener = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      // eslint-disable-next-line no-console
      console.info("[useAuth] auth state change", { event: _event, nextSessionUserId: nextSession?.user?.id ?? null });
      setError(null);
      setLoading(false);
      setSession((prev) => {
        const prevId = prev?.user?.id ?? null;
        const nextId = nextSession?.user?.id ?? null;
        if (prevId === nextId) return prev;
        return nextSession;
      });
    });

    return () => {
      mounted = false;
      authListener.data.subscription.unsubscribe();
    };
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.info("[useAuth] login called for:", { email });
      const data = await authApi.loginCandidate(email, password);
      console.info("[useAuth] loginCandidate result:", { hasUser: Boolean(data?.user || data?.session?.user) });
      const nextSession = await authApi.getCandidateSession();
      console.info("[useAuth] getCandidateSession result:", { hasSession: Boolean(nextSession), sessionUserId: nextSession?.user?.id ?? null });
      setSession(nextSession);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, options?: { redirectTo?: string; data?: Record<string, unknown> }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.signupCandidate(email, password, options);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authApi.logoutCandidate();
      setSession(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    session,
    loading,
    error,
    refreshSession,
    login,
    signup,
    logout,
    isAuthenticated: Boolean(session),
  };
}
