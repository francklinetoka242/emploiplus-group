import test from "node:test";
import assert from "node:assert/strict";
import { calculateProfileCompletion } from "../../src/features/profile/profileCompletion.ts";

function summary(overrides: Record<string, unknown> = {}) {
  return {
    profile: {
      first_name: "Jean",
      last_name: "Dupont",
      headline: "Developpeur",
      location_city: "Brazzaville",
      location_country: "Congo",
      bio: "Developpeur logiciel",
      cv_url: "candidates/id/cv/file.pdf",
      cv_text: "Experience React",
      embedding_vector: "[0.1]",
      ...overrides,
    },
    experiences: [{ id: "experience" }],
    educations: [{ id: "education" }],
    skills: [{ id: "skill" }],
    languages: [{ id: "language" }],
    preferences: { contract_types: ["cdi"] },
  } as any;
}

test("requires an analyzed server CV for complete profile status", () => {
  const result = calculateProfileCompletion(summary({ cv_url: null, cv_text: null, embedding_vector: null }));
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
  const result = calculateProfileCompletion(summary({
    first_name: null,
    bio: null,
    cv_text: null,
    embedding_vector: null,
  }));
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
});
