import assert from "node:assert/strict";
import test from "node:test";
import { computeStructuredMatchScore, type CandidateMatchingProfile } from "../../src/services/matchScoreUtils";

const baseProfile: CandidateMatchingProfile = {
  title: "Développeur JavaScript",
  summary: "Développeur web",
  locationCity: "Paris",
  locationCountry: "France",
  cvText: "JavaScript TypeScript React 5 ans",
  skills: [
    { name: "Java Script", level: "senior" },
    { name: "TypeScript", level: "intermediate" },
    { name: "React JS", level: "senior" },
  ],
  experiences: [{ title: "Développeur frontend", description: "Applications React", startDate: "2019-01-01", endDate: null, isCurrent: true }],
  education: [{ degree: "Master", field: "Informatique" }],
  languages: [{ name: "Français", level: "C1" }],
  preferences: { contractTypes: ["cdi"], workTypes: [], salaryMin: 35000, salaryMax: null, mobilityModes: [] },
};

test("scores structured skills and normalizes obvious technology variants", () => {
  const result = computeStructuredMatchScore(baseProfile, {
    title: "Développeur React",
    requirements: "React TypeScript JavaScript",
    description: "Applications web",
    location_city: "Paris",
    location_country: "France",
    contract_type: "cdi",
    salary: "45000 EUR",
  });

  assert.equal(result.details.missingSkills.length, 0);
  assert.ok(result.details.matchedSkills.includes("react"));
  assert.ok(result.score >= 75);
});

test("penalizes missing skills and incompatible location without making missing education a zero", () => {
  const result = computeStructuredMatchScore(
    { ...baseProfile, education: [], locationCity: "Lyon", preferences: null },
    {
      title: "Développeur Node",
      requirements: "Node SQL",
      description: "Poste sur site",
      location_city: "Paris",
      location_country: "France",
      contract_type: "cdi",
      salary: null,
    },
  );

  assert.ok(result.details.missingSkills.length >= 1);
  assert.equal(result.details.educationScore, 0);
  assert.equal(result.details.locationScore, 0);
  assert.ok(result.score < 75);
});

test("does not penalize distance for remote offers", () => {
  const result = computeStructuredMatchScore(
    { ...baseProfile, locationCity: "Lyon" },
    {
      title: "Développeur React remote",
      requirements: "React",
      description: "Télétravail complet",
      location_city: "Paris",
      location_country: "France",
      contract_type: "cdi",
      salary: null,
    },
  );

  assert.equal(result.details.locationScore, 0);
  assert.ok(result.details.strengths.includes("Localisation compatible"));
});
