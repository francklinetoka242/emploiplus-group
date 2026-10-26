import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ProfileCompletionResult } from "@/features/profile/types";
import { DashboardIcon } from "./DashboardIcon";

interface DashboardProfileCompletionProps {
  completion: ProfileCompletionResult;
  animate: boolean;
}

export function DashboardProfileCompletion({
  completion,
  animate,
}: DashboardProfileCompletionProps) {
  const percentage = completion.completionPercentage;
  const missingItem = completion.completionItems.find((item) => !item.isCompleted);
  const completedCount = completion.completionItems.filter((item) => item.isCompleted).length;
  const totalCount = completion.completionItems.length;
  const circumference = 2 * Math.PI * 30;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative flex w-full min-w-0 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-5 md:w-auto md:min-w-[270px]">
      <div
        role="progressbar"
        aria-label="Complétude du profil"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${percentage} %`}
        className="relative size-[76px] shrink-0"
      >
        <svg className="size-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/25"
          />
          <motion.circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset: offset }}
            transition={animate ? { duration: 0.65, ease: "easeOut" } : { duration: 0 }}
            className="text-white"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-white">
          {percentage}%
        </span>
        {percentage === 100 && (
          <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-950 ring-2 ring-blue-800">
            <DashboardIcon name="CheckCircle" size={17} weight="fill" />
          </span>
        )}
      </div>
      <div className="min-w-0 text-sm">
        {percentage === 100 ? (
          <>
            <p className="font-semibold text-white">Profil complet</p>
            {totalCount > 0 && (
              <p className="mt-0.5 text-xs text-white/75">
                {completedCount} sur {totalCount} critères
              </p>
            )}
            <p className="mt-1 text-white/85">Bravo, votre profil est complet.</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-white">Profil complété à {percentage} %</p>
            {missingItem && (
              <Link
                to={missingItem.route}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Compléter
                <DashboardIcon name="ArrowRight" size={15} />
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
