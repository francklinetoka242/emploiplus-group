import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { RecommendedStatus } from "@/features/candidates/dashboard/dashboardTypes";

interface RecommendedJobsEmptyStateProps {
  status: RecommendedStatus;
  error: string | null;
  onRetry: () => void;
}

const messages: Record<RecommendedStatus, string> = {
  no_cv: "Ajoutez votre CV pour recevoir des recommandations personnalisées.",
  cv_processing: "L’analyse de votre CV est en cours.",
  cv_analysis_failed: "Votre CV n’a pas pu être analysé. Téléversez-le à nouveau.",
  success: "Aucune recommandation disponible pour le moment.",
  no_results: "Aucune recommandation disponible pour le moment.",
  error: "Impossible de charger les recommandations.",
};

export function RecommendedJobsEmptyState({
  status,
  error,
  onRetry,
}: RecommendedJobsEmptyStateProps) {
  const failed = status === "error" || status === "cv_analysis_failed";

  return (
    <div className="py-3 text-sm text-muted-foreground" role={failed ? "alert" : "status"}>
      <p>{status === "error" && error ? error : messages[status]}</p>
      {failed && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
          Réessayer
        </Button>
      )}
      {status === "no_cv" && (
        <Link
          to="/candidate/documents"
          className="mt-2 inline-block font-semibold text-primary underline-offset-4 hover:underline"
        >
          Ajouter mon CV
        </Link>
      )}
    </div>
  );
}
