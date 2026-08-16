/**
 * AnalyticsCompanyChart Component
 * Display applications by company
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanyAnalytics } from "@/features/admin/types/analytics";

interface AnalyticsCompanyChartProps {
  companies: CompanyAnalytics[];
}

export function AnalyticsCompanyChart({ companies }: AnalyticsCompanyChartProps) {
  if (companies.length === 0) return null;

  // Sort by application count
  const sorted = [...companies].sort(
    (a, b) => b.applicationCount - a.applicationCount
  );
  const maxApplications = Math.max(...sorted.map((c) => c.applicationCount), 1);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Top Entreprises</h3>
      <div className="space-y-3">
        {sorted.slice(0, 10).map((company) => (
          <div key={company.company} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{company.company}</span>
              <Badge variant="outline">{company.applicationCount}</Badge>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${(company.applicationCount / maxApplications) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {company.offerCount} offre(s) • {company.avgApplicationsPerOffer.toFixed(1)} moy.
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
