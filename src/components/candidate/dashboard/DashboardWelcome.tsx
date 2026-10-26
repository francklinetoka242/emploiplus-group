import { motion, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEcoMode } from "@/contexts/EcoModeContext";
import type { ProfileCompletionResult } from "@/features/profile/types";
import type { CandidateProfile } from "@/features/candidates/types";
import { DashboardIcon } from "./DashboardIcon";
import { DashboardProfileCompletion } from "./DashboardProfileCompletion";
import { DashboardWelcomeMessage } from "./DashboardWelcomeMessage";

interface DashboardWelcomeProps {
  profile: CandidateProfile | null;
  completion: ProfileCompletionResult;
  deadlineDays: number | null;
  inProgressApplications: number;
  applicationCount: number;
  recommendedCount: number;
  hideDeadlineMessage: boolean;
  hideRecommendationMessage: boolean;
}

function getGreeting(hour: number): string {
  return hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";
}

export function DashboardWelcome({
  profile,
  completion,
  deadlineDays,
  inProgressApplications,
  applicationCount,
  recommendedCount,
  hideDeadlineMessage,
  hideRecommendationMessage,
}: DashboardWelcomeProps) {
  const reduceMotion = useReducedMotion();
  const { isEcoMode } = useEcoMode();
  const animate = !reduceMotion && !isEcoMode;
  const firstName = profile?.first_name?.trim() || "Candidat";
  const formattedDate = format(new Date(), "EEEE d MMMM", { locale: fr });
  const today = formattedDate.charAt(0).toLocaleUpperCase("fr-FR") + formattedDate.slice(1);

  return (
    <motion.section
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={animate ? { duration: 0.25 } : { duration: 0 }}
      className="relative isolate grid min-h-48 min-w-0 grid-cols-1 items-center gap-5 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-blue-700 p-5 text-white sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] dark:from-blue-700 dark:to-blue-900"
      aria-labelledby="candidate-dashboard-welcome"
    >
      <svg
        viewBox="0 0 500 260"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[55%] opacity-[0.08]"
        aria-hidden="true"
      >
        <circle cx="420" cy="20" r="120" fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx="420" cy="20" r="82" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M220 260 500 0M300 260 500 80M390 260 500 160" stroke="white" strokeWidth="1" />
      </svg>
      <div className="relative min-w-0">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <p className="text-2xl font-medium tracking-tight text-white/85 sm:text-3xl">
            {getGreeting(new Date().getHours())}
          </p>
          <h1
            id="candidate-dashboard-welcome"
            className="break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            {firstName}
          </h1>
        </div>
        <p className="mt-2 inline-flex max-w-full items-center gap-2 text-xs text-white/75 sm:text-sm">
          <DashboardIcon name="CalendarDots" size={16} />
          <span>{today}</span>
        </p>
        <DashboardWelcomeMessage
          deadlineDays={deadlineDays}
          inProgressApplications={inProgressApplications}
          applicationCount={applicationCount}
          recommendedCount={recommendedCount}
          hideDeadline={hideDeadlineMessage}
          hideRecommendations={hideRecommendationMessage}
        />
      </div>
      <DashboardProfileCompletion completion={completion} animate={animate} />
    </motion.section>
  );
}
