import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CandidateApplicationActivity } from "@/features/candidates/api/applicationsApi";
import { type ApplicationStatus } from "@/features/candidates/types/applicationStatus";
import type { AsyncMetric } from "@/features/candidates/dashboard/dashboardTypes";
import { ApplicationsActivityChart } from "./ApplicationsActivityChart";
import { ApplicationStatusList } from "./ApplicationStatusList";
import { DashboardSection } from "./DashboardSection";

interface ApplicationProgressProps {
  activity: AsyncMetric<CandidateApplicationActivity[]>;
  statusCounts: AsyncMetric<Record<ApplicationStatus, number>>;
  onRetry: () => void;
  onRetryStatuses: () => void;
}

export function ApplicationProgress({
  activity,
  statusCounts,
  onRetry,
  onRetryStatuses,
}: ApplicationProgressProps) {
  return (
    <DashboardSection
      title="Suivi de vos candidatures"
      description="Statut actuel des candidatures et rythme d’envoi sur huit semaines."
      icon="PaperPlaneTilt"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <ApplicationStatusList
          counts={statusCounts.data}
          loading={statusCounts.loading}
          error={statusCounts.error}
          onRetry={onRetryStatuses}
        />
        {activity.loading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : activity.error ? (
          <div
            className="rounded-xl border border-destructive/20 bg-destructive/5 p-4"
            role="alert"
          >
            <p className="text-sm text-destructive">{activity.error}</p>
            <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
              Réessayer
            </Button>
          </div>
        ) : (
          <ApplicationsActivityChart
            applications={activity.data}
            totalApplications={
              statusCounts.loading || statusCounts.error
                ? null
                : Object.values(statusCounts.data).reduce((total, count) => total + count, 0)
            }
          />
        )}
      </div>
    </DashboardSection>
  );
}
