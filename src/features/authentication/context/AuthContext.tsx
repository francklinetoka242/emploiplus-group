import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import * as authApi from "@/features/authentication/api/authApi";
import { getAuthMetadataFromSession } from "@/features/authentication/types";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import type { Permission } from "@/features/authentication/permissions/permissions";
import { getPermissionsForRole } from "@/features/authentication/permissions/rolePermissions";
import { diagnosticLogger } from "@/services/diagnosticLogger";

/**
 * Core authentication state interface.
 * Responsibilities:
 * - Manage Supabase session
 * - Expose normalized roles and permissions
 * - Provide auth loading state
 * Does NOT:
 * - Load candidate profile
 * - Manage candidate-specific data
 * - Make routing decisions
 */
interface AuthContextValue {
  // Core session data
  session: Session | null;
  user: User | null;

  // Authentication state
  isAuthenticated: boolean;
  authLoading: boolean;
  rolesResolved: boolean;
  error: string | null;

  // Authorization data (derived from session)
  roles: DatabaseAppRole[];
  permissions: Permission[];

  // Auth methods
  login: (email: string, password: string) => Promise<unknown>;
  signup: (
    email: string,
    password: string,
    options?: { redirectTo?: string; data?: Record<string, unknown> },
  ) => Promise<unknown>;
  logout: () => Promise<boolean>;
  refreshSession: () => Promise<Session | null>;

  // Backward compatibility aliases (will be deprecated)
  isLoading: boolean; // alias for authLoading
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider: Single source of truth for authentication state.
 * Initialization flow:
 * 1. On mount: getSession() from Supabase
 * 2. Roles normalized from app_metadata
 * 3. Permissions derived from roles
 * 4. authLoading = false
 * 5. onAuthStateChange listener keeps session in sync
 * No profiling loading.
 * No candidate-specific logic.
 * Deterministic initialization.
 */
function areSessionsEquivalent(current: Session | null, next: Session | null) {
  if (current === next) {
    return true;
  }

  if (!current || !next) {
    return current === next;
  }

  return (
    current.user?.id === next.user?.id &&
    current.access_token === next.access_token &&
    current.refresh_token === next.refresh_token &&
    current.expires_at === next.expires_at
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesResolved, setRolesResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  diagnosticLogger.log('AUTH_PROVIDER_INIT', {
    sessionPresent: !!session,
    authLoading,
    rolesResolved,
    userId: session?.user?.id,
  }, 'AuthContext');

  const user = session?.user ?? null;
  const [hasCandidateProfile, setHasCandidateProfile] = useState(false);

  // Normalize auth metadata (roles & permissions) from session
  const authMetadata = useMemo(() => getAuthMetadataFromSession(session), [session]);

  useEffect(() => {
    let isMounted = true;

    const detectCandidateAccess = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setHasCandidateProfile((current) => (current === false ? current : false));
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1)
          .maybeSingle();

        if (!isMounted) {
          return;
        }

        const nextHasCandidateProfile = !error && Boolean(data);
        setHasCandidateProfile((current) =>
          current === nextHasCandidateProfile ? current : nextHasCandidateProfile,
        );
      } catch {
        if (isMounted) {
          setHasCandidateProfile(false);
        }
      }
    };

    void detectCandidateAccess();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const candidateRoles = useMemo<DatabaseAppRole[]>(
    () => (hasCandidateProfile ? ["candidate"] : []),
    [hasCandidateProfile],
  );

  const candidatePermissions = useMemo<Permission[]>(
    () => (hasCandidateProfile ? (getPermissionsForRole("candidate") as Permission[]) : []),
    [hasCandidateProfile],
  );

  const roles = useMemo<DatabaseAppRole[]>(
    () => Array.from(new Set([...authMetadata.roles, ...candidateRoles])),
    [authMetadata.roles, candidateRoles],
  );

  const permissions = useMemo<Permission[]>(
    () => Array.from(new Set([...authMetadata.permissions, ...candidatePermissions])),
    [authMetadata.permissions, candidatePermissions],
  );

  const isAuthenticated = useMemo(() => Boolean(session), [session]);

  // Alias for backward compatibility
  const isLoading = authLoading;

  /**
   * Refresh session from Supabase.
   * Called on explicit logout or session expiry.
   */
  const refreshSession = useCallback(async () => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const nextSession = data.session ?? null;

      setSession(nextSession);
      setRolesResolved(true);
      setAuthLoading(false);
      setError(null);

      return nextSession;
    } catch (err) {
      const nextError =
        err instanceof Error ? err.message : "Erreur lors du rafraîchissement de session";

      setError(nextError);
      setSession(null);
      setRolesResolved(true);
      setAuthLoading(false);

      return null;
    }
  }, []);

  /**
   * Single initialization flow:
   * 1. getSession() on mount
   * 2. onAuthStateChange() listener keeps session in sync
   *
   * No profiling. No timeouts. Deterministic.
   */

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      diagnosticLogger.log('INIT_SESSION_START', {
        timestamp: new Date().toISOString(),
      }, 'AuthContext');
      
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }
        if (sessionError) {
          throw sessionError;
        }

        const nextSession = data.session ?? null;
        diagnosticLogger.log('INIT_SESSION_GOT', {
          sessionPresent: !!nextSession,
          userId: nextSession?.user?.id,
          timestamp: new Date().toISOString(),
        }, 'AuthContext');
        
        setSession((current) => {
          if (areSessionsEquivalent(current, nextSession)) {
            return current;
          }
          return nextSession;
        });
        setRolesResolved(true);
        setAuthLoading(false);
        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        const nextError =
          err instanceof Error ? err.message : "Erreur lors de l’initialisation de session";
        setError(nextError);
        setSession(null);

        setRolesResolved(true);
        setAuthLoading(false);
      }
    };

    void initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession((current) => {
        const normalizedNextSession = nextSession ?? null;
        if (areSessionsEquivalent(current, normalizedNextSession)) {
          return current;
        }
        return normalizedNextSession;
      });
      setRolesResolved(true);
      setAuthLoading(false);
      setError(null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    diagnosticLogger.log('LOGIN_START', {
      email,
      timestamp: new Date().toISOString(),
    }, 'AuthContext');
    setAuthLoading(true);
    setError(null);

    try {
      const data = await authApi.loginCandidate(email, password);
      diagnosticLogger.log('LOGIN_SUCCESS', {
        email,
        timestamp: new Date().toISOString(),
      }, 'AuthContext');
      // Session will be set by onAuthStateChange listener
      return data;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : String(err);
      diagnosticLogger.log('LOGIN_FAILED', {
        email,
        error: nextError,
        timestamp: new Date().toISOString(),
      }, 'AuthContext');
      setError(nextError);
      setAuthLoading(false);
      throw err;
    }
  }, []);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      options?: { redirectTo?: string; data?: Record<string, unknown> },
    ) => {
      setAuthLoading(true);
      setError(null);

      try {
        return await authApi.signupCandidate(email, password, options);
      } catch (err) {
        const nextError = err instanceof Error ? err.message : String(err);
        setError(nextError);
        throw err;
      } finally {
        setAuthLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setAuthLoading(true);
    setError(null);

    try {
      await authApi.logoutCandidate();
      setSession(null);
      setRolesResolved(true);
      setAuthLoading(false);
      return true;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : String(err);
      setError(nextError);
      setAuthLoading(false);
      throw err;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isAuthenticated,
      authLoading,
      rolesResolved,
      error,
      roles,
      permissions,
      login,
      signup,
      logout,
      refreshSession,
      // Backward compatibility
      isLoading,
    }),
    [
      session,
      user,
      isAuthenticated,
      authLoading,
      rolesResolved,
      error,
      roles,
      permissions,
      login,
      signup,
      logout,
      refreshSession,
      isLoading,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
