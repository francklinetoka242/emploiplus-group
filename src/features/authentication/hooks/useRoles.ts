import { useMemo } from "react";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import { useAuth } from "./useAuth";

/**
 * useRoles: Read user roles from auth context
 *
 * Simple wrapper around useAuth that provides role-related utilities.
 * Does NOT:
 * - Make any async calls
 * - Check loading state
 * - Manage authorization decisions (that's the guard's job)
 */
export function useRoles() {
  const { roles, error: authError } = useAuth();

  const hasRole = useMemo(() => (role: string) => roles.includes(role as DatabaseAppRole), [roles]);

  return {
    roles,
    error: authError,
    hasRole,
    isStaff: roles.length > 0,
  };
}
