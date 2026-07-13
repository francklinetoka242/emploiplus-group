import { useCallback, useEffect, useMemo, useState } from "react";
import { jobService } from "@/features/jobs/api";
import type { JobOffer, JobOfferFilters } from "@/features/jobs/types";

function shouldUsePublishedOffers(filters?: JobOfferFilters) {
  if (!filters) return true;
  return (
    !filters.query &&
    !filters.company &&
    !filters.location &&
    !filters.contractType &&
    filters.status === "published"
  );
}

export function useJobs(filters?: JobOfferFilters) {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const serializedFilters = useMemo(
    () =>
      JSON.stringify({
        query: filters?.query,
        company: filters?.company,
        location: filters?.location,
        contractType: filters?.contractType,
        status: filters?.status,
        limit: filters?.limit,
        orderBy: filters?.orderBy,
        order: filters?.order,
      }),
    [
      filters?.query,
      filters?.company,
      filters?.location,
      filters?.contractType,
      filters?.status,
      filters?.limit,
      filters?.orderBy,
      filters?.order,
    ],
  );

  const loadOffers = useCallback(async (overrideFilters?: JobOfferFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = shouldUsePublishedOffers(overrideFilters)
        ? await jobService.getPublishedOffers(overrideFilters?.limit ?? 10)
        : await jobService.searchOffers(overrideFilters ?? {});
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des offres.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffers(filters);
  }, [loadOffers, serializedFilters]);

  return {
    offers,
    loading,
    error,
    refresh: () => loadOffers(filters),
  };
}
