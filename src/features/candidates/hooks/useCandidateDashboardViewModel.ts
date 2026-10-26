import { differenceInCalendarDays } from "date-fns";
import { useMemo } from "react";
import { useProfileCompletion } from "@/features/profile/hooks/useProfileCompletion";
import { countApplicationsByStatus } from "@/features/candidates/dashboard/applicationActivity";
import { getNextBestAction } from "@/features/candidates/dashboard/getNextBestAction";
import { getUpcomingSavedOfferDeadline } from "@/features/candidates/dashboard/getUpcomingSavedOfferDeadline";
import type { useCandidateDashboardData } from "./useCandidateDashboardData";

type DashboardData = ReturnType<typeof useCandidateDashboardData>;

export function useCandidateDashboardViewModel(dashboard: DashboardData) {
  const completion = useProfileCompletion({
    profile: dashboard.profile,
    experiences: dashboard.experiences,
    educations: dashboard.educations,
    skills: dashboard.skills,
    languages: dashboard.languages,
    preferences: dashboard.preferences,
  });
  const profileCompletion = dashboard.isReady ? completion.completionPercentage : 0;
  const nearestDeadline = useMemo(
    () => getUpcomingSavedOfferDeadline(dashboard.savedOffers.data),
    [dashboard.savedOffers.data],
  );
  const applicationStatusCounts = useMemo(
    () => countApplicationsByStatus(dashboard.allApplications.data),
    [dashboard.allApplications.data],
  );
  const applicationCount = Object.values(applicationStatusCounts).reduce(
    (total, count) => total + count,
    0,
  );
  const daysUntilDeadline = nearestDeadline
    ? differenceInCalendarDays(new Date(nearestDeadline), new Date())
    : null;
  const deadlineDays =
    daysUntilDeadline !== null && daysUntilDeadline <= 7 ? daysUntilDeadline : null;
  const inProgressApplications =
    applicationStatusCounts.submitted +
    applicationStatusCounts.reviewed +
    applicationStatusCounts.shortlisted;
  const action = getNextBestAction({
    profileCompletion: completion,
    profile: dashboard.profile,
    urgentDeadline: nearestDeadline,
    recommendedJobsCount: dashboard.recommendations.jobs.length,
    assistantAvailable: true,
  });

  return {
    completion,
    profileCompletion,
    nearestDeadline,
    deadlineDays,
    inProgressApplications,
    applicationStatusCounts: {
      data: applicationStatusCounts,
      loading: dashboard.allApplications.loading,
      error: dashboard.allApplications.error,
    },
    applicationCount: {
      data: applicationCount,
      loading: dashboard.allApplications.loading,
      error: dashboard.allApplications.error,
    },
    action,
    savedOfferMetric: {
      data: dashboard.savedOffers.data.length,
      loading: dashboard.savedOffers.loading,
      error: dashboard.savedOffers.error,
    },
    recommendationMetric: {
      data: dashboard.recommendations.jobs.length,
      loading: dashboard.recommendations.loading,
      error:
        dashboard.recommendations.status === "error" ||
        dashboard.recommendations.status === "cv_analysis_failed"
          ? dashboard.recommendations.error || "Les recommandations sont indisponibles."
          : null,
    },
  };
}
