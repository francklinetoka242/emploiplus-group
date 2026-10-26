import { DashboardIcon } from "./DashboardIcon";

interface DashboardWelcomeMessageProps {
  deadlineDays: number | null;
  inProgressApplications: number;
  applicationCount: number;
  recommendedCount: number;
  hideDeadline: boolean;
  hideRecommendations: boolean;
}

type ContextType = "deadline" | "applications" | "recommendations" | "neutral";

interface ContextMessage {
  type: ContextType;
  label: string;
  prefix: string;
  highlight: string;
  suffix: string;
}

function getContextMessage({
  deadlineDays,
  inProgressApplications,
  applicationCount,
  recommendedCount,
  hideDeadline,
  hideRecommendations,
}: DashboardWelcomeMessageProps): ContextMessage {
  if (deadlineDays !== null && !hideDeadline) {
    return {
      type: "deadline",
      label: "Échéance proche",
      prefix: "Une de vos offres enregistrées se termine ",
      highlight:
        deadlineDays === 0
          ? "aujourd’hui"
          : `dans ${deadlineDays} jour${deadlineDays > 1 ? "s" : ""}`,
      suffix: ".",
    };
  }
  if (inProgressApplications > 0) {
    return {
      type: "applications",
      label: "En cours",
      prefix: "Vous avez ",
      highlight: `${inProgressApplications} candidature${inProgressApplications > 1 ? "s" : ""}`,
      suffix: " en cours.",
    };
  }
  if (applicationCount > 0) {
    return {
      type: "applications",
      label: "Candidatures envoyées",
      prefix: "Vous avez ",
      highlight: `${applicationCount} candidature${applicationCount > 1 ? "s" : ""} envoyée${applicationCount > 1 ? "s" : ""}`,
      suffix: ".",
    };
  }
  if (recommendedCount > 0 && !hideRecommendations) {
    return {
      type: "recommendations",
      label: "Pour vous",
      prefix: "Des ",
      highlight: "offres recommandées",
      suffix: " sont disponibles selon votre profil.",
    };
  }
  return {
    type: "neutral",
    label: "Votre espace",
    prefix: "",
    highlight: "Retrouvez ici vos démarches et les offres adaptées à votre profil.",
    suffix: "",
  };
}

const contextStyles: Record<
  ContextType,
  { icon: "Hourglass" | "PaperPlaneTilt" | "Sparkle"; tone: string }
> = {
  deadline: {
    icon: "Hourglass",
    tone: "text-[#f5d76e]",
  },
  applications: { icon: "PaperPlaneTilt", tone: "text-white" },
  recommendations: { icon: "Sparkle", tone: "text-white" },
  neutral: { icon: "Sparkle", tone: "text-white" },
};

export function DashboardWelcomeMessage(props: DashboardWelcomeMessageProps) {
  const message = getContextMessage(props);
  const style = contextStyles[message.type];

  return (
    <div className="mt-4 flex min-w-0 items-start gap-2 text-sm leading-6 text-white/90">
      <DashboardIcon name={style.icon} size={18} className={`mt-1 shrink-0 ${style.tone}`} />
      <p className="min-w-0">
        {message.prefix}
        <span className={`font-semibold ${style.tone}`}>{message.highlight}</span>
        {message.suffix}
      </p>
    </div>
  );
}
