import type { DashboardSavedOffer } from "@/features/candidates/hooks/useCandidateDashboardData";

export interface DatedSavedOffer {
  savedOffer: DashboardSavedOffer;
  job: NonNullable<DashboardSavedOffer["job_offers"]>;
  deadline: string;
  timestamp: number;
}

export interface SavedOfferDeadlineSummary {
  upcoming: DatedSavedOffer[];
  datedCount: number;
  expiredCount: number;
  unavailableCount: number;
}

export function getSavedOfferDeadlineSummary(
  savedOffers: DashboardSavedOffer[],
  now = Date.now(),
): SavedOfferDeadlineSummary {
  const datedOffers = savedOffers.flatMap((savedOffer) => {
    const job = savedOffer.job_offers;
    if (!job) return [];

    for (const deadline of [job.deadline, job.expires_at]) {
      if (!deadline) continue;
      const timestamp = new Date(deadline).getTime();
      if (Number.isFinite(timestamp)) {
        return [{ savedOffer, job, deadline, timestamp }];
      }
    }
    return [];
  });
  const upcoming = datedOffers
    .filter(
      ({ job, timestamp }) =>
        timestamp > now && job.status !== "expired" && job.status !== "archived",
    )
    .sort((first, second) => first.timestamp - second.timestamp);

  return {
    upcoming,
    datedCount: datedOffers.length,
    expiredCount: datedOffers.length - upcoming.length,
    unavailableCount: savedOffers.length - datedOffers.length,
  };
}
