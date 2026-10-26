import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  applicationStatusConfig,
  type ApplicationStatus,
} from "@/features/candidates/types/applicationStatus";
import { DashboardIcon } from "./DashboardIcon";

interface ApplicationStatusListProps {
  counts: Record<ApplicationStatus, number>;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const statuses = Object.keys(applicationStatusConfig) as ApplicationStatus[];

export function ApplicationStatusList({
  counts,
  loading,
  error,
  onRetry,
}: ApplicationStatusListProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Répartition par statut</h3>
      {loading ? (
        <div className="space-y-2" role="status" aria-label="Chargement des statuts">
          {statuses.map((status) => (
            <Skeleton key={status} className="h-10 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
            Réessayer
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {statuses.map((status) => {
              const config = applicationStatusConfig[status];
              return (
                <li
                  key={status}
                  className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2"
                >
                  <span
                    className={`flex min-w-0 items-center gap-2 text-sm font-medium ${config.color}`}
                  >
                    <DashboardIcon
                      name={config.icon}
                      size={19}
                      weight={counts[status] > 0 ? "fill" : "duotone"}
                    />
                    <span className="truncate">{config.label}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {counts[status]}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Les statuts indiquent l’état actuel, pas l’historique des changements.
          </p>
        </>
      )}
    </div>
  );
}
