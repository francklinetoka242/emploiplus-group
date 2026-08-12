import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/authentication/hooks/useAuth";
import { DashboardLayoutSkeleton } from "@/components/ui/skeletons";

interface AuthenticationGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
  loadingSkeleton?: React.ReactNode;
}

/**
 * AuthenticationGuard: Single responsibility
 *
 * Responsibilities:
 * - Display loading skeleton during auth initialization (authLoading = true)
 * - Once initialized, verify user exists
 * - Redirect to login if no user
 * - Pass through to children if authenticated
 *
 * Does NOT:
 * - Check roles or permissions (that's RoleGuard/PermissionGuard)
 * - Make any async calls
 * - Manage profile loading
 */
export function AuthenticationGuard({
  children,
  fallbackPath = "/candidate/login",
  loadingSkeleton,
}: AuthenticationGuardProps) {
  const { user, authLoading } = useAuth();

  // During initialization, show skeleton
  if (authLoading) {
    return <>{loadingSkeleton ?? <DashboardLayoutSkeleton />}</>;
  }

  // After initialization, check if user exists
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // User is authenticated, pass through to next guard or children
  return <>{children}</>;
}
