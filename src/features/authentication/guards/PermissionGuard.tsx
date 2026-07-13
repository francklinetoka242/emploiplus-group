import { Navigate } from "react-router-dom";
import { usePermissions } from "@/features/authentication/hooks/usePermissions";
import type { Permission } from "@/features/authentication/permissions/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  fallbackPath?: string;
  requireAll?: boolean;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  fallbackPath = "/candidate/login",
  requireAll = true,
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Vérification des permissions...</div>
      </div>
    );
  }

  const hasAccess = requireAll
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return (
      <Navigate
        to={fallbackPath}
        replace
        state={{
          authError: "unauthorized",
          authReason: requiredPermissions.length
            ? `Permission requise : ${requiredPermissions.join(", ")}.
`
            : "Permission requise non fournie.",
          authCurrentPermissions: permissions.length ? permissions.join(", ") : "aucune permission détectée",
        }}
      />
    );
  }

  return <>{children}</>;
}
