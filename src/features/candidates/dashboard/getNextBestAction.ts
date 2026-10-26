import type { ProfileCompletionResult } from "@/features/profile/types";

const CV_STALE_AFTER_MS = 180 * 24 * 60 * 60 * 1000;
const DEADLINE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type NextBestActionId =
  | "complete-profile"
  | "upload-cv"
  | "update-cv"
  | "upcoming-deadline"
  | "recommended-jobs"
  | "maelise";

export type NextBestActionIcon =
  "UserCircle" | "FileText" | "CalendarDots" | "Briefcase" | "ChatCircleDots";

export interface NextBestAction {
  id: NextBestActionId;
  title: string;
  description: string;
  href: string | null;
  icon: NextBestActionIcon;
}

export interface GetNextBestActionInput {
  profileCompletion: Pick<
    ProfileCompletionResult,
    "completionPercentage" | "missingItems" | "completionItems"
  >;
  profile: {
    cv_url?: string | null;
    cv_last_updated_at?: string | null;
  } | null;
  urgentDeadline?: string | null;
  recommendedJobsCount: number;
  assistantAvailable: boolean;
  now?: Date;
}

export function getNextBestAction(input: GetNextBestActionInput): NextBestAction | null {
  const {
    profileCompletion,
    profile,
    urgentDeadline,
    recommendedJobsCount,
    assistantAvailable,
    now = new Date(),
  } = input;

  if (profileCompletion.completionPercentage < 100) {
    const firstMissingItem = profileCompletion.completionItems.find((item) => !item.isCompleted);
    return {
      id: "complete-profile",
      title: "Complétez votre profil",
      description: firstMissingItem
        ? `Ajoutez ${firstMissingItem.label.toLocaleLowerCase("fr-FR")} pour renforcer votre profil.`
        : "Ajoutez les informations manquantes pour renforcer votre profil.",
      href: firstMissingItem?.route ?? "/candidate/profile",
      icon: "UserCircle",
    };
  }

  if (!profile?.cv_url?.trim()) {
    return {
      id: "upload-cv",
      title: "Ajoutez votre CV",
      description: "Votre CV permet de personnaliser vos recommandations d’offres.",
      href: "/candidate/documents",
      icon: "FileText",
    };
  }

  const cvLastUpdatedAt = profile?.cv_last_updated_at
    ? new Date(profile.cv_last_updated_at).getTime()
    : Number.NaN;
  if (Number.isFinite(cvLastUpdatedAt) && now.getTime() - cvLastUpdatedAt > CV_STALE_AFTER_MS) {
    return {
      id: "update-cv",
      title: "Mettez à jour votre CV",
      description: "Un CV à jour améliore la pertinence de vos recommandations.",
      href: "/candidate/profile?tab=documents",
      icon: "FileText",
    };
  }

  const deadlineTime = urgentDeadline ? new Date(urgentDeadline).getTime() : Number.NaN;
  if (
    Number.isFinite(deadlineTime) &&
    deadlineTime > now.getTime() &&
    deadlineTime <= now.getTime() + DEADLINE_WINDOW_MS
  ) {
    return {
      id: "upcoming-deadline",
      title: "Une échéance approche",
      description: "Consultez les offres enregistrées dont la date limite approche.",
      href: "/candidate/saved-jobs",
      icon: "CalendarDots",
    };
  }

  if (recommendedJobsCount > 0) {
    return {
      id: "recommended-jobs",
      title: "Découvrez vos recommandations",
      description: "Consultez les offres sélectionnées selon votre profil.",
      href: "#recommended-jobs",
      icon: "Briefcase",
    };
  }

  if (assistantAvailable) {
    return {
      id: "maelise",
      title: "Échangez avec Maelise",
      description: "Posez une question sur votre recherche d’emploi.",
      href: null,
      icon: "ChatCircleDots",
    };
  }

  return null;
}
