import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/authentication/hooks/useAuth";
import { DashboardLayoutSkeleton } from "@/components/ui/skeletons";

interface AuthenticationGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
  loadingSkeleton?: React.ReactNode;
}

export function AuthenticationGuard({
  children,
  fallbackPath = "/candidate/login",
  loadingSkeleton,
}: AuthenticationGuardProps) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <>{loadingSkeleton ?? <DashboardLayoutSkeleton />}</>;
  }

  if (!session) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
