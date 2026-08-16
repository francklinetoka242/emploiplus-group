/**
 * Date Presets Selector Component
 * Provides quick selection of common date ranges
 */

import React from "react";
import { Button } from "@/components/ui/button";
import type { DatePreset } from "@/features/admin/types/analytics";

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Aujourd'hui", value: "today" },
  { label: "7 jours", value: "7days" },
  { label: "Cette semaine", value: "thisweek" },
  { label: "30 jours", value: "30days" },
  { label: "Ce mois", value: "thismonth" },
  { label: "3 mois", value: "3months" },
  { label: "6 mois", value: "6months" },
  { label: "Cette année", value: "thisyear" },
  { label: "Année précédente", value: "lastyear" },
  { label: "Personnalisée", value: "custom" },
];

interface DatePresetsProps {
  currentPreset?: string;
  onSelect: (preset: DatePreset) => void;
}

export function DatePresets({ currentPreset, onSelect }: DatePresetsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant={currentPreset === preset.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(preset.value)}
          className="text-xs"
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
