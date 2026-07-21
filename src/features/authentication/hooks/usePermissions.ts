import { useMemo } from "react";
import { ALL_PERMISSIONS, type Permission } from "@/features/authentication/permissions/permissions";
import { getPermissionsForRole } from "@/features/authentication/permissions/rolePermissions";
import { useAuthContext } from "@/features/authentication/context/AuthContext";

export function usePermissions() {
  const { roles, permissions: claimedPermissions, profile, isLoading, isProfileLoading, error } = useAuthContext();

  const permissions = useMemo(() => {
    const normalizedClaims = claimedPermissions.filter((permission): permission is Permission =>
      ALL_PERMISSIONS.includes(permission as Permission),
    );
    const rolePermissions = roles.flatMap((role) => getPermissionsForRole(role));
    const candidatePermissions = profile ? getPermissionsForRole("candidate") : [];

    return Array.from(new Set([...normalizedClaims, ...rolePermissions, ...candidatePermissions])) as Permission[];
  }, [claimedPermissions, profile, roles]);

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
    loading: isLoading || isProfileLoading,
    error,
    profile,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isStaff: roles.length > 0,
  };
}
