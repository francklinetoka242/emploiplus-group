import { DashboardIcon } from "./DashboardIcon";

interface DashboardWelcomeMessageProps {
  deadlineDays: number | null;
  inProgressApplications: number;
  applicationCount: number;
  recommendedCount: number;
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
}: DashboardWelcomeMessageProps): ContextMessage {
  if (deadlineDays !== null) {
    return {
      type: "deadline",
      label: "ÉCHÉANCE PROCHE",
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
      label: "EN COURS",
      prefix: "Vous avez ",
      highlight: `${inProgressApplications} candidature${inProgressApplications > 1 ? "s" : ""}`,
      suffix: " en cours.",
    };
  }
  if (applicationCount > 0) {
    return {
      type: "applications",
      label: "CANDIDATURES ENVOYÉES",
      prefix: "Vous avez ",
      highlight: `${applicationCount} candidature${applicationCount > 1 ? "s" : ""} envoyée${applicationCount > 1 ? "s" : ""}`,
      suffix: ".",
    };
  }
  if (recommendedCount > 0) {
    return {
      type: "recommendations",
      label: "POUR VOUS",
      prefix: "Des ",
      highlight: "offres recommandées",
      suffix: " sont disponibles selon votre profil.",
    };
  }
  return {
    type: "neutral",
    label: "VOTRE ESPACE",
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
    tone: "text-[color-mix(in_srgb,var(--secondary)_45%,white)]",
  },
  applications: { icon: "PaperPlaneTilt", tone: "text-white" },
  recommendations: { icon: "Sparkle", tone: "text-white" },
  neutral: { icon: "Sparkle", tone: "text-white" },
};

export function DashboardWelcomeMessage(props: DashboardWelcomeMessageProps) {
  const message = getContextMessage(props);
  const style = contextStyles[message.type];

  return (
    <div className="mt-4 rounded-xl border border-white/20 bg-white/10 p-4 sm:p-5">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-white/70">{message.label}</p>
      <div className="mt-2 flex min-w-0 items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 ${style.tone}`}
        >
          <DashboardIcon name={style.icon} size={21} />
        </span>
        <p className="min-w-0 text-sm leading-6 text-white/90">
          {message.prefix}
          <span className={`font-semibold ${style.tone}`}>{message.highlight}</span>
          {message.suffix}
        </p>
      </div>
    </div>
  );
}
