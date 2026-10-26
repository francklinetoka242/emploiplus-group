import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncMetric } from "@/features/candidates/dashboard/dashboardTypes";
import { getSavedOfferDeadlineSummary } from "@/features/candidates/dashboard/savedOfferDeadlines";
import { DashboardIcon } from "./DashboardIcon";
import { DashboardSection } from "./DashboardSection";

interface UpcomingDeadlinesProps {
  savedOffers: AsyncMetric<DashboardSavedOffer[]>;
  onRetry: () => void;
}

export function UpcomingDeadlines({ savedOffers, onRetry }: UpcomingDeadlinesProps) {
  const { upcoming, datedCount, expiredCount, unavailableCount } = getSavedOfferDeadlineSummary(
    savedOffers.data,
    Date.now(),
  );
  const offers = upcoming.slice(0, 4);

  return (
    <DashboardSection
      title="Échéances à venir"
      description="Dates limites des offres que vous avez enregistrées."
      icon="CalendarDots"
    >
      {savedOffers.loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : savedOffers.error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4" role="alert">
          <p className="text-sm text-destructive">{savedOffers.error}</p>
          <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
            Réessayer
          </Button>
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>Aucune échéance prochaine parmi vos offres enregistrées.</p>
          {savedOffers.data.length > 0 && (
            <p className="mt-1 text-xs">
              {datedCount} offre{datedCount > 1 ? "s" : ""} avec une date exploitable;{" "}
              {expiredCount} échéance{expiredCount > 1 ? "s" : ""} déjà passée
              {expiredCount > 1 ? "s" : ""}, {unavailableCount} sans date.
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {offers.map(({ savedOffer, job, deadline, timestamp }) =>
            job && deadline ? (
              <li key={savedOffer.id}>
                <Link
                  to={`/jobs/${job.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {job.title}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {job.company}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-secondary-foreground">
                    <DashboardIcon name="Clock" size={16} className="text-secondary" />
                    {formatDistanceToNowStrict(timestamp, { addSuffix: true, locale: fr })}
                  </span>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </DashboardSection>
  );
}
