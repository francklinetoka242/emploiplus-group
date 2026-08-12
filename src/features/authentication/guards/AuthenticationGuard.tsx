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
  const { user, isLoading, error } = useAuth();

  // Attendre impérativement la fin du chargement de la session
  if (isLoading) {
    return <>{loadingSkeleton ?? <DashboardLayoutSkeleton />}</>;
  }

  // Rediriger uniquement une fois le chargement terminé si l'utilisateur est absent
  if (!user) {
    if (error) {
      console.debug("[AuthenticationGuard] Authentication error:", error);
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
