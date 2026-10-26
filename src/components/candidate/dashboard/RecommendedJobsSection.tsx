import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PaginationNav } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecommendedStatus } from "@/features/candidates/dashboard/dashboardTypes";
import type { RecommendedJob } from "@/services/aiMatchingService";
import { RecommendedJobEntry } from "./RecommendedJobEntry";
import { RecommendedJobsEmptyState } from "./RecommendedJobsEmptyState";

interface RecommendedJobsSectionProps {
  jobs: RecommendedJob[];
  candidateId: string | null;
  savedOfferIds: ReadonlySet<string>;
  loading: boolean;
  status: RecommendedStatus;
  error: string | null;
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSaved: () => Promise<void>;
}

export function RecommendedJobsSection({
  jobs,
  candidateId,
  savedOfferIds,
  loading,
  status,
  error,
  page,
  hasMore,
  onPageChange,
  onRetry,
  onSaved,
}: RecommendedJobsSectionProps) {
  return (
    <section
      id="recommended-jobs"
      aria-labelledby="recommended-jobs-title"
      className="scroll-mt-6 min-w-0 border-t border-border py-9 sm:py-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            Sélection personnalisée
          </p>
          <h2 id="recommended-jobs-title" className="mt-1 text-lg font-semibold text-foreground">
            Offres recommandées pour votre profil
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suggestions basées sur votre CV et votre profil.
          </p>
        </div>
        <Link to="/jobs#recommended-for-you" className="shrink-0">
          <Button variant="link" size="sm" className="h-auto w-full px-0 sm:w-auto">
            Voir toutes les offres
          </Button>
        </Link>
      </div>
      <div className="mt-5">
        {loading ? (
          <div role="status" aria-label="Chargement des recommandations">
            <Skeleton className="h-28 rounded-sm" />
            <Skeleton className="mt-4 h-28 rounded-sm" />
            <Skeleton className="mt-4 h-28 rounded-sm" />
          </div>
        ) : jobs.length > 0 ? (
          <>
            {jobs.slice(0, 2).map((offer, index) => (
              <RecommendedJobEntry
                key={offer.id}
                offer={offer}
                index={index}
                candidateId={candidateId}
                saved={savedOfferIds.has(offer.id)}
                onSaved={onSaved}
              />
            ))}
            <PaginationNav
              currentPage={page}
              totalPages={page + (hasMore ? 1 : 0)}
              onPageChange={onPageChange}
              appearance="minimal"
              className="justify-center"
            />
          </>
        ) : (
          <RecommendedJobsEmptyState status={status} error={error} onRetry={onRetry} />
        )}
      </div>
    </section>
  );
}
