import { useMemo } from "react";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import { getAuthMetadataFromSession } from "@/features/authentication/types";
import { useAuth } from "./useAuth";

export function useRoles() {
  const { session, loading: authLoading, error: authError } = useAuth();
  const authMetadata = useMemo(() => getAuthMetadataFromSession(session), [session]);

  const roles = useMemo<DatabaseAppRole[]>(() => {
    const allowedRoles: DatabaseAppRole[] = ["super_admin", "admin", "editor"];
    return authMetadata.roles.filter((role): role is DatabaseAppRole => allowedRoles.includes(role as DatabaseAppRole));
  }, [authMetadata.roles]);

  const hasRole = useMemo(
    () => (role: string) => roles.includes(role as DatabaseAppRole),
    [roles],
  );

  return {
    roles,
    loading: authLoading,
    error: authError,
    hasRole,
    isStaff: roles.length > 0,
  };
}
