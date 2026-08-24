import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { sendSessionToNative } from "@/lib/sendSessionToNative";
import { getCandidateProfileByUserId } from "@/features/candidates/api/profileApi";

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
  /**
   * rolesResolved is true only when:
   * 1. Session initialization is complete (authLoading = false)
   * 2. Candidate access detection is complete (candidateAccessResolved = true)
   *
   * This ensures candidate roles/permissions are stable before routing
   * makes any access decisions.
   */
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
  const sessionRef = useRef<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const lastNotifiedAuthState = useRef<"AUTHENTICATED" | "SIGNED_OUT" | null>(null);
  /**
   * candidateAccessResolved: true when detectCandidateAccess has completed
   * (either found a candidate profile or determined user has none)
   * Ensures candidate roles are stable before routing checks access.
   */
  const [candidateAccessResolved, setCandidateAccessResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  diagnosticLogger.log('AUTH_PROVIDER_INIT', {
    sessionPresent: !!session,
    authLoading,
    candidateAccessResolved,
    userId: session?.user?.id,
  }, 'AuthContext');

  const user = session?.user ?? null;
  const [hasCandidateProfile, setHasCandidateProfile] = useState(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Normalize auth metadata (roles & permissions) from session
  const authMetadata = useMemo(() => getAuthMetadataFromSession(session), [session]);

  /**
   * Detect candidate access after session is established.
   * Once this completes (success or error), candidateAccessResolved = true.
   * This ensures candidate roles/permissions are stable for routing.
   */
  useEffect(() => {
    let isMounted = true;

    const detectCandidateAccess = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setHasCandidateProfile(false);
          setCandidateAccessResolved(true);
        }
        return;
      }

      try {
        const { data, error } = await getCandidateProfileByUserId(session.user.id)
          .then((profile) => ({ data: profile, error: null }))
          .catch((candidateError) => ({ data: null, error: candidateError }));

        if (!isMounted) {
          return;
        }

        const nextHasCandidateProfile = !error && Boolean(data);
        setHasCandidateProfile((current) =>
          current === nextHasCandidateProfile ? current : nextHasCandidateProfile,
        );
        setCandidateAccessResolved(true);
      } catch {
        if (isMounted) {
          setHasCandidateProfile(false);
          setCandidateAccessResolved(true);
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

  const notifyAuthStateToNative = useCallback(
    (nextSession: Session | null) => {
      const nextState = nextSession ? "AUTHENTICATED" : "SIGNED_OUT";

      if (lastNotifiedAuthState.current === nextState) {
        return;
      }

      lastNotifiedAuthState.current = nextState;

      if (!nextSession) {
        sendSessionToNative({ type: "SIGNED_OUT" });
        return;
      }

      sendSessionToNative({
        type: "AUTHENTICATED",
        token: nextSession.access_token,
        refreshToken: nextSession.refresh_token,
        expiresIn:
          typeof nextSession.expires_at === "number"
            ? Math.max(0, Math.round(nextSession.expires_at - Date.now() / 1000))
            : undefined,
        user: {
          id: nextSession.user.id,
          email: nextSession.user.email ?? null,
          full_name: nextSession.user.user_metadata?.full_name ?? null,
        },
      });
    },
    [],
  );

  // Alias for backward compatibility
  const isLoading = authLoading;

  /**
   * rolesResolved: true only when BOTH:
   * 1. Session initialization complete (!authLoading)
   * 2. Candidate access detection complete (candidateAccessResolved)
   *
   * This ensures all async initialization is done before routing.
   */
  const rolesResolved = useMemo(
    () => !authLoading && candidateAccessResolved,
    [authLoading, candidateAccessResolved],
  );

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
      // candidateAccessResolved will be reset and detectCandidateAccess will run again
      setCandidateAccessResolved(false);
      setAuthLoading(false);
      setError(null);

      return nextSession;
    } catch (err) {
      const nextError =
        err instanceof Error ? err.message : "Erreur lors du rafraîchissement de session";

      setError(nextError);
      setSession(null);
      setCandidateAccessResolved(false);
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

        if (nextSession) {
          notifyAuthStateToNative(nextSession);
        }

        // Reset candidateAccessResolved so detectCandidateAccess runs again if session changed
        setCandidateAccessResolved(false);
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
        setCandidateAccessResolved(false);
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

      const normalizedNextSession = nextSession ?? null;
      const currentSession = sessionRef.current;
      const identityChanged =
        currentSession?.user?.id !== normalizedNextSession?.user?.id;

      setSession((current) => {
        sessionRef.current = normalizedNextSession;
        if (areSessionsEquivalent(current, normalizedNextSession)) {
          return current;
        }
        return normalizedNextSession;
      });

      if (nextSession) {
        notifyAuthStateToNative(nextSession);
      } else {
        notifyAuthStateToNative(null);
      }

      // Keep protected pages mounted when Supabase re-emits an event for the same user.
      if (identityChanged) {
        setCandidateAccessResolved(false);
      }
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
      notifyAuthStateToNative(null);
      setCandidateAccessResolved(false);
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
