import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";
import { useCandidate } from "@/hooks/useCandidate";
import { CandidateSidebarProvider } from "@/contexts/CandidateSidebarContext";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/authentication/guards";
import { CandidateLoadingIndicator } from "./CandidateLoadingIndicator";

interface ProtectedCandidateRouteProps {
  children: React.ReactNode;
}

export function ProtectedCandidateRoute({ children }: ProtectedCandidateRouteProps) {
  const { profile, loading } = useCandidate();
  const { isLoading: authLoading } = useAuthContext();

  if (authLoading || loading) {
    return <CandidateLoadingIndicator />;
  }

  if (!profile) {
    return <Navigate to="/candidate/login" replace />;
  }

  return (
    <ProtectedRoute fallbackPath="/candidate/login" requiredPermissions={["dashboard.candidate"]}>
      <CandidateSidebarProvider>{children}</CandidateSidebarProvider>
    </ProtectedRoute>
  );
}
