import test from "node:test";
import assert from "node:assert/strict";
import { getSavedOfferDeadlineSummary } from "../../src/features/candidates/dashboard/savedOfferDeadlines.ts";
import type { DashboardSavedOffer } from "../../src/features/candidates/hooks/useCandidateDashboardData.ts";

function savedOffer(
  id: string,
  deadline: string | null,
  expiresAt: string | null = null,
): DashboardSavedOffer {
  return {
    id,
    saved_at: "2026-10-01T12:00:00.000Z",
    job_offer_id: `job-${id}`,
    job_offers: {
      id: `job-${id}`,
      slug: `job-${id}`,
      title: `Offre ${id}`,
      company: "Entreprise",
      deadline,
      expires_at: expiresAt,
      status: "published",
    },
  };
}

test("uses a valid expiry date when the deadline is absent or invalid", () => {
  const result = getSavedOfferDeadlineSummary(
    [
      savedOffer("missing", null, "2026-10-30T12:00:00.000Z"),
      savedOffer("invalid", "not-a-date", "2026-10-31T12:00:00.000Z"),
    ],
    new Date("2026-10-25T12:00:00.000Z").getTime(),
  );

  assert.equal(result.upcoming.length, 2);
  assert.equal(result.datedCount, 2);
  assert.equal(result.unavailableCount, 0);
});

test("reports expired, missing, and upcoming saved offer dates separately", () => {
  const result = getSavedOfferDeadlineSummary(
    [
      savedOffer("upcoming", "2026-10-30T12:00:00.000Z"),
      savedOffer("expired", "2026-10-20T12:00:00.000Z"),
      savedOffer("missing", null),
      { ...savedOffer("no-job", null), job_offers: null },
    ],
    new Date("2026-10-25T12:00:00.000Z").getTime(),
  );

  assert.equal(result.upcoming.length, 1);
  assert.equal(result.datedCount, 2);
  assert.equal(result.expiredCount, 1);
  assert.equal(result.unavailableCount, 2);
});
