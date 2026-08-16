/**
 * AnalyticsExport Component
 * Dialog for exporting analytics data
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, X } from "lucide-react";
import type { AnalyticsFilter } from "@/features/admin/types/analytics";
import type { UseAnalyticsOffresHook } from "@/features/admin/hooks/useAnalyticsOffres";

interface AnalyticsExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UseAnalyticsOffresHook;
  filter: AnalyticsFilter;
}

export function AnalyticsExport({
  open,
  onOpenChange,
  data,
  filter,
}: AnalyticsExportProps) {
  if (!open) return null;

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Total Applications",
      "Unique Candidates",
      "Published Offers",
    ];
    const rows = [headers.join(",")];

    // Add summary row
    rows.push(
      [
        new Date().toLocaleDateString(),
        data.totalApplications,
        data.uniqueCandidates,
        data.publishedOffers,
      ].join(",")
    );

    const csv = rows.join("\n");
    downloadFile(csv, `analytics-${Date.now()}.csv`, "text/csv");
  };

  const exportToJSON = () => {
    const json = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        filters: filter,
        summary: {
          totalApplications: data.totalApplications,
          uniqueCandidates: data.uniqueCandidates,
          publishedOffers: data.publishedOffers,
        },
        trends: data.applicationsTrend,
        companies: data.companyAnalytics,
        contracts: data.contractAnalytics,
        locations: data.locationAnalytics,
        statuses: data.statusAnalytics,
        offers: data.offerAnalytics,
      },
      null,
      2
    );
    downloadFile(json, `analytics-${Date.now()}.json`, "application/json");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-semibold">Exporter les données</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={exportToCSV}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exporter en CSV
          </Button>

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={exportToJSON}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exporter en JSON
          </Button>

          <p className="text-xs text-muted-foreground pt-2">
            Les données seront exportées avec les filtres appliqués.
          </p>
        </div>

        <div className="flex gap-2 p-6 border-t">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </Card>
    </div>
  );
}
