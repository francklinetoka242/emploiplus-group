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
      className="relative isolate grid min-w-0 grid-cols-1 items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-700 p-5 text-white sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900"
      aria-labelledby="candidate-dashboard-welcome"
    >
      <svg
        viewBox="0 0 500 260"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[70%] opacity-20"
        aria-hidden="true"
      >
        <circle cx="420" cy="20" r="120" fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx="420" cy="20" r="82" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M220 260 500 0M300 260 500 80M390 260 500 160" stroke="white" strokeWidth="1" />
      </svg>
      <div className="relative min-w-0">
        <p className="text-sm font-medium tracking-wide text-white/75">
          {getGreeting(new Date().getHours())}
        </p>
        <h1
          id="candidate-dashboard-welcome"
          className="mt-1 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          {firstName}
        </h1>
        <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-white/90 sm:text-sm">
          <DashboardIcon name="CalendarDots" size={17} />
          <span>{today}</span>
        </p>
        <DashboardWelcomeMessage
          deadlineDays={deadlineDays}
          inProgressApplications={inProgressApplications}
          applicationCount={applicationCount}
          recommendedCount={recommendedCount}
        />
      </div>
      <DashboardProfileCompletion completion={completion} animate={animate} />
    </motion.section>
  );
}
