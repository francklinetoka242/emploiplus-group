import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationNav } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecommendedStatus } from "@/features/candidates/dashboard/dashboardTypes";
import type { RecommendedJob } from "@/services/aiMatchingService";
import { DashboardIcon } from "./DashboardIcon";
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
    <Card
      id="recommended-jobs"
      className="scroll-mt-6 overflow-hidden rounded-2xl border-border/70 shadow-none"
    >
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <DashboardIcon name="Briefcase" />
          </span>
          <div>
            <CardTitle className="text-base sm:text-lg">
              Offres recommandées pour votre profil
            </CardTitle>
            <CardDescription className="mt-1">
              Suggestions basées sur votre CV et votre profil.
            </CardDescription>
          </div>
        </div>
        <Link to="/jobs#recommended-for-you" className="shrink-0">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Voir toutes les offres <DashboardIcon name="ArrowRight" size={17} className="ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3" role="status" aria-label="Chargement des recommandations">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : jobs.length > 0 ? (
          <>
            {jobs.map((offer, index) => (
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
      </CardContent>
    </Card>
  );
}
