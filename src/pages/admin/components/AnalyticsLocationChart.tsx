/**
 * AnalyticsLocationChart Component
 * Display applications by location
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { LocationAnalytics } from "@/features/admin/types/analytics";

interface AnalyticsLocationChartProps {
  locations: LocationAnalytics[];
}

export function AnalyticsLocationChart({ locations }: AnalyticsLocationChartProps) {
  if (locations.length === 0) return null;

  // Sort by application count
  const sorted = [...locations].sort(
    (a, b) => b.applicationCount - a.applicationCount
  );
  const maxApplications = Math.max(...sorted.map((l) => l.applicationCount), 1);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Top Localisations</h3>
      <div className="space-y-3">
        {sorted.slice(0, 8).map((location) => {
          const displayLocation =
            location.city && location.country
              ? `${location.city}, ${location.country}`
              : location.city ||
                location.country ||
                "Non renseignée";

          return (
            <div key={displayLocation} className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate">{displayLocation}</span>
                <Badge variant="outline">{location.applicationCount}</Badge>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{
                    width: `${(location.applicationCount / maxApplications) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
