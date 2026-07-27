import assert from "node:assert/strict";
import test from "node:test";

import { buildGroqAnalysisPrompt } from "../../src/services/groqAnalysisPrompt";

test("buildGroqAnalysisPrompt includes strict factual grounding and JSON response structure", () => {
  const prompt = buildGroqAnalysisPrompt(
    "CV candidat test",
    {
      title: "Comptable",
      company: "Acme",
      description: "Poste comptable",
      requirements: "BAC+3 en comptabilité",
    },
    "job-123",
    2,
  );

  assert.match(prompt, /FIDÉLITÉ AU CV/);
  assert.match(prompt, /Ne suppose PAS d'expérience non mentionnée/);
  assert.match(prompt, /NE commence JAMAIS la réponse par des formules génériques/);
  assert.match(prompt, /Expérience détectée dans le CV : 2 ans/);
  assert.match(prompt, /"score": number/);
  assert.match(prompt, /"experienceVerified": string/);
  assert.match(prompt, /"gaps": \["axe manquant 1", "axe manquant 2"\]/);
  assert.match(prompt, /"summary": "Explication factuelle et personnalisée sans phrases pré-mâchées"/);
});
