import { differenceInCalendarDays, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncMetric } from "@/features/candidates/dashboard/dashboardTypes";
import { getSavedOfferDeadlineSummary } from "@/features/candidates/dashboard/savedOfferDeadlines";
import { DashboardSection } from "./DashboardSection";
import { DashboardIcon } from "./DashboardIcon";

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
      eyebrow="À surveiller"
      title="Échéances à venir"
      description="Dates limites des offres que vous avez enregistrées."
      borderTop={false}
    >
      {savedOffers.loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 rounded-sm" />
          <Skeleton className="h-12 rounded-sm" />
        </div>
      ) : savedOffers.error ? (
        <div className="py-3" role="alert">
          <p className="text-sm text-destructive">{savedOffers.error}</p>
          <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
            Réessayer
          </Button>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-sm text-muted-foreground">
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
        <ul className="divide-y divide-border">
          {offers.map(({ savedOffer, job, deadline, timestamp }) => {
            const daysUntil = differenceInCalendarDays(new Date(timestamp), new Date());
            const urgency =
              daysUntil <= 3
                ? "text-destructive"
                : daysUntil <= 7
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-muted-foreground";
            return job && deadline ? (
              <li
                key={savedOffer.id}
                className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 first:pt-0"
              >
                <span className="min-w-0 flex-1">
                  <Link
                    to={`/jobs/${job.slug}`}
                    className="block truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {job.title}
                  </Link>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {job.company}
                  </span>
                </span>
                <span
                  className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${urgency}`}
                >
                  <DashboardIcon name="Clock" size={15} />
                  {formatDistanceToNowStrict(timestamp, { addSuffix: true, locale: fr })}
                </span>
                <Link
                  to={`/jobs/${job.slug}`}
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  Voir l’offre
                </Link>
              </li>
            ) : null;
          })}
        </ul>
      )}
    </DashboardSection>
  );
}
