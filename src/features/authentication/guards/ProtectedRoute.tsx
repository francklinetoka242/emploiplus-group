import type { ReactNode } from "react";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import type { Permission } from "@/features/authentication/permissions/permissions";
import { AuthenticationGuard } from "./AuthenticationGuard";
import { RoleGuard } from "./RoleGuard";
import { PermissionGuard } from "./PermissionGuard";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: DatabaseAppRole[];
  requiredPermissions?: Permission[];
  fallbackPath?: string;
  requireAllPermissions?: boolean;
  /**
   * Skeleton or component to display during auth initialization.
   * Only used by AuthenticationGuard (the only guard that waits for authLoading).
   * RoleGuard and PermissionGuard do not display skeletons.
   */
  loadingSkeleton?: ReactNode;
}

/**
 * ProtectedRoute: Simple orchestrator of authentication and authorization guards
 *
 * Guard composition order:
 * 1. AuthenticationGuard - checks if user is authenticated
 * 2. RoleGuard (if allowedRoles) - checks if user has required roles
 * 3. PermissionGuard (if requiredPermissions) - checks if user has required permissions
 * 4. children - rendered if all guards pass
 *
 * Each guard is independent and does not know about the others.
 * No guard performs async operations or makes network calls.
 * No guard displays loading UI except AuthenticationGuard during initialization.
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  fallbackPath = "/candidate/login",
  requireAllPermissions = true,
  loadingSkeleton,
}: ProtectedRouteProps) {
  // Compose guards from outermost to innermost
  // AuthenticationGuard is outermost - handles loading state

  const content = <>{children}</>;

  // Apply PermissionGuard if permissions are required
  const permissionGuardedContent = requiredPermissions?.length ? (
    <PermissionGuard
      requiredPermissions={requiredPermissions}
      fallbackPath={fallbackPath}
      requireAll={requireAllPermissions}
    >
      {content}
    </PermissionGuard>
  ) : (
    content
  );

  // Apply RoleGuard if roles are required
  const roleGuardedContent = allowedRoles?.length ? (
    <RoleGuard allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
      {permissionGuardedContent}
    </RoleGuard>
  ) : (
    permissionGuardedContent
  );

  // AuthenticationGuard is always applied (outermost guard)
  return (
    <AuthenticationGuard fallbackPath={fallbackPath} loadingSkeleton={loadingSkeleton}>
      {roleGuardedContent}
    </AuthenticationGuard>
  );
}
