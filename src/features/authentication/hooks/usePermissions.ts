import { useMemo } from "react";
import {
  ALL_PERMISSIONS,
  type Permission,
} from "@/features/authentication/permissions/permissions";
import { getPermissionsForRole } from "@/features/authentication/permissions/rolePermissions";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";

/**
 * usePermissions: Derive all user permissions from roles and claimed permissions
 *
 * Does NOT:
 * - Depend on candidate profile
 * - Make any async calls
 * - Filter permissions (returns all permissions user has)
 *
 * Admin permissions are fully independent of profile loading.
 */
export function usePermissions() {
  const { roles, permissions: claimedPermissions, error } = useAuthContext();

  // Calculate all permissions from roles and claimed permissions
  const permissions = useMemo(() => {
    // Normalize claimed permissions from auth metadata
    const normalizedClaims = claimedPermissions.filter((permission): permission is Permission =>
      ALL_PERMISSIONS.includes(permission as Permission),
    );

    // Derive permissions from roles
    const rolePermissions = roles.flatMap((role) => getPermissionsForRole(role));

    // Merge and deduplicate
    return Array.from(new Set([...normalizedClaims, ...rolePermissions])) as Permission[];
  }, [claimedPermissions, roles]);

  // Check if user has specific permission
  const hasPermission = useMemo(
    () => (permission: Permission) => permissions.includes(permission),
    [permissions],
  );

  // Check if user has ALL required permissions
  const hasAllPermissions = useMemo(
    () => (requiredPermissions: Permission[]) =>
      requiredPermissions.every((permission) => permissions.includes(permission)),
    [permissions],
  );

  // Check if user has ANY of the required permissions
  const hasAnyPermission = useMemo(
    () => (requiredPermissions: Permission[]) =>
      requiredPermissions.some((permission) => permissions.includes(permission)),
    [permissions],
  );

  return {
    permissions,
    error,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isStaff: roles.length > 0,
  };
}
