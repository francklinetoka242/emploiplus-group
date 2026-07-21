import { useMemo } from "react";
import type { ProfileCompletionResult, CandidateProfileSummary } from "../types";

export function useProfileCompletion(summary: CandidateProfileSummary): ProfileCompletionResult {
  return useMemo(() => {
    const hasText = (value?: string | null) => typeof value === "string" && value.trim().length > 0;
    const hasItems = <T,>(items?: T[] | null) => Array.isArray(items) && items.length > 0;
    const hasPreferences = (preferences: CandidateProfileSummary["preferences"]) => {
      if (!preferences) return false;

      return Boolean(
        hasText(preferences.seniority_level) ||
          hasItems(preferences.contract_types) ||
          hasItems(preferences.work_types) ||
          typeof preferences.salary_min === "number" ||
          typeof preferences.salary_max === "number",
      );
    };

    // Define all completion items with their completion status
    const completionItems = [
      {
        label: "Nom complet",
        isCompleted: hasText(summary.profile?.first_name) && hasText(summary.profile?.last_name),
      },
      {
        label: "Titre professionnel",
        isCompleted: hasText(summary.profile?.headline),
      },
      {
        label: "Localisation",
        isCompleted: hasText(summary.profile?.location_city) && hasText(summary.profile?.location_country),
      },
      {
        label: "Résumé professionnel",
        isCompleted: hasText(summary.profile?.bio),
      },
      {
        label: "Photo de profil",
        isCompleted: hasText(summary.profile?.avatar_url),
      },
      {
        label: "Expérience professionnelle",
        isCompleted: hasItems(summary.experiences),
      },
      {
        label: "Formation",
        isCompleted: hasItems(summary.educations),
      },
      {
        label: "Compétence",
        isCompleted: hasItems(summary.skills),
      },
      {
        label: "Langue",
        isCompleted: hasItems(summary.languages),
      },
      {
        label: "Préférences RH",
        isCompleted: hasPreferences(summary.preferences),
      },
    ];

    // Calculate missing items for backward compatibility
    const missingItems = completionItems
      .filter(item => !item.isCompleted)
      .map(item => item.label);

    const totalItems = completionItems.length;
    const completedCount = completionItems.filter(item => item.isCompleted).length;
    const completionPercentage = Math.round((completedCount / totalItems) * 100);

    return {
      completionPercentage: Math.max(0, Math.min(100, completionPercentage)),
      missingItems,
      completionItems,
    };
  }, [summary]);
}
