import { useMemo } from "react";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
import { getPermissionsForRole } from "@/features/authentication/permissions/rolePermissions";
import type { Permission } from "@/features/authentication/permissions/permissions";
import { useRoles } from "./useRoles";

export function usePermissions() {
  const { roles, loading: rolesLoading, error: rolesError, isStaff } = useRoles();
  const { profile, loading: profileLoading } = useCandidate();

  const permissions = useMemo(() => {
    const rolePermissions = roles.flatMap((role) => getPermissionsForRole(role));
    const candidatePermissions = profile ? getPermissionsForRole("candidate") : [];

    return Array.from(new Set([...rolePermissions, ...candidatePermissions])) as Permission[];
  }, [profile, roles]);

  const hasPermission = useMemo(
    () => (permission: Permission) => permissions.includes(permission),
    [permissions],
  );

  const hasAllPermissions = useMemo(
    () => (requiredPermissions: Permission[]) => requiredPermissions.every((permission) => permissions.includes(permission)),
    [permissions],
  );

  const hasAnyPermission = useMemo(
    () => (requiredPermissions: Permission[]) => requiredPermissions.some((permission) => permissions.includes(permission)),
    [permissions],
  );

  return {
    permissions,
    loading: rolesLoading || profileLoading,
    error: rolesError,
    profile,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isStaff,
  };
}
