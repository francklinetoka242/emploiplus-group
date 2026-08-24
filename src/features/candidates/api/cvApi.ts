export interface CandidateCvSource {
  cv_url?: string | null;
  cv_text?: string | null;
  embedding_vector?: string | null;
  cv_last_updated_at?: string | null;
}

export type CandidateCvAnalysisStatus = "no_cv" | "cv_processing" | "cv_analysis_failed" | "ready";

export interface CandidateCvAnalysisState {
  status: CandidateCvAnalysisStatus;
  hasCv: boolean;
  hasCvText: boolean;
  hasEmbedding: boolean;
  hasAnalyzableCv: boolean;
}

export function hasCandidateCv(candidate: CandidateCvSource | null | undefined): boolean {
  return Boolean(candidate?.cv_url?.trim());
}

export function hasAnalyzableCandidateCv(candidate: CandidateCvSource | null | undefined): boolean {
  return Boolean(hasCandidateCv(candidate) && candidate?.cv_text?.trim() && candidate?.embedding_vector);
}

export function getCandidateCvAnalysisState(candidate: CandidateCvSource | null | undefined): CandidateCvAnalysisState {
  const hasCv = hasCandidateCv(candidate);
  const hasCvText = Boolean(candidate?.cv_text?.trim());
  const hasEmbedding = Boolean(candidate?.embedding_vector);
  const hasAnalyzableCv = hasCv && hasCvText && hasEmbedding;

  if (!hasCv) {
    return { status: "no_cv", hasCv: false, hasCvText: false, hasEmbedding: false, hasAnalyzableCv: false };
  }

  if (hasAnalyzableCv) {
    return { status: "ready", hasCv: true, hasCvText: true, hasEmbedding: true, hasAnalyzableCv: true };
  }

  if (!hasCvText && !hasEmbedding) {
    return {
      status: candidate?.cv_last_updated_at ? "cv_analysis_failed" : "cv_processing",
      hasCv: true,
      hasCvText: false,
      hasEmbedding: false,
      hasAnalyzableCv: false,
    };
  }

  return {
    status: "cv_analysis_failed",
    hasCv: true,
    hasCvText: hasCvText,
    hasEmbedding: hasEmbedding,
    hasAnalyzableCv: false,
  };
}
