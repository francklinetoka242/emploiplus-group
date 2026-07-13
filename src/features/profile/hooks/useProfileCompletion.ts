import { useMemo } from "react";
import type { ProfileCompletionResult, CandidateProfileSummary } from "../types";

export function useProfileCompletion(summary: CandidateProfileSummary): ProfileCompletionResult {
  return useMemo(() => {
    // Define all completion items with their completion status
    const completionItems = [
      {
        label: "Nom complet",
        isCompleted: Boolean(summary.profile?.first_name && summary.profile?.last_name),
      },
      {
        label: "Titre professionnel",
        isCompleted: Boolean(summary.profile?.headline),
      },
      {
        label: "Localisation",
        isCompleted: Boolean(summary.profile?.location_city && summary.profile?.location_country),
      },
      {
        label: "Résumé professionnel",
        isCompleted: Boolean(summary.profile?.bio),
      },
      {
        label: "Photo de profil",
        isCompleted: Boolean(summary.profile?.avatar_url),
      },
      {
        label: "Expérience professionnelle",
        isCompleted: summary.experiences.length > 0,
      },
      {
        label: "Formation",
        isCompleted: summary.educations.length > 0,
      },
      {
        label: "Compétence",
        isCompleted: summary.skills.length > 0,
      },
      {
        label: "Langue",
        isCompleted: summary.languages.length > 0,
      },
      {
        label: "Préférences RH",
        isCompleted: Boolean(summary.preferences),
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
