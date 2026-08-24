import test from "node:test";
import assert from "node:assert/strict";
import {
  getCandidateCvAnalysisState,
  hasAnalyzableCandidateCv,
  hasCandidateCv,
} from "../../src/features/candidates/api/cvApi.ts";

test("recognizes a server CV from cv_url without extracted text", () => {
  assert.equal(hasCandidateCv({ cv_url: "candidates/id/cv/file.pdf" }), true);
  assert.equal(hasAnalyzableCandidateCv({ cv_url: "candidates/id/cv/file.pdf" }), false);
  assert.equal(getCandidateCvAnalysisState({ cv_url: "candidates/id/cv/file.pdf" }).status, "cv_processing");
});

test("requires both extracted text and an embedding for analysis", () => {
  assert.equal(hasCandidateCv({ cv_text: "Experience professionnelle" }), false);
  assert.equal(hasAnalyzableCandidateCv({ cv_text: "Experience professionnelle" }), false);
  assert.equal(hasCandidateCv({ cv_url: "candidates/id/cv/file.pdf", cv_text: "Experience professionnelle" }), true);
  assert.equal(hasAnalyzableCandidateCv({ cv_url: "candidates/id/cv/file.pdf", cv_text: "Experience professionnelle", embedding_vector: "[0.1]" }), true);
  assert.equal(getCandidateCvAnalysisState({ cv_url: "candidates/id/cv/file.pdf", cv_text: "Experience professionnelle", embedding_vector: "[0.1]" }).status, "ready");
});

test("reports failed analysis when a stored CV cannot be analyzed", () => {
  assert.equal(getCandidateCvAnalysisState({ cv_url: "candidates/id/cv/file.pdf", cv_last_updated_at: "2026-08-01T00:00:00.000Z" }).status, "cv_analysis_failed");
  assert.equal(getCandidateCvAnalysisState({ cv_url: "candidates/id/cv/file.pdf", cv_text: "", embedding_vector: "" }).status, "cv_processing");
});

test("does not recognize an empty server CV", () => {
  assert.equal(hasCandidateCv({ cv_url: null, cv_text: null, embedding_vector: null }), false);
  assert.equal(getCandidateCvAnalysisState({ cv_url: null, cv_text: null, embedding_vector: null }).status, "no_cv");
});

test("does not recognize stale extracted data without a server file", () => {
  assert.equal(hasCandidateCv({ cv_url: null, cv_text: "Ancien CV", embedding_vector: "[0.1]" }), false);
  assert.equal(hasAnalyzableCandidateCv({ cv_url: null, cv_text: "Ancien CV", embedding_vector: "[0.1]" }), false);
  assert.equal(getCandidateCvAnalysisState({ cv_url: null, cv_text: "Ancien CV", embedding_vector: "[0.1]" }).status, "no_cv");
});
