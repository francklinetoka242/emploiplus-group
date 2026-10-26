import test from "node:test";
import assert from "node:assert/strict";
import {
  getNextBestAction,
  type GetNextBestActionInput,
} from "../../src/features/candidates/dashboard/getNextBestAction.ts";

const now = new Date("2026-10-25T12:00:00.000Z");

function createInput(overrides: Partial<GetNextBestActionInput> = {}): GetNextBestActionInput {
  return {
    profileCompletion: {
      completionPercentage: 100,
      missingItems: [],
      completionItems: [],
    },
    profile: {
      cv_url: "candidate/cv.pdf",
      cv_last_updated_at: "2026-09-01T12:00:00.000Z",
    },
    recommendedJobsCount: 0,
    assistantAvailable: false,
    now,
    ...overrides,
  };
}

test("prioritizes an incomplete profile and links to its first missing item", () => {
  const action = getNextBestAction(
    createInput({
      profileCompletion: {
        completionPercentage: 90,
        missingItems: ["Formation"],
        completionItems: [
          {
            id: "education",
            label: "Formation",
            route: "/candidate/profile?tab=education",
            weight: 1,
            isCompleted: false,
          },
        ],
      },
    }),
  );

  assert.equal(action?.id, "complete-profile");
  assert.equal(action?.href, "/candidate/profile?tab=education");
});

test("prioritizes a missing CV after profile completion", () => {
  const action = getNextBestAction(
    createInput({ profile: { cv_url: null }, urgentDeadline: "2026-10-27T12:00:00.000Z" }),
  );
  assert.equal(action?.id, "upload-cv");
});

test("prioritizes a CV older than 180 days", () => {
  const action = getNextBestAction(
    createInput({
      profile: { cv_url: "candidate/cv.pdf", cv_last_updated_at: "2026-04-27T11:59:59.000Z" },
    }),
  );
  assert.equal(action?.id, "update-cv");
});

test("returns the saved offer details for an upcoming deadline", () => {
  const action = getNextBestAction(
    createInput({
      urgentDeadline: "2026-10-30T12:00:00.000Z",
      urgentOffer: {
        title: "Responsable RH",
        company: "EmploiPlus",
        href: "/jobs/responsable-rh",
      },
    }),
  );
  assert.equal(action?.id, "upcoming-deadline");
  assert.equal(
    `${action?.messagePrefix}${action?.messageHighlight}${action?.messageSuffix}`,
    "L’offre Responsable RH chez EmploiPlus se termine dans 5 jours.",
  );
  assert.equal(action?.href, "/jobs/responsable-rh");
});

test("does not treat expired or distant deadlines as urgent", () => {
  assert.notEqual(
    getNextBestAction(
      createInput({ urgentDeadline: "2026-10-25T11:59:59.000Z", recommendedJobsCount: 1 }),
    )?.id,
    "upcoming-deadline",
  );
  assert.notEqual(
    getNextBestAction(
      createInput({ urgentDeadline: "2026-11-02T12:00:01.000Z", recommendedJobsCount: 1 }),
    )?.id,
    "upcoming-deadline",
  );
});

test("recommends available jobs before Maelise", () => {
  const action = getNextBestAction(
    createInput({ recommendedJobsCount: 2, assistantAvailable: true }),
  );
  assert.equal(action?.id, "recommended-jobs");
  assert.equal(
    `${action?.messagePrefix}${action?.messageSuffix}`,
    "2 offres correspondent à votre profil.",
  );
});

test("falls back to Maelise when there are no higher-priority actions", () => {
  const action = getNextBestAction(createInput({ assistantAvailable: true }));
  assert.equal(action?.id, "maelise");
  assert.equal(action?.href, null);
});

test("returns null when no action is available", () => {
  assert.equal(getNextBestAction(createInput()), null);
});

test("uses the first missing criterion in the profile action text", () => {
  const action = getNextBestAction(
    createInput({
      profileCompletion: {
        completionPercentage: 90,
        missingItems: ["Résumé professionnel"],
        completionItems: [
          {
            id: "professional-summary",
            label: "Résumé professionnel",
            route: "/candidate/profile?tab=profile",
            weight: 1,
            isCompleted: false,
          },
        ],
      },
    }),
  );
  assert.equal(
    `${action?.messagePrefix}${action?.messageHighlight}${action?.messageSuffix}`,
    "Il vous manque votre bio pour compléter votre profil.",
  );
});

test("uses distinct factual copy for missing and stale CV actions", () => {
  const missing = getNextBestAction(createInput({ profile: { cv_url: null } }));
  const stale = getNextBestAction(
    createInput({
      profile: { cv_url: "candidate/cv.pdf", cv_last_updated_at: "2026-04-27T11:59:59.000Z" },
    }),
  );
  assert.match(missing?.messagePrefix ?? "", /CV n’est pas encore ajouté/);
  assert.match(stale?.messagePrefix ?? "", /date de plus de 6 mois/);
});
