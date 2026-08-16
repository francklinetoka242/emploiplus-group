/**
 * Period Comparison Display Component
 * Shows comparison metrics with change indicators
 */

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { PeriodComparison } from "@/features/admin/types/analytics";

interface PeriodComparisonDisplayProps {
  comparison: PeriodComparison | null;
  label: string;
}

export function PeriodComparisonDisplay({ comparison, label }: PeriodComparisonDisplayProps) {
  if (!comparison) return null;

  const { current, previous, change, changePercent, isPositive } = comparison;

  const formatPercentage = () => {
    if (changePercent === null) {
      if (previous === 0 && current > 0) {
        return "Nouveau volume";
      }
      if (previous === 0 && current === 0) {
        return "Aucune variation";
      }
      return "—";
    }
    return `${changePercent > 0 ? "+" : ""}${changePercent}%`;
  };

  return (
    <div className="mt-2 text-xs text-muted-foreground space-y-1">
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-3 w-3 text-green-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-500" />
        )}
        <span>
          {change >= 0 ? "+" : ""}{change} ({formatPercentage()}) vs période précédente
        </span>
      </div>
      <div>Période précédente: {previous.toLocaleString()}</div>
    </div>
  );
}
