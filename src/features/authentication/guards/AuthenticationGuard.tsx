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
  const { session, isLoading, error } = useAuth();

  // Afficher le skeleton pendant le chargement
  if (isLoading) {
    return <>{loadingSkeleton ?? <DashboardLayoutSkeleton />}</>;
  }

  // Si pas de session, rediriger vers la page de login
  if (!session) {
    // Si erreur spécifique, on peut la logger mais on redirige quand même
    if (error) {
      console.debug("[AuthenticationGuard] Authentication error:", error);
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
