import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  applicationStatusConfig,
  type ApplicationStatus,
} from "@/features/candidates/types/applicationStatus";
import { DashboardIcon, type DashboardIconName } from "./DashboardIcon";

interface ApplicationStatusListProps {
  counts: Record<ApplicationStatus, number>;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const statuses = Object.keys(applicationStatusConfig) as ApplicationStatus[];
const segmentTones = [
  "bg-primary",
  "bg-primary/80",
  "bg-primary/60",
  "bg-primary/40",
  "bg-primary/25",
  "bg-primary/15",
];

export function ApplicationStatusList({
  counts,
  loading,
  error,
  onRetry,
}: ApplicationStatusListProps) {
  const total = statuses.reduce((sum, status) => sum + counts[status], 0);

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Répartition par statut</h3>
      {loading ? (
        <Skeleton
          className="mt-3 h-2 w-full rounded-sm"
          role="status"
          aria-label="Chargement des statuts"
        />
      ) : error ? (
        <div className="py-3" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" onClick={onRetry} className="mt-1 px-0">
            Réessayer
          </Button>
        </div>
      ) : (
        <>
          <div
            className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={`${total} candidature${total === 1 ? "" : "s"} répartie${total === 1 ? "" : "s"} par statut`}
          >
            {statuses.map((status, index) =>
              counts[status] > 0 && total > 0 ? (
                <span
                  key={status}
                  className={segmentTones[index % segmentTones.length]}
                  style={{ width: `${(counts[status] / total) * 100}%` }}
                  title={`${applicationStatusConfig[status].label} : ${counts[status]}`}
                />
              ) : null,
            )}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {statuses.map((status) => {
              const config = applicationStatusConfig[status];
              const count = counts[status];
              return (
                <li
                  key={status}
                  className={`flex items-center gap-1.5 text-xs ${count === 0 ? "text-muted-foreground/60" : "text-muted-foreground"}`}
                >
                  <DashboardIcon
                    name={config.icon as DashboardIconName}
                    size={15}
                    weight={count > 0 ? "fill" : "duotone"}
                    className={count > 0 ? "text-primary" : ""}
                  />
                  <span>{config.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{count}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Les statuts indiquent l’état actuel, pas l’historique des changements.
          </p>
        </>
      )}
    </div>
  );
}
