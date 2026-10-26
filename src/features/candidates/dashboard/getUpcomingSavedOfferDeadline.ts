import type { DashboardSavedOffer } from "@/features/candidates/hooks/useCandidateDashboardData";
import { getSavedOfferDeadlineSummary } from "./savedOfferDeadlines";

export function getUpcomingSavedOfferDeadline(
  savedOffers: DashboardSavedOffer[],
  now = Date.now(),
): string | null {
  return getSavedOfferDeadlineSummary(savedOffers, now).upcoming[0]?.deadline ?? null;
}
