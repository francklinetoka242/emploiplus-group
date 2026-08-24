import assert from "node:assert/strict";
import test from "node:test";
import { isPublishedAndEligibleOffer } from "../../src/features/jobs/api/jobsApi";
import { computeStructuredMatchScore, type CandidateMatchingProfile } from "../../src/services/matchScoreUtils";

const now = "2026-08-24T12:00:00.000Z";
const profile: CandidateMatchingProfile = {
  title: "Développeur React",
  summary: "Développeur web",
  locationCity: "Paris",
  locationCountry: "France",
  cvText: "React TypeScript 5 ans",
  skills: [{ name: "React", level: "senior" }, { name: "TypeScript", level: "senior" }],
  experiences: [{ title: "Développeur frontend", description: "Applications React", startDate: "2019-01-01", endDate: null, isCurrent: true }],
  education: [],
  languages: [],
  preferences: { contractTypes: ["cdi"], workTypes: [], salaryMin: null, salaryMax: null, mobilityModes: [] },
};

const offer = {
  title: "Développeur React",
  requirements: "React TypeScript",
  description: "Applications web",
  location_city: "Paris",
  location_country: "France",
  contract_type: "cdi",
  salary: null,
};

test("structured scoring evaluates a strong match even when hash signal is zero", () => {
  const result = computeStructuredMatchScore(profile, offer, 0);
  assert.ok(result.score >= 75);
  assert.ok(result.details.matchedSkills.length >= 2);
});

test("eligibility excludes expired, future and unpublished offers", () => {
  assert.equal(isPublishedAndEligibleOffer({ status: "published", publish_at: null, deadline: null, expires_at: null }, now), true);
  assert.equal(isPublishedAndEligibleOffer({ status: "published", publish_at: "2026-08-25T00:00:00.000Z", deadline: null, expires_at: null }, now), false);
  assert.equal(isPublishedAndEligibleOffer({ status: "published", publish_at: null, deadline: "2026-08-23T00:00:00.000Z", expires_at: null }, now), false);
  assert.equal(isPublishedAndEligibleOffer({ status: "draft", publish_at: null, deadline: null, expires_at: null }, now), false);
});
