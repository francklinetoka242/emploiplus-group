import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncMetric } from "@/features/candidates/dashboard/dashboardTypes";
import { DashboardIcon, type DashboardIconName } from "./DashboardIcon";

interface Metric {
  label: string;
  ariaLabel: string;
  value: AsyncMetric<number>;
  icon: DashboardIconName;
  href: string;
  onRetry: () => void;
}

interface DashboardIndicatorsProps {
  applicationCount: AsyncMetric<number>;
  savedOfferCount: AsyncMetric<number>;
  unreadNotifications: AsyncMetric<number>;
  recommendationCount: AsyncMetric<number>;
  onRetryApplications: () => void;
  onRetrySavedOffers: () => void;
  onRetryNotifications: () => void;
  onRetryRecommendations: () => void;
}

export function DashboardIndicators({
  applicationCount,
  savedOfferCount,
  unreadNotifications,
  recommendationCount,
  onRetryApplications,
  onRetrySavedOffers,
  onRetryNotifications,
  onRetryRecommendations,
}: DashboardIndicatorsProps) {
  const metrics: Metric[] = [
    {
      label: "Candidatures",
      ariaLabel: "Candidatures envoyées",
      value: applicationCount,
      icon: "PaperPlaneTilt",
      href: "/candidate/applications",
      onRetry: onRetryApplications,
    },
    {
      label: "Enregistrées",
      ariaLabel: "Offres enregistrées",
      value: savedOfferCount,
      icon: "BookmarkSimple",
      href: "/candidate/saved-jobs",
      onRetry: onRetrySavedOffers,
    },
    {
      label: "Notifications",
      ariaLabel: "Notifications non lues",
      value: unreadNotifications,
      icon: "BellRinging",
      href: "/candidate/notifications",
      onRetry: onRetryNotifications,
    },
    {
      label: "Recommandées",
      ariaLabel: "Offres recommandées",
      value: recommendationCount,
      icon: "Briefcase",
      href: "#recommended-jobs",
      onRetry: onRetryRecommendations,
    },
  ];

  return (
    <section
      aria-label="Indicateurs de votre espace"
      className="grid grid-cols-2 border-b border-t border-border lg:grid-cols-4"
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`min-w-0 border-border/70 py-5 lg:border-b-0 ${
            index < 2 ? "border-b" : ""
          } ${index % 2 === 0 ? "border-r pr-4" : "pl-4"} ${index === 2 ? "lg:border-b-0" : ""} ${
            index < 3 ? "lg:border-r lg:px-5" : "lg:pl-5"
          }`}
        >
          <Link
            to={metric.href}
            aria-label={metric.ariaLabel}
            className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-primary">
              <DashboardIcon name={metric.icon} size={17} />
              {metric.label}
            </span>
            {metric.value.loading ? (
              <Skeleton className="mt-2 h-9 w-16" />
            ) : metric.value.error ? (
              <span className="mt-2 block text-xs text-destructive">Donnée indisponible</span>
            ) : (
              <span className="mt-1 block text-3xl font-semibold tabular-nums text-foreground transition-colors group-hover:text-primary">
                {metric.value.data}
              </span>
            )}
          </Link>
          {metric.value.error && !metric.value.loading && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2">
              <p className="line-clamp-1 text-xs text-muted-foreground" title={metric.value.error}>
                {metric.value.error}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={metric.onRetry}
                className="h-7 px-1 text-xs"
              >
                Réessayer
              </Button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
