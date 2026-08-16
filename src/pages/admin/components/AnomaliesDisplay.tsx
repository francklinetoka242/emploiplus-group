/**
 * Anomalies Display Component
 * Shows detected anomalies and points to watch
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { Anomaly } from "@/features/admin/utils/anomalyDetection";

interface AnomaliesDisplayProps {
  anomalies: Anomaly[];
}

export function AnomaliesDisplay({ anomalies }: AnomaliesDisplayProps) {
  if (anomalies.length === 0) {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Tout va bien</h3>
            <p className="text-sm text-green-800 mt-1">Aucune anomalie détectée. Les performances sont stables.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Points à surveiller</h3>
      {anomalies.map((anomaly, idx) => {
        const Icon = anomaly.severity === "critical" ? AlertTriangle : AlertCircle;
        const bgColor = anomaly.severity === "critical" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200";
        const textColor = anomaly.severity === "critical" ? "text-red-900" : "text-yellow-900";
        const subTextColor = anomaly.severity === "critical" ? "text-red-800" : "text-yellow-800";

        return (
          <Card key={idx} className={`p-3 border ${bgColor}`}>
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 ${textColor} mt-0.5`} />
              <div className="flex-1">
                <p className={`font-medium text-sm ${textColor}`}>{anomaly.title}</p>
                <p className={`text-xs ${subTextColor} mt-1`}>{anomaly.description}</p>
                {anomaly.value !== undefined && anomaly.threshold !== undefined && (
                  <div className={`text-xs ${subTextColor} mt-2`}>
                    Valeur: {anomaly.value} | Seuil: {anomaly.threshold}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
