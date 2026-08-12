import { Navigate } from "react-router-dom";
import { usePermissions } from "@/features/authentication/hooks/usePermissions";
import type { Permission } from "@/features/authentication/permissions/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  fallbackPath?: string;
  requireAll?: boolean;
}

/**
 * PermissionGuard: Pure authorization check
 *
 * Responsibilities:
 * - Verify user has required permissions
 * - Pass through to children if authorized
 * - Redirect to unauthorized if not authorized
 *
 * Assumptions:
 * - User is already authenticated (verified by AuthenticationGuard)
 * - Roles are already resolved (verified by RoleGuard if needed)
 * - Permissions are derived from roles (already done in Phase 1)
 * - No skeleton loading (authorization is synchronous check)
 *
 * Does NOT:
 * - Display any skeleton or loading UI
 * - Make any async calls
 * - Load candidate profile
 * - Check rolesResolved status (assumed already done)
 */
export function PermissionGuard({
  children,
  requiredPermissions,
  fallbackPath = "/candidate/login",
  requireAll = true,
}: PermissionGuardProps) {
  const { permissions, hasAllPermissions, hasAnyPermission } = usePermissions();

  // Direct permission check - no loading state needed
  const hasAccess = requireAll
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Permission check failed - redirect to unauthorized page
  return (
    <Navigate
      to={fallbackPath}
      replace
      state={{
        authError: "unauthorized",
        authReason: requiredPermissions.length
          ? `Permission requise : ${requiredPermissions.join(", ")}.`
          : "Permission requise non fournie.",
        authCurrentPermissions: permissions.length
          ? permissions.join(", ")
          : "aucune permission détectée",
      }}
    />
  );
}
