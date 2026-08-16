/**
 * AnalyticsStatusChart Component
 * Display application status breakdown
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApplicationStatusAnalytics } from "@/features/admin/types/analytics";

interface AnalyticsStatusChartProps {
  statuses: ApplicationStatusAnalytics[];
}

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  reviewed: "bg-purple-100 text-purple-800",
  shortlisted: "bg-green-100 text-green-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

export function AnalyticsStatusChart({ statuses }: AnalyticsStatusChartProps) {
  if (statuses.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Statut des Candidatures</h3>
      <div className="space-y-3">
        {statuses.map((status) => (
          <div key={status.status} className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge className={statusColors[status.status] || "bg-gray-100 text-gray-800"}>
                {status.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {status.count} ({status.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${status.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
