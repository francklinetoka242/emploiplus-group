/**
 * Anomaly Detection for Analytics
 * Simple, rule-based anomaly detection based on real data
 */

import type { OfferAnalytics, CompanyAnalytics, ApplicationTrend } from "../types/analytics";

export interface Anomaly {
  type: "no-applications" | "low-activity" | "high-activity" | "declining-trend" | "low-performing-company";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  itemId?: string;
  itemName?: string;
  value?: number;
  threshold?: number;
}

/**
 * Detect offers with no applications
 */
export function detectOffersWithoutApplications(offers: OfferAnalytics[]): Anomaly[] {
  return offers
    .filter((offer) => offer.applicationCount === 0)
    .slice(0, 5)
    .map((offer) => ({
      type: "no-applications" as const,
      severity: "warning" as const,
      title: "Offre sans candidature",
      description: `L'offre "${offer.title}" publiée le ${new Date(offer.publishAt).toLocaleDateString("fr-FR")} n'a reçu aucune candidature.`,
      itemId: offer.offerId,
      itemName: offer.title,
    }));
}

/**
 * Detect unusually high or low activity
 */
export function detectActivityAnomalies(trends: ApplicationTrend[], baseline: number): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const avgApplications = baseline > 0 ? baseline : trends.reduce((sum, t) => sum + t.applications, 0) / Math.max(trends.length, 1);
  const threshold = avgApplications * 1.5;

  trends.forEach((trend) => {
    if (trend.applications > threshold) {
      anomalies.push({
        type: "high-activity",
        severity: "info",
        title: "Pic d'activité détecté",
        description: `Le ${trend.date} a enregistré ${trend.applications} candidatures, bien au-dessus de la moyenne (${Math.round(avgApplications)}).`,
        value: trend.applications,
        threshold: Math.round(threshold),
      });
    }
  });

  return anomalies;
}

/**
 * Detect declining trends
 */
export function detectDecliningTrend(trends: ApplicationTrend[]): Anomaly[] {
  if (trends.length < 2) return [];

  const recentTrends = trends.slice(-7);
  if (recentTrends.length < 2) return [];

  const avgOlder = recentTrends
    .slice(0, Math.floor(recentTrends.length / 2))
    .reduce((sum, t) => sum + t.applications, 0) / Math.ceil(recentTrends.length / 2);
  const avgRecent = recentTrends
    .slice(Math.ceil(recentTrends.length / 2))
    .reduce((sum, t) => sum + t.applications, 0) / Math.floor(recentTrends.length / 2);

  const declinePercent = avgOlder > 0 ? ((avgOlder - avgRecent) / avgOlder) * 100 : 0;

  if (declinePercent > 20) {
    return [
      {
        type: "declining-trend",
        severity: "warning",
        title: "Tendance à la baisse détectée",
        description: `Les candidatures ont baissé de ${Math.round(declinePercent)}% ces 7 derniers jours.`,
        value: Math.round(avgRecent),
        threshold: Math.round(avgOlder),
      },
    ];
  }

  return [];
}

/**
 * Detect low-performing companies
 */
export function detectLowPerformingCompanies(companies: CompanyAnalytics[], avgApplicationsPerOffer: number): Anomaly[] {
  return companies
    .filter((company) => company.avgApplicationsPerOffer < avgApplicationsPerOffer * 0.5)
    .slice(0, 3)
    .map((company) => ({
      type: "low-performing-company",
      severity: "info",
      title: "Entreprise avec faible attractivité",
      description: `L'entreprise "${company.company}" reçoit en moyenne ${company.avgApplicationsPerOffer.toFixed(1)} candidatures par offre, bien en dessous de la moyenne.`,
      itemName: company.company,
      value: Math.round(company.avgApplicationsPerOffer * 10) / 10,
      threshold: Math.round(avgApplicationsPerOffer * 10) / 10,
    }));
}

/**
 * Collect all anomalies
 */
export function collectAnomalies(
  offers: OfferAnalytics[],
  companies: CompanyAnalytics[],
  trends: ApplicationTrend[],
  totalApplications: number
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Offers without applications
  anomalies.push(...detectOffersWithoutApplications(offers));

  // Activity anomalies
  anomalies.push(...detectActivityAnomalies(trends, totalApplications));

  // Declining trends
  anomalies.push(...detectDecliningTrend(trends));

  // Low-performing companies
  const avgAppsPerOffer = offers.length > 0 ? offers.reduce((sum, o) => sum + o.applicationCount, 0) / offers.length : 0;
  anomalies.push(...detectLowPerformingCompanies(companies, avgAppsPerOffer));

  return anomalies;
}
