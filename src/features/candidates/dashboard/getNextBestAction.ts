import type { ProfileCompletionResult } from "@/features/profile/types";
import { differenceInCalendarDays } from "date-fns";
import { completionCriterionText } from "./completionCriterionText.ts";

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
  messagePrefix: string;
  messageHighlight?: string;
  messageSuffix: string;
  linkLabel: string;
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
  urgentOffer?: {
    title: string;
    company: string;
    href: string;
  } | null;
  recommendedJobsCount: number;
  assistantAvailable: boolean;
  now?: Date;
}

export function getNextBestAction(input: GetNextBestActionInput): NextBestAction | null {
  const {
    profileCompletion,
    profile,
    urgentDeadline,
    urgentOffer,
    recommendedJobsCount,
    assistantAvailable,
    now = new Date(),
  } = input;

  if (profileCompletion.completionPercentage < 100) {
    const firstMissingItem = profileCompletion.completionItems.find((item) => !item.isCompleted);
    const missingCriterion = firstMissingItem
      ? (completionCriterionText[firstMissingItem.id] ??
        firstMissingItem.label.toLocaleLowerCase("fr-FR"))
      : "une information de votre profil";
    return {
      id: "complete-profile",
      title: "Complétez votre profil",
      description: firstMissingItem
        ? `Ajoutez ${firstMissingItem.label.toLocaleLowerCase("fr-FR")} pour renforcer votre profil.`
        : "Ajoutez les informations manquantes pour renforcer votre profil.",
      href: firstMissingItem?.route ?? "/candidate/profile",
      icon: "UserCircle",
      messagePrefix: "Il vous manque ",
      messageHighlight: missingCriterion,
      messageSuffix: " pour compléter votre profil.",
      linkLabel: "Compléter mon profil",
    };
  }

  if (!profile?.cv_url?.trim()) {
    return {
      id: "upload-cv",
      title: "Ajoutez votre CV",
      description: "Votre CV permet de personnaliser vos recommandations d’offres.",
      href: "/candidate/documents",
      icon: "FileText",
      messagePrefix:
        "Votre CV n’est pas encore ajouté. Ajoutez-le pour recevoir des recommandations pertinentes.",
      messageSuffix: "",
      linkLabel: "Ajouter mon CV",
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
      messagePrefix:
        "Votre CV date de plus de 6 mois : une mise à jour améliorera vos recommandations.",
      messageSuffix: "",
      linkLabel: "Mettre à jour mon CV",
    };
  }

  const deadlineTime = urgentDeadline ? new Date(urgentDeadline).getTime() : Number.NaN;
  if (
    Number.isFinite(deadlineTime) &&
    deadlineTime > now.getTime() &&
    deadlineTime <= now.getTime() + DEADLINE_WINDOW_MS &&
    urgentOffer
  ) {
    const days = differenceInCalendarDays(new Date(deadlineTime), now);
    return {
      id: "upcoming-deadline",
      title: "Consultez cette offre avant son échéance",
      description: "",
      href: urgentOffer.href,
      icon: "CalendarDots",
      messagePrefix: `L’offre ${urgentOffer.title}${urgentOffer.company ? ` chez ${urgentOffer.company}` : ""} se termine `,
      messageHighlight: days === 0 ? "aujourd’hui" : `dans ${days} jour${days === 1 ? "" : "s"}`,
      messageSuffix: ".",
      linkLabel: "Voir l’offre",
    };
  }

  if (recommendedJobsCount > 0) {
    return {
      id: "recommended-jobs",
      title: "Des offres correspondent à votre profil",
      description: "",
      href: "#recommended-jobs",
      icon: "Briefcase",
      messagePrefix: `${recommendedJobsCount} offre${recommendedJobsCount === 1 ? "" : "s"} correspondent à votre profil.`,
      messageSuffix: "",
      linkLabel: "Voir mes recommandations",
    };
  }

  if (assistantAvailable) {
    return {
      id: "maelise",
      title: "Échangez avec Maelise",
      description: "Posez une question sur votre recherche d’emploi.",
      href: null,
      icon: "ChatCircleDots",
      messagePrefix: "Une question sur votre recherche ? Maelise peut vous répondre.",
      messageSuffix: "",
      linkLabel: "Ouvrir Maelise",
    };
  }

  return null;
}
