import { useCandidate } from "@/hooks/useCandidate";
import { CandidateSidebarProvider } from "@/contexts/CandidateSidebarContext";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/features/authentication/guards";

interface ProtectedCandidateRouteProps {
  children: React.ReactNode;
}

export function ProtectedCandidateRoute({ children }: ProtectedCandidateRouteProps) {
  const { profile, loading } = useCandidate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
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
