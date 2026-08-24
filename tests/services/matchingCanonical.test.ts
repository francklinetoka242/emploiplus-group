import test from "node:test";
import assert from "node:assert/strict";
import { computeStructuredMatchScore } from "../../src/services/matchScoreUtils.ts";

test("structured matching does not turn an unrelated offer into 100 percent", () => {
  const result = computeStructuredMatchScore(
    {
      title: "Developpeur logiciel",
      summary: "Developpeur web specialise en JavaScript",
      cvText: "JavaScript React",
      skills: [{ name: "JavaScript" }],
      experiences: [],
      education: [],
      languages: [],
      preferences: null,
    },
    {
      title: "Comptable fiscaliste",
      description: "Gestion comptable et fiscale",
      requirements: "Expertise en comptabilite et audit",
      company: "Entreprise",
      tags: ["finance"],
    },
  );

  assert.ok(result.score < 100);
});
