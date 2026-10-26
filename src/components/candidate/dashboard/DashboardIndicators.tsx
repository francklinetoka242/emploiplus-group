import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEcoMode } from "@/contexts/EcoModeContext";
import type { AsyncMetric } from "@/features/candidates/dashboard/dashboardTypes";
import { DashboardIcon, type DashboardIconName } from "./DashboardIcon";

interface MetricCardProps {
  label: string;
  ariaLabel: string;
  value: number | string | null;
  icon: DashboardIconName;
  iconTone: string;
  href: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function MetricCard({
  label,
  ariaLabel,
  value,
  icon,
  iconTone,
  href,
  loading,
  error,
  onRetry,
}: MetricCardProps) {
  const reduceMotion = useReducedMotion();
  const { isEcoMode } = useEcoMode();
  const hoverMotion =
    reduceMotion || isEcoMode ? "" : "transition-transform duration-150 hover:-translate-y-0.5";

  return (
    <Card className={`rounded-2xl border-border/80 shadow-none ${hoverMotion}`}>
      <CardContent className="p-4 sm:p-5">
        <Link
          to={href}
          aria-label={ariaLabel}
          className="group flex min-h-[86px] items-start justify-between gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>
            <span className="block whitespace-nowrap text-sm font-medium text-muted-foreground">
              {label}
            </span>
            {loading ? (
              <Skeleton className="mt-3 h-7 w-16" />
            ) : error ? (
              <span className="mt-2 block text-xs text-destructive">Donnée indisponible</span>
            ) : (
              <span className="mt-2 block text-3xl font-semibold tabular-nums text-foreground">
                {value ?? "—"}
              </span>
            )}
          </span>
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${iconTone}`}
          >
            <DashboardIcon name={icon} size={21} />
          </span>
        </Link>
        {error && !loading && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-xs text-muted-foreground" title={error}>
              {error}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-7 shrink-0 px-2 text-xs"
            >
              Réessayer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
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
  const metrics = [
    {
      label: "Candidatures",
      ariaLabel: "Candidatures envoyées",
      value: applicationCount.data,
      icon: "PaperPlaneTilt" as const,
      iconTone: "bg-blue-500/10 text-blue-700 group-hover:bg-blue-500/15 dark:text-blue-300",
      href: "/candidate/applications",
      ...applicationCount,
      onRetry: onRetryApplications,
    },
    {
      label: "Enregistrées",
      ariaLabel: "Offres enregistrées",
      value: savedOfferCount.data,
      icon: "BookmarkSimple" as const,
      iconTone: "bg-secondary/20 text-amber-800 group-hover:bg-secondary/30 dark:text-amber-200",
      href: "/candidate/saved-jobs",
      ...savedOfferCount,
      onRetry: onRetrySavedOffers,
    },
    {
      label: "Notifications",
      ariaLabel: "Notifications non lues",
      value: unreadNotifications.data,
      icon: "BellRinging" as const,
      iconTone:
        "bg-violet-500/10 text-violet-700 group-hover:bg-violet-500/15 dark:text-violet-300",
      href: "/candidate/notifications",
      ...unreadNotifications,
      onRetry: onRetryNotifications,
    },
    {
      label: "Recommandées",
      ariaLabel: "Offres recommandées",
      value: recommendationCount.data,
      icon: "Briefcase" as const,
      iconTone:
        "bg-emerald-500/10 text-emerald-700 group-hover:bg-emerald-500/15 dark:text-emerald-300",
      href: "#recommended-jobs",
      ...recommendationCount,
      onRetry: onRetryRecommendations,
    },
  ];

  return (
    <section
      aria-label="Indicateurs de votre espace"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </section>
  );
}
