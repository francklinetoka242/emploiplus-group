/**
 * AnalyticsTrendChart Component
 * Display application trends over time
 */

import React from "react";
import { Card } from "@/components/ui/card";
import type { ApplicationTrend } from "@/features/admin/types/analytics";

interface AnalyticsTrendChartProps {
  trends: ApplicationTrend[];
}

export function AnalyticsTrendChart({ trends }: AnalyticsTrendChartProps) {
  if (trends.length === 0) return null;

  // Calculate max for scaling
  const maxApplications = Math.max(...trends.map((t) => t.applications), 1);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Tendance des candidatures</h3>
      <div className="space-y-2">
        {trends.map((trend) => (
          <div key={trend.date} className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">{trend.date}</span>
            <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{
                  width: `${(trend.applications / maxApplications) * 100}%`,
                }}
              />
            </div>
            <span className="w-12 text-sm text-right">{trend.applications}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
