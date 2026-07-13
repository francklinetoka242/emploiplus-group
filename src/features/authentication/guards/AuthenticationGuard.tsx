import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/authentication/hooks/useAuth";

interface AuthenticationGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function AuthenticationGuard({ children, fallbackPath = "/candidate/login" }: AuthenticationGuardProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Chargement de la session...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
