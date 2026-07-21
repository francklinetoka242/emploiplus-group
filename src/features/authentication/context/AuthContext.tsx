import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import * as authApi from "@/features/authentication/api/authApi";
import { getAuthMetadataFromSession } from "@/features/authentication/types";
import { getCandidateProfileByUserId } from "@/features/candidates/api/profileApi";
import type { CandidateProfile } from "@/features/candidates/types";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import type { Permission } from "@/features/authentication/permissions/permissions";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: CandidateProfile | null;
  roles: DatabaseAppRole[];
  permissions: Permission[];
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshSession: () => Promise<Session | null>;
  refetchProfile: () => Promise<CandidateProfile | null>;
  login: (email: string, password: string) => Promise<unknown>;
  signup: (email: string, password: string, options?: { redirectTo?: string; data?: Record<string, unknown> }) => Promise<unknown>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedSessionRef = useRef(false);

  const user = session?.user ?? null;
  const authMetadata = useMemo(() => getAuthMetadataFromSession(session), [session]);

  const roles = useMemo<DatabaseAppRole[]>(() => {
    const allowedRoles: DatabaseAppRole[] = ["super_admin", "admin", "editor"];
    return authMetadata.roles.filter((role): role is DatabaseAppRole => allowedRoles.includes(role));
  }, [authMetadata.roles]);

  const permissions = useMemo<Permission[]>(() => authMetadata.permissions, [authMetadata.permissions]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSession = await authApi.getCandidateSession();
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setIsProfileLoading(false);
      }
      return nextSession;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "Session inaccessible";
      setError(nextError);
      setSession(null);
      setProfile(null);
      setIsProfileLoading(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      setIsProfileLoading(false);
      return null;
    }

    setIsProfileLoading(true);
    setError(null);

    try {
      const nextProfile = await getCandidateProfileByUserId(session.user.id);
      setProfile(nextProfile);
      return nextProfile;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "Erreur lors du chargement du profil";
      setError(nextError);
      setProfile(null);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (hasInitializedSessionRef.current) {
      return;
    }

    hasInitializedSessionRef.current = true;

    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setError(null);
      try {
        const nextProfile = await getCandidateProfileByUserId(session.user.id);
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (err) {
        if (isMounted) {
          const nextError = err instanceof Error ? err.message : "Erreur lors du chargement du profil";
          setError(nextError);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setError(null);
      setSession((previousSession) => {
        const previousUserId = previousSession?.user?.id ?? null;
        const nextUserId = nextSession?.user?.id ?? null;

        if (previousUserId === nextUserId && previousUserId !== null && nextSession) {
          return previousSession;
        }

        return nextSession;
      });

      if (!nextSession) {
        setProfile(null);
        setIsProfileLoading(false);
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi.loginCandidate(email, password);
      const nextSession = await authApi.getCandidateSession();
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
      }
      return data;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : String(err);
      setError(nextError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, options?: { redirectTo?: string; data?: Record<string, unknown> }) => {
    setIsLoading(true);
    setError(null);

    try {
      return await authApi.signupCandidate(email, password, options);
    } catch (err) {
      const nextError = err instanceof Error ? err.message : String(err);
      setError(nextError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.logoutCandidate();
      setSession(null);
      setProfile(null);
      setIsProfileLoading(false);
      return true;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : String(err);
      setError(nextError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      roles,
      permissions,
      isLoading,
      isProfileLoading,
      error,
      isAuthenticated: Boolean(session),
      refreshSession,
      refetchProfile,
      login,
      signup,
      logout,
    }),
    [session, user, profile, roles, permissions, isLoading, isProfileLoading, error, refreshSession, refetchProfile, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
