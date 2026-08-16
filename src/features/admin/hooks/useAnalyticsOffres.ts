/**
 * useAnalyticsOffres Hook
 * Manages analytics data fetching and filtering
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  AnalyticsFilter,
  DatePreset,
  KPIMetric,
  ApplicationTrend,
  OfferAnalytics,
  CompanyAnalytics,
  ContractAnalytics,
  LocationAnalytics,
  ApplicationStatusAnalytics,
  ApplicationsDetail,
  PeriodComparison,
} from "../types/analytics";
import * as analyticsApi from "../api/analyticsApi";
import { getDateRangeForPreset, getPreviousPeriod, calculateComparison } from "../utils/datePresets";
import { collectAnomalies } from "../utils/anomalyDetection";
import type { Anomaly } from "../utils/anomalyDetection";

interface UseAnalyticsOffresState {
  // KPI Metrics
  totalApplications: number;
  uniqueCandidates: number;
  publishedOffers: number;

  // Comparisons
  applicationComparison: PeriodComparison | null;
  candidateComparison: PeriodComparison | null;

  // Anomalies
  anomalies: Anomaly[];

  // Trends
  applicationsTrend: ApplicationTrend[];

  // Analytics by dimension
  offerAnalytics: OfferAnalytics[];
  offerAnalyticsTotal: number;
  companyAnalytics: CompanyAnalytics[];
  contractAnalytics: ContractAnalytics[];
  locationAnalytics: LocationAnalytics[];
  statusAnalytics: ApplicationStatusAnalytics[];

  // Details
  applicationsDetail: ApplicationsDetail[];
  applicationsDetailTotal: number;

  // State
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

interface UseAnalyticsOffresHook extends UseAnalyticsOffresState {
  fetchData: (filter: AnalyticsFilter) => Promise<void>;
  fetchOfferDetails: (
    filter: AnalyticsFilter,
    limit: number,
    offset: number
  ) => Promise<void>;
  fetchApplicationsDetails: (
    filter: AnalyticsFilter,
    limit: number,
    offset: number
  ) => Promise<void>;
}

export function useAnalyticsOffres(): UseAnalyticsOffresHook {
  const [state, setState] = useState<UseAnalyticsOffresState>({
    totalApplications: 0,
    uniqueCandidates: 0,
    publishedOffers: 0,
    applicationComparison: null,
    candidateComparison: null,
    anomalies: [],
    applicationsTrend: [],
    offerAnalytics: [],
    offerAnalyticsTotal: 0,
    companyAnalytics: [],
    contractAnalytics: [],
    locationAnalytics: [],
    statusAnalytics: [],
    applicationsDetail: [],
    applicationsDetailTotal: 0,
    loading: false,
    error: null,
    lastRefresh: null,
  });

  const fetchData = useCallback(
    async (filter: AnalyticsFilter) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        // Apply preset if provided
        let currentFilter = { ...filter };
        if (filter.preset && filter.preset !== "custom") {
          const range = getDateRangeForPreset(filter.preset);
          currentFilter = { ...currentFilter, dateFrom: range.from, dateTo: range.to };
        }

        // Fetch current period data
        const [
          totalApps,
          uniqueCands,
          publishedOffs,
          trends,
          byCompany,
          byContract,
          byLocation,
          byStatus,
        ] = await Promise.all([
          analyticsApi.getTotalApplications(currentFilter),
          analyticsApi.getUniqueCandidates(currentFilter),
          analyticsApi.getPublishedOffersCount(currentFilter),
          analyticsApi.getApplicationsTrend(currentFilter, "day"),
          analyticsApi.getApplicationsByCompany(currentFilter),
          analyticsApi.getApplicationsByContractType(currentFilter),
          analyticsApi.getApplicationsByLocation(currentFilter),
          analyticsApi.getApplicationsStatusBreakdown(currentFilter),
        ]);

        // Fetch previous period data for comparison (only for meaningful presets)
        let appComparison: PeriodComparison | null = null;
        let candComparison: PeriodComparison | null = null;

        if (currentFilter.preset && currentFilter.preset !== "today" && currentFilter.dateFrom && currentFilter.dateTo) {
          const prevPeriod = getPreviousPeriod(currentFilter.dateFrom, currentFilter.dateTo);
          const prevFilter = {
            ...currentFilter,
            dateFrom: prevPeriod.from,
            dateTo: prevPeriod.to,
          };

          try {
            const [prevApps, prevCands] = await Promise.all([
              analyticsApi.getTotalApplications(prevFilter),
              analyticsApi.getUniqueCandidates(prevFilter),
            ]);

            appComparison = {
              current: totalApps,
              previous: prevApps,
              ...calculateComparison(totalApps, prevApps),
            };

            candComparison = {
              current: uniqueCands,
              previous: prevCands,
              ...calculateComparison(uniqueCands, prevCands),
            };
          } catch (err) {
            console.warn("Failed to fetch previous period data", err);
          }
        }

        setState((prev) => ({
          ...prev,
          totalApplications: totalApps,
          uniqueCandidates: uniqueCands,
          publishedOffers: publishedOffs,
          applicationComparison: appComparison,
          candidateComparison: candComparison,
          applicationsTrend: trends,
          companyAnalytics: byCompany,
          contractAnalytics: byContract,
          locationAnalytics: byLocation,
          statusAnalytics: byStatus,
          anomalies: collectAnomalies([], byCompany, trends, totalApps),
          lastRefresh: new Date(),
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to load analytics data",
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    []
  );

  const fetchOfferDetails = useCallback(
    async (filter: AnalyticsFilter, limit: number, offset: number) => {
      try {
        const result = await analyticsApi.getApplicationsByOffer(filter, limit, offset);
        setState((prev) => ({
          ...prev,
          offerAnalytics: result.data,
          offerAnalyticsTotal: result.total,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to load offer details",
        }));
      }
    },
    []
  );

  const fetchApplicationsDetails = useCallback(
    async (filter: AnalyticsFilter, limit: number, offset: number) => {
      try {
        const result = await analyticsApi.getApplicationsDetails(filter, limit, offset);
        setState((prev) => ({
          ...prev,
          applicationsDetail: result.data,
          applicationsDetailTotal: result.total,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to load applications",
        }));
      }
    },
    []
  );

  return {
    ...state,
    fetchData,
    fetchOfferDetails,
    fetchApplicationsDetails,
  };
}
