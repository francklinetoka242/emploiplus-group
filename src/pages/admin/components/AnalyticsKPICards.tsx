/**
 * AnalyticsKPICards Component
 * Display key performance indicators with comparison
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Briefcase, Activity } from "lucide-react";
import type { UseAnalyticsOffresHook } from "@/features/admin/hooks/useAnalyticsOffres";
import { PeriodComparisonDisplay } from "./PeriodComparisonDisplay";

interface AnalyticsKPICardsProps {
  analytics: UseAnalyticsOffresHook;
}

export function AnalyticsKPICards({ analytics }: AnalyticsKPICardsProps) {
  const kpis = [
    {
      label: "Candidatures totales",
      value: analytics.totalApplications,
      icon: Activity,
      color: "text-blue-500",
      comparison: analytics.applicationComparison,
    },
    {
      label: "Candidats uniques",
      value: analytics.uniqueCandidates,
      icon: Users,
      color: "text-green-500",
      comparison: analytics.candidateComparison,
    },
    {
      label: "Offres publiées",
      value: analytics.publishedOffers,
      icon: Briefcase,
      color: "text-purple-500",
      comparison: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold mt-2">{kpi.value.toLocaleString()}</p>
                {kpi.comparison && (
                  <PeriodComparisonDisplay comparison={kpi.comparison} label={kpi.label} />
                )}
              </div>
              <Icon className={`h-8 w-8 ${kpi.color} opacity-70`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
