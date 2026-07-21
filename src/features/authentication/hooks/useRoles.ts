import { useMemo } from "react";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import { getAuthMetadataFromSession } from "@/features/authentication/types";
import { useAuth } from "./useAuth";

export function useRoles() {
  const { session, loading: authLoading, error: authError } = useAuth();
  const authMetadata = useMemo(() => getAuthMetadataFromSession(session), [session]);

  const roles = useMemo<DatabaseAppRole[]>(() => authMetadata.roles, [authMetadata.roles]);

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
