/**
 * AnalyticsContractChart Component
 * Display applications by contract type
 */

import React from "react";
import { Card } from "@/components/ui/card";
import type { ContractAnalytics } from "@/features/admin/types/analytics";

interface AnalyticsContractChartProps {
  contracts: ContractAnalytics[];
}

const formatContractType = (value: string): string => {
  const labels: Record<string, string> = {
    cdi: "CDI",
    cdd: "CDD",
    stage: "Stage",
    freelance: "Freelance",
    prestation_de_services: "Prestation de services",
    consultance: "Consultance",
    temps_partiel: "Temps partiel",
    interim: "Intérim",
  };
  return labels[value] || value;
};

export function AnalyticsContractChart({ contracts }: AnalyticsContractChartProps) {
  if (contracts.length === 0) return null;

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-cyan-500",
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Distribution par Type de Contrat</h3>
      <div className="space-y-3">
        {contracts.map((contract, index) => (
          <div key={contract.contractType} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{formatContractType(contract.contractType)}</span>
              <span className="text-sm text-muted-foreground">
                {contract.count} ({contract.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${colors[index % colors.length]}`}
                style={{ width: `${contract.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
