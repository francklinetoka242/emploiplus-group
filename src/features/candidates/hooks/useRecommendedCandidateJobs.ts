import { useCallback, useEffect, useState } from "react";
import {
  getCandidateCvAnalysisState,
  hasAnalyzableCandidateCv,
  hasCandidateCv,
} from "@/features/candidates/api/cvApi";
import type { CandidateProfile } from "@/features/candidates/types";
import type { RecommendedStatus } from "@/features/candidates/dashboard/dashboardTypes";
import { getRecommendedJobsWithStatus, type RecommendedJob } from "@/services/aiMatchingService";

const PAGE_SIZE = 3;

interface UseRecommendedCandidateJobsInput {
  profile: CandidateProfile | null;
  profileReady: boolean;
  profileError: string | null;
}

export function useRecommendedCandidateJobs({
  profile,
  profileReady,
  profileError,
}: UseRecommendedCandidateJobsInput) {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RecommendedStatus>("no_cv");
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);

  const retry = useCallback(() => setRefreshToken((token) => token + 1), []);
  const changePage = useCallback((nextPage: number) => setPage(nextPage), []);

  useEffect(() => {
    if (profileError) {
      setStatus("error");
      setError(profileError);
      setJobs([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (!profileReady) {
      setStatus("cv_processing");
      setLoading(true);
      return;
    }

    if (!profile?.id) {
      setStatus("no_cv");
      setError(null);
      setJobs([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    const cvState = getCandidateCvAnalysisState(profile);
    if (!hasCandidateCv(profile)) {
      setStatus("no_cv");
      setError(null);
      setJobs([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    if (!hasAnalyzableCandidateCv(profile)) {
      setStatus(cvState.status === "cv_processing" ? "cv_processing" : "cv_analysis_failed");
      setError(null);
      setJobs([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    void getRecommendedJobsWithStatus(profile.id, 0, PAGE_SIZE, (page - 1) * PAGE_SIZE)
      .then((result) => {
        if (!active) return;
        setStatus(result.status);
        setError(result.error ?? null);
        setJobs(result.jobs ?? []);
        setHasMore(result.status === "success" && (result.jobs?.length ?? 0) === PAGE_SIZE);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les recommandations.";
        console.error("Unable to load recommended jobs:", loadError, { candidateId: profile.id });
        setStatus("error");
        setError(message);
        setJobs([]);
        setHasMore(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    profile?.id,
    profile?.cv_text,
    profile?.embedding_vector,
    profile?.cv_last_updated_at,
    profile,
    profileReady,
    profileError,
    page,
    refreshToken,
  ]);

  useEffect(() => {
    setPage(1);
  }, [profile?.id, profile?.cv_text, profile?.embedding_vector]);

  return { jobs, loading, status, error, hasMore, page, changePage, retry };
}
