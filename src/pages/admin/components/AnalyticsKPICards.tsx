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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.label}
            className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900/80 via-slate-500 to-slate-300" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  {kpi.value.toLocaleString()}
                </p>
                {kpi.comparison && (
                  <div className="mt-3">
                    <PeriodComparisonDisplay comparison={kpi.comparison} label={kpi.label} />
                  </div>
                )}
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
