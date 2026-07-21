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
   * Skeleton ou composant à afficher pendant le chargement des permissions.
   * Permet une meilleure UX en évitant les écrans blancs bloquants.
   */
  loadingSkeleton?: ReactNode;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  fallbackPath = "/candidate/login",
  requireAllPermissions = true,
  loadingSkeleton,
}: ProtectedRouteProps) {
  const content = <>{children}</>;

  const guardedContent = allowedRoles?.length ? (
    <RoleGuard allowedRoles={allowedRoles} fallbackPath={fallbackPath} loadingSkeleton={loadingSkeleton}>
      {content}
    </RoleGuard>
  ) : (
    content
  );

  const permissionGuardedContent = requiredPermissions?.length ? (
    <PermissionGuard
      requiredPermissions={requiredPermissions}
      fallbackPath={fallbackPath}
      requireAll={requireAllPermissions}
      loadingSkeleton={loadingSkeleton}
    >
      {guardedContent}
    </PermissionGuard>
  ) : (
    guardedContent
  );

  return (
    <AuthenticationGuard fallbackPath={fallbackPath} loadingSkeleton={loadingSkeleton}>
      {permissionGuardedContent}
    </AuthenticationGuard>
  );
}
