import assert from "node:assert/strict";
import test from "node:test";

import { computeMatchScoreFromText } from "../../src/services/matchScoreUtils";

test("caps the score at 25% when there is zero hard-skill overlap for a technical role", () => {
  const cvText = "Chef de projet passionné, forte communication, gestion d'équipe, maîtrise de PowerPoint et Excel.";
  const jobOffer = {
    title: "Comptable junior",
    description: "Poste comptable avec gestion de la paie et des écritures comptables.",
    requirements: "Maîtrise de la comptabilité, de la fiscalité et des processus de clôture.",
  };

  const result = computeMatchScoreFromText(cvText, jobOffer);

  assert.equal(result.score, 25);
  assert.equal(result.details.dealBreakerApplied, true);
  assert.equal(result.details.hardSkillsOverlap, 0);
});

test("keeps a higher score when the CV contains the core hard skills", () => {
  const cvText = "Comptable expérimenté avec compétences en comptabilité générale, fiscalité, clôture et reporting financier.";
  const jobOffer = {
    title: "Comptable junior",
    description: "Poste comptable avec gestion de la paie et des écritures comptables.",
    requirements: "Maîtrise de la comptabilité, de la fiscalité et des processus de clôture.",
  };

  const result = computeMatchScoreFromText(cvText, jobOffer);

  assert.ok(result.score > 25);
  assert.equal(result.details.dealBreakerApplied, false);
});
