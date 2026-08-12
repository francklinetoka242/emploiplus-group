import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, startTransition, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import * as authApi from "@/features/authentication/api/authApi";
import { getAuthMetadataFromSession } from "@/features/authentication/types";
import { getCandidateProfileByUserId } from "@/features/candidates/api/profileApi";
import type { CandidateProfile } from "@/features/candidates/types";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import type { Permission } from "@/features/authentication/permissions/permissions";
import { resolveAuthRoles } from "@/features/authentication/utils/resolveAuthRoles";

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
  const skipNextProfileLoadRef = useRef(false);

  const user = session?.user ?? null;
  const authMetadata = useMemo(() => getAuthMetadataFromSession(session), [session]);
  const isAuthenticated = useMemo(() => Boolean(session), [session]);

  const roles = useMemo<DatabaseAppRole[]>(() => {
    if (!session?.user?.id) {
      return authMetadata.roles;
    }

    return authMetadata.roles;
  }, [authMetadata.roles, session?.user?.id]);

  const permissions = useMemo<Permission[]>(() => authMetadata.permissions, [authMetadata.permissions]);

  const resolveSessionRoles = useCallback(async (incomingSession: Session | null | undefined) => {
    if (!incomingSession?.user?.id) {
      return incomingSession;
    }

    try {
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", incomingSession.user.id)
        .eq("is_active", true);

      const claimRoles = Array.isArray(incomingSession.user.app_metadata?.roles)
        ? incomingSession.user.app_metadata.roles.filter((value): value is string => typeof value === "string")
        : [];

      const dbRoles = (rolesData ?? []).map((row: { role?: string | null }) => row.role).filter(Boolean) as string[];
      const resolvedRoles = resolveAuthRoles(claimRoles, dbRoles);

      return {
        ...incomingSession,
        user: {
          ...incomingSession.user,
          app_metadata: {
            ...incomingSession.user.app_metadata,
            roles: resolvedRoles,
          },
        },
      } as Session;
    } catch {
      return incomingSession;
    }
  }, []);

  const refreshSession = useCallback(async (silent?: boolean) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    console.debug("[AuthContext] refreshSession start", { silent });

    let retries = 0;
    const maxRetries = 2;
    let lastError: Error | null = null;

    try {
      while (retries <= maxRetries) {
        try {
          const nextSession = await authApi.getCandidateSession();
          const resolvedSession = await resolveSessionRoles(nextSession);
          console.debug("[AuthContext] refreshSession got session", { nextSession, resolvedSession });
          startTransition(() => {
            setSession(resolvedSession);
          });

          if (!resolvedSession) {
            startTransition(() => {
              setProfile(null);
            });
            setIsProfileLoading(false);
          }

          return resolvedSession;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          // Ne pas retry sur certaines erreurs (email non confirmé)
          if (lastError.message.includes("email") || lastError.message.includes("confirmed")) {
            break;
          }

          retries++;
          if (retries <= maxRetries) {
            // Attendre avant le retry (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 500));
          }
        }
      }

      const nextError = lastError?.message ?? "Session inaccessible";
      setError(nextError);
      startTransition(() => {
        setSession(null);
        setProfile(null);
      });
      setIsProfileLoading(false);
      return null;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [resolveSessionRoles]);

  const refetchProfile = useCallback(async () => {
    if (!session?.user?.id) {
      startTransition(() => {
        setProfile(null);
      });
      setIsProfileLoading(false);
      return null;
    }

    setIsProfileLoading(true);
    setError(null);

    try {
      const nextProfile = await getCandidateProfileByUserId(session.user.id);
      startTransition(() => {
        setProfile(nextProfile);
      });
      return nextProfile;
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "Erreur lors du chargement du profil";
      setError(nextError);
      startTransition(() => {
        setProfile(null);
      });
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

    let isMounted = true;

    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        console.warn("[AuthContext] Safety timeout déclenché : déblocage forcé des Skeletons");
        setIsLoading(false);
      }
    }, 2500);

    const initSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
          setTimeout(() => resolve({ timeout: true }), 5000),
        );

        const result = (await Promise.race([sessionPromise, timeoutPromise])) as any;
        console.log("[AuthContext] initSession getSession result:", result);

        if (!isMounted) return;

        if (!result?.timeout) {
          const initialSession = result?.data?.session ?? null;
          if (initialSession) {
            startTransition(() => {
              setSession(initialSession);
            });

            resolveSessionRoles(initialSession)
              .then((resolved) => {
                if (!isMounted || !resolved) return;
                startTransition(() => {
                  setSession(resolved);
                });
              })
              .catch((err) => {
                console.error("[AuthContext] Profil load error:", err);
              });
          }
        }
      } catch (err) {
        console.error("[AuthContext] Session init error:", err);
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setIsLoading(false);
        }
      }
    };

    void initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log("[AuthContext] onAuthStateChange event:", {
        event,
        email: nextSession?.user?.email ?? null,
        session: nextSession,
      });

      if (!isMounted) return;

      setTimeout(() => {
        if (!isMounted) return;

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (nextSession) {
            startTransition(() => {
              setSession(nextSession);
            });
          }
        } else if (event === "SIGNED_OUT") {
          startTransition(() => {
            setSession(null);
          });
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [resolveSessionRoles]);

  useEffect(() => {
    if (!session?.user?.id) {
      startTransition(() => {
        setProfile(null);
      });
      setIsProfileLoading(false);
      return;
    }

    if (skipNextProfileLoadRef.current) {
      skipNextProfileLoadRef.current = false;
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setError(null);
      try {
        const nextProfile = await getCandidateProfileByUserId(session.user.id);
        if (isMounted) {
          startTransition(() => {
            setProfile(nextProfile);
          });
        }
      } catch (err) {
          if (isMounted) {
          const nextError = err instanceof Error ? err.message : "Erreur lors du chargement du profil";
          setError(nextError);
          startTransition(() => {
            setProfile(null);
          });
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

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi.loginCandidate(email, password);
      const nextSession = await authApi.getCandidateSession();
      const resolvedSession = await resolveSessionRoles(nextSession);
      startTransition(() => {
        setSession(resolvedSession);
      });
      if (!resolvedSession) {
        startTransition(() => {
          setProfile(null);
        });
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
      startTransition(() => {
        setSession(null);
        setProfile(null);
      });
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
      isAuthenticated,
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
