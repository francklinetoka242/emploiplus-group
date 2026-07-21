import { Navigate } from "react-router-dom";
import { usePermissions } from "@/features/authentication/hooks/usePermissions";
import type { Permission } from "@/features/authentication/permissions/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  fallbackPath?: string;
  requireAll?: boolean;
  /**
   * Composant optionnel à afficher pendant le chargement des permissions.
   * Si non fourni, affiche une page blanche avec le texte "Vérification des permissions..."
   * Si fourni, permet d'afficher un skeleton ou un composant d'App Shell.
   */
  loadingSkeleton?: React.ReactNode;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  fallbackPath = "/candidate/login",
  requireAll = true,
  loadingSkeleton,
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading, permissions } = usePermissions();

  // État de chargement : affiche le skeleton ou un écran de loading
  if (loading) {
    return loadingSkeleton ? (
      <>{loadingSkeleton}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Vérification des permissions...</div>
      </div>
    );
  }

  // État d'accès : vérifie les permissions
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
