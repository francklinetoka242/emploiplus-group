/**
 * Date Presets for Analytics-Offres
 * Helper functions to calculate date ranges for preset selections
 */

import type { DatePreset } from "../types/analytics";

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Get the date range for a given preset
 * Includes calculation of both current and previous period for comparison
 */
export function getDateRangeForPreset(preset: DatePreset): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (preset) {
    case "today": {
      return { from: today, to: tomorrow };
    }
    case "7days": {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      return { from, to: tomorrow };
    }
    case "thisweek": {
      const from = new Date(today);
      const day = from.getDay();
      from.setDate(from.getDate() - (day === 0 ? 6 : day - 1));
      return { from, to: tomorrow };
    }
    case "30days": {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { from, to: tomorrow };
    }
    case "thismonth": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from, to: tomorrow };
    }
    case "3months": {
      const from = new Date(today);
      from.setMonth(from.getMonth() - 3);
      return { from, to: tomorrow };
    }
    case "6months": {
      const from = new Date(today);
      from.setMonth(from.getMonth() - 6);
      return { from, to: tomorrow };
    }
    case "thisyear": {
      const from = new Date(today.getFullYear(), 0, 1);
      return { from, to: tomorrow };
    }
    case "lastyear": {
      const from = new Date(today.getFullYear() - 1, 0, 1);
      const to = new Date(today.getFullYear(), 0, 1);
      return { from, to };
    }
    case "custom":
    default: {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { from, to: tomorrow };
    }
  }
}

/**
 * Get the previous period matching the same duration as the current period
 */
export function getPreviousPeriod(currentFrom: Date, currentTo: Date): DateRange {
  const duration = currentTo.getTime() - currentFrom.getTime();
  const from = new Date(currentFrom.getTime() - duration);
  const to = new Date(currentFrom);
  return { from, to };
}

/**
 * Calculate comparison metrics between two periods
 * Special handling when previous = 0
 */
export function calculateComparison(
  current: number,
  previous: number,
): { change: number; changePercent: number | null; isPositive: boolean } {
  const change = current - previous;

  let changePercent: number | null = null;

  if (previous === 0) {
    // Cannot calculate percentage growth from 0
    // Set to null to indicate "no previous data"
    changePercent = null;
  } else {
    // Normal percentage calculation
    changePercent = Math.round(((change / previous) * 100) * 10) / 10;
  }

  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
}

/**
 * Format date range for display
 */
export function formatDateRangeLabel(from: Date, to: Date, preset?: DatePreset): string {
  const formatDate = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });

  if (preset === "today") return "Aujourd'hui";
  if (preset === "7days") return "7 derniers jours";
  if (preset === "thisweek") return "Cette semaine";
  if (preset === "30days") return "30 derniers jours";
  if (preset === "thismonth") return "Ce mois";
  if (preset === "3months") return "3 derniers mois";
  if (preset === "6months") return "6 derniers mois";
  if (preset === "thisyear") return "Cette année";
  if (preset === "lastyear") return "Année précédente";

  return `${formatDate(from)} au ${formatDate(to)}`;
}
