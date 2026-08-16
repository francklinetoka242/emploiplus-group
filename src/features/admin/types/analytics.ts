/**
 * Analytics-Offres Types
 * Types for job offers and applications analytics
 */

export type DatePreset =
  | "today"
  | "7days"
  | "thisweek"
  | "30days"
  | "thismonth"
  | "3months"
  | "6months"
  | "thisyear"
  | "lastyear"
  | "custom";

export interface AnalyticsFilter {
  dateFrom: Date | null;
  dateTo: Date | null;
  preset?: DatePreset;
  company: string | null;
  jobOfferId: string | null;
  contractType: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  applicationStatus: string | null;
}

export interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number | null;
  isPositive: boolean;
}

export interface KPIMetric {
  label: string;
  value: number | string;
  change?: number;
  changePercent?: number;
  period?: string;
}

export interface ApplicationTrend {
  date: string;
  applications: number;
  uniqueCandidates: number;
}

export interface OfferAnalytics {
  offerId: string;
  title: string;
  company: string;
  contractType: string | null;
  locationCity: string | null;
  publishAt: string;
  deadline: string | null;
  applicationCount: number;
  uniqueCandidates: number;
  status: string;
  viewsCount: number;
}

export interface CompanyAnalytics {
  company: string;
  offerCount: number;
  applicationCount: number;
  uniqueCandidates: number;
  avgApplicationsPerOffer: number;
}

export interface ContractAnalytics {
  contractType: string;
  count: number;
  percentage: number;
  uniqueCandidates: number;
}

export interface LocationAnalytics {
  city: string | null;
  country: string | null;
  applicationCount: number;
  uniqueCandidates: number;
  offerCount: number;
}

export interface ApplicationStatusAnalytics {
  status: string;
  count: number;
  percentage: number;
}

export interface AttentionPoint {
  type: "no-applications" | "low-activity" | "high-activity";
  offerId: string;
  title: string;
  company: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export interface ApplicationsDetail {
  id: string;
  candidateId: string;
  jobOfferId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  contractType: string | null;
  locationCity: string | null;
}
