export interface AsyncMetric<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export type RecommendedStatus =
  "no_cv" | "cv_processing" | "cv_analysis_failed" | "success" | "no_results" | "error";
