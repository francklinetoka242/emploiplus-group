import test from "node:test";
import assert from "node:assert/strict";
import type { CandidateProfileSummary } from "../../src/features/profile/types/index.ts";
import { calculateProfileCompletion } from "../../src/features/profile/profileCompletion.ts";

function summary(
  overrides: Partial<NonNullable<CandidateProfileSummary["profile"]>> = {},
): CandidateProfileSummary {
  return {
    profile: {
      id: "candidate",
      user_id: "user",
      first_name: "Jean",
      last_name: "Dupont",
      email: "jean@example.com",
      phone: null,
      avatar_url: null,
      headline: "Developpeur",
      location_city: "Brazzaville",
      location_country: "Congo",
      bio: "Developpeur logiciel",
      date_of_birth: null,
      status: "active",
      cv_url: "candidates/id/cv/file.pdf",
      cv_text: "Experience React",
      embedding_vector: "[0.1]",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      ...overrides,
    },
    experiences: [
      {
        id: "experience",
        candidate_id: "candidate",
        job_title: "Développeur",
        company: "EmploiPlus",
        description: null,
        start_date: "2025-01-01",
        end_date: null,
        is_current: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    educations: [
      {
        id: "education",
        candidate_id: "candidate",
        school: "Université",
        degree: "Licence",
        field_of_study: "Informatique",
        start_date: "2020-01-01",
        end_date: "2023-01-01",
        is_current: false,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    skills: [
      {
        id: "skill",
        candidate_id: "candidate",
        skill_name: "React",
        proficiency_level: "advanced",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    languages: [
      {
        id: "language",
        candidate_id: "candidate",
        language_name: "Français",
        proficiency_level: "fluent",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    preferences: {
      id: "preferences",
      candidate_id: "candidate",
      contract_types: ["cdi"],
      work_types: [],
      mobility_radius_km: 0,
      mobility_modes: [],
      salary_min: 0,
      salary_max: 0,
      seniority_level: "",
      availability_status: "",
      availability_date: null,
      job_alerts_enabled: false,
      job_alert_frequency: "",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  };
}

test("requires an analyzed server CV for complete profile status", () => {
  const result = calculateProfileCompletion(
    summary({ cv_url: null, cv_text: null, embedding_vector: null }),
  );
  assert.equal(result.completionPercentage, 90);
  assert.deepEqual(result.missingItems, ["CV"]);
});

test("returns zero for an empty profile", () => {
  const result = calculateProfileCompletion({
    profile: null,
    experiences: [],
    educations: [],
    skills: [],
    languages: [],
    preferences: null,
  });
  assert.equal(result.completionPercentage, 0);
  assert.equal(result.missingItems.length, 10);
});

test("keeps partial profiles below complete status", () => {
  const result = calculateProfileCompletion(
    summary({
      first_name: null,
      bio: null,
      cv_text: null,
      embedding_vector: null,
    }),
  );
  assert.equal(result.completionPercentage, 80);
  assert.ok(!result.missingItems.includes("CV"));
  assert.ok(result.missingItems.includes("Résumé professionnel"));
});

test("does not complete CV item when only the server file exists", () => {
  const result = calculateProfileCompletion(summary({ cv_text: null, embedding_vector: null }));
  assert.equal(result.completionPercentage, 100);
  assert.deepEqual(result.missingItems, []);
});

test("completes CV item only with text and embedding", () => {
  const result = calculateProfileCompletion(summary());
  assert.equal(result.completionPercentage, 100);
  assert.deepEqual(result.missingItems, []);
  assert.equal(result.completionItems.length, 10);
  assert.ok(result.completionItems.every((item) => item.route.startsWith("/candidate/profile")));
  assert.ok(result.completionItems.every((item) => item.isCompleted));
});
