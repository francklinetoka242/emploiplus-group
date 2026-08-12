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
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesResolved, setRolesResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user ?? null;
  const [candidateAccess, setCandidateAccess] = useState<{ roles: DatabaseAppRole[]; permissions: Permission[] } | null>(null);

  // Normalize auth metadata (roles & permissions) from session
  const authMetadata = useMemo(() => getAuthMetadataFromSession(session), [session]);

  useEffect(() => {
    let isMounted = true;

    const detectCandidateAccess = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setCandidateAccess(null);
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

        if (!error && data) {
          const candidateRoles: DatabaseAppRole[] = ["candidate"];
          const candidatePermissions = getPermissionsForRole("candidate") as Permission[];
          setCandidateAccess({ roles: candidateRoles, permissions: candidatePermissions });
          return;
        }

        setCandidateAccess(null);
      } catch {
        if (isMounted) {
          setCandidateAccess(null);
        }
      }
    };

    void detectCandidateAccess();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const roles = useMemo<DatabaseAppRole[]>(
    () => Array.from(new Set([...authMetadata.roles, ...(candidateAccess?.roles ?? [])])),
    [authMetadata.roles, candidateAccess?.roles],
  );

  const permissions = useMemo<Permission[]>(
    () => Array.from(new Set([...authMetadata.permissions, ...(candidateAccess?.permissions ?? [])])),
    [authMetadata.permissions, candidateAccess?.permissions],
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
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }
        if (sessionError) {
          throw sessionError;
        }

        const nextSession = data.session ?? null;
        setSession(nextSession);
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

      setSession(nextSession ?? null);
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
    setAuthLoading(true);
    setError(null);

    try {
      const data = await authApi.loginCandidate(email, password);
      // Session will be set by onAuthStateChange listener
      return data;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : String(err);
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
