import { useCallback, useEffect, useMemo, useState } from "react";
import { startOfWeek, subWeeks } from "date-fns";
import { useCandidateProfileData } from "@/features/candidates/hooks/useCandidateProfileData";
import {
  getCandidateApplicationsForStatusBreakdown,
  getCandidateApplicationsSince,
  type CandidateApplicationActivity,
} from "@/features/candidates/api/applicationsApi";
import { getCandidateSavedOffers } from "@/features/candidates/api/savedOffersApi";
import { useNotifications } from "@/hooks/useNotifications";
import { fetchLocalGuides } from "@/features/local-guides/localGuideService";
import type { LocalGuideRecord } from "@/features/local-guides/types";
import { useRecommendedCandidateJobs } from "./useRecommendedCandidateJobs";

export interface DashboardSavedOffer {
  id: string;
  saved_at: string;
  job_offer_id: string;
  job_offers: {
    id: string;
    slug: string;
    title: string;
    company: string;
    deadline: string | null;
    expires_at: string | null;
    status: string | null;
  } | null;
}

interface AsyncSource<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isDashboardSavedOffer(value: unknown): value is DashboardSavedOffer {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.saved_at !== "string" ||
    typeof value.job_offer_id !== "string"
  ) {
    return false;
  }

  const job = value.job_offers;
  if (job === null) return true;
  return (
    isRecord(job) &&
    typeof job.id === "string" &&
    typeof job.slug === "string" &&
    typeof job.title === "string" &&
    typeof job.company === "string" &&
    isNullableString(job.deadline) &&
    isNullableString(job.expires_at) &&
    isNullableString(job.status)
  );
}

export function useCandidateDashboardData() {
  const profileData = useCandidateProfileData();
  const { profile, candidateId } = profileData;
  const notificationState = useNotifications();
  const recommendations = useRecommendedCandidateJobs({
    profile,
    profileReady: profileData.isReady,
    profileError: profileData.error,
  });

  const [applications, setApplications] = useState<AsyncSource<CandidateApplicationActivity[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [allApplications, setAllApplications] = useState<
    AsyncSource<CandidateApplicationActivity[]>
  >({
    data: [],
    loading: true,
    error: null,
  });
  const [savedOffers, setSavedOffers] = useState<AsyncSource<DashboardSavedOffer[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [guides, setGuides] = useState<AsyncSource<LocalGuideRecord[]>>({
    data: [],
    loading: true,
    error: null,
  });

  const reloadApplications = useCallback(async () => {
    if (!candidateId) return;
    const since = startOfWeek(subWeeks(new Date(), 7), { weekStartsOn: 1 });
    setApplications((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await getCandidateApplicationsSince(candidateId, since);
      setApplications({ data, loading: false, error: null });
    } catch (error) {
      setApplications((current) => ({
        ...current,
        loading: false,
        error: getErrorMessage(error, "Impossible de charger l’activité des candidatures."),
      }));
    }
  }, [candidateId]);

  const reloadAllApplications = useCallback(async () => {
    if (!candidateId) return;
    setAllApplications((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await getCandidateApplicationsForStatusBreakdown(candidateId);
      setAllApplications({ data, loading: false, error: null });
    } catch (error) {
      setAllApplications((current) => ({
        ...current,
        loading: false,
        error: getErrorMessage(error, "Impossible de charger la répartition des candidatures."),
      }));
    }
  }, [candidateId]);

  const reloadSavedOffers = useCallback(async () => {
    if (!candidateId) return;
    setSavedOffers((current) => ({ ...current, loading: true, error: null }));
    try {
      const response: unknown = await getCandidateSavedOffers(candidateId);
      if (!Array.isArray(response) || !response.every(isDashboardSavedOffer)) {
        throw new Error("Les offres enregistrées ont un format inattendu.");
      }
      const data: DashboardSavedOffer[] = response;
      setSavedOffers({ data, loading: false, error: null });
    } catch (error) {
      setSavedOffers((current) => ({
        ...current,
        loading: false,
        error: getErrorMessage(error, "Impossible de charger les offres enregistrées."),
      }));
    }
  }, [candidateId]);

  const reloadGuides = useCallback(async () => {
    setGuides((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await fetchLocalGuides({ visibleOnly: true });
      setGuides({ data, loading: false, error: null });
    } catch (error) {
      setGuides((current) => ({
        ...current,
        loading: false,
        error: getErrorMessage(error, "Impossible de charger les fiches conseils."),
      }));
    }
  }, []);

  useEffect(() => {
    if (!candidateId) return;
    void reloadApplications();
    void reloadAllApplications();
    void reloadSavedOffers();
  }, [candidateId, reloadApplications, reloadAllApplications, reloadSavedOffers]);

  useEffect(() => {
    void reloadGuides();
  }, [reloadGuides]);

  const notifications = useMemo(
    () => ({
      count: notificationState.unreadCount,
      loading: notificationState.loading,
      error: notificationState.error,
      refetch: notificationState.refetch,
    }),
    [
      notificationState.unreadCount,
      notificationState.loading,
      notificationState.error,
      notificationState.refetch,
    ],
  );

  return {
    ...profileData,
    applications,
    allApplications,
    savedOffers,
    notifications,
    recommendations,
    guides,
    reloadApplications,
    reloadAllApplications,
    reloadSavedOffers,
    reloadNotifications: notificationState.refetch,
    reloadGuides,
    firstName: profile?.first_name?.trim() || "Candidat",
  };
}
