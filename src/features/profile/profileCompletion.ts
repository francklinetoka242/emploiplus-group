import type { ProfileCompletionResult, CandidateProfileSummary } from "./types";
import { hasCandidateCv } from "../candidates/api/cvApi.ts";

export function calculateProfileCompletion(summary: CandidateProfileSummary): ProfileCompletionResult {
  const hasText = (value?: string | null) => typeof value === "string" && value.trim().length > 0;
  const hasItems = <T,>(items?: T[] | null) => Array.isArray(items) && items.length > 0;
  const hasPreferences = (preferences: CandidateProfileSummary["preferences"]) => Boolean(
    preferences && (
      hasText(preferences.seniority_level) ||
      hasItems(preferences.contract_types) ||
      hasItems(preferences.work_types) ||
      typeof preferences.salary_min === "number" ||
      typeof preferences.salary_max === "number"
    ),
  );

  const completionItems = [
    { id: "full-name", label: "Nom complet", route: "/candidate/profile?tab=profile", weight: 1, isCompleted: hasText(summary.profile?.first_name) && hasText(summary.profile?.last_name) },
    { id: "professional-title", label: "Titre professionnel", route: "/candidate/profile?tab=profile", weight: 1, isCompleted: hasText(summary.profile?.headline) },
    { id: "location", label: "Localisation", route: "/candidate/profile?tab=profile", weight: 1, isCompleted: hasText(summary.profile?.location_city) && hasText(summary.profile?.location_country) },
    { id: "professional-summary", label: "Résumé professionnel", route: "/candidate/profile?tab=profile", weight: 1, isCompleted: hasText(summary.profile?.bio) },
    { id: "experience", label: "Expérience professionnelle", route: "/candidate/profile?tab=experience", weight: 1, isCompleted: hasItems(summary.experiences) },
    { id: "education", label: "Formation", route: "/candidate/profile?tab=education", weight: 1, isCompleted: hasItems(summary.educations) },
    { id: "skills", label: "Compétence", route: "/candidate/profile?tab=skills", weight: 1, isCompleted: hasItems(summary.skills) },
    { id: "languages", label: "Langue", route: "/candidate/profile?tab=languages", weight: 1, isCompleted: hasItems(summary.languages) },
    { id: "preferences", label: "Préférences RH", route: "/candidate/profile?tab=preferences", weight: 1, isCompleted: hasPreferences(summary.preferences) },
    { id: "cv", label: "CV", route: "/candidate/profile?tab=documents", weight: 1, isCompleted: hasCandidateCv(summary.profile) },
  ];

  const missingItems = completionItems.filter((item) => !item.isCompleted).map((item) => item.label);
  const totalWeight = completionItems.reduce((total, item) => total + item.weight, 0);
  const completedWeight = completionItems.reduce((total, item) => total + (item.isCompleted ? item.weight : 0), 0);

  return {
    completionPercentage: Math.max(0, Math.min(100, Math.round((completedWeight / totalWeight) * 100))),
    missingItems,
    completionItems,
  };
}
