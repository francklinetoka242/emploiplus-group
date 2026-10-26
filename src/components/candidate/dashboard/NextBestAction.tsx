import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import { useEcoMode } from "@/contexts/EcoModeContext";
import type { NextBestAction as NextBestActionModel } from "@/features/candidates/dashboard/getNextBestAction";
import { DashboardIcon } from "./DashboardIcon";
import { openMaelise } from "./openMaelise";

interface NextBestActionProps {
  action: NextBestActionModel | null;
}

export function NextBestAction({ action }: NextBestActionProps) {
  const reduceMotion = useReducedMotion();
  const { isEcoMode } = useEcoMode();
  const animate = !reduceMotion && !isEcoMode;

  function handleActionLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!action?.href?.includes("#")) return;

    const targetId = decodeURIComponent(action.href.split("#").pop() ?? "");
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    window.history.replaceState(window.history.state, "", action.href);
    target.scrollIntoView({ behavior: animate ? "smooth" : "auto", block: "start" });
  }

  return (
    <motion.section
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={animate ? { duration: 0.3, delay: 0.05 } : { duration: 0 }}
      className="border-y border-border py-5 sm:py-6"
      aria-labelledby="next-best-action-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Pour vous aujourd’hui</p>
          <h2
            id="next-best-action-heading"
            className="mt-1 text-lg font-medium leading-7 text-foreground sm:text-xl"
          >
            {action ? (
              <>
                {action.messagePrefix}
                {action.messageHighlight && (
                  <span
                    className={`font-semibold ${
                      action.id === "upcoming-deadline" ? "text-[#f5d76e]" : ""
                    }`}
                  >
                    {action.messageHighlight}
                  </span>
                )}
                {action.messageSuffix}
              </>
            ) : (
              "Vous êtes à jour. Poursuivez votre recherche à votre rythme."
            )}
          </h2>
        </div>
        {action?.href ? (
          <Link
            to={action.href}
            onClick={handleActionLinkClick}
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
          >
            {action.linkLabel}
            <DashboardIcon name="ArrowRight" size={16} />
          </Link>
        ) : action?.id === "maelise" ? (
          <button
            type="button"
            onClick={openMaelise}
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
          >
            {action.linkLabel}
            <DashboardIcon name="ArrowRight" size={16} />
          </button>
        ) : null}
      </div>
    </motion.section>
  );
}
