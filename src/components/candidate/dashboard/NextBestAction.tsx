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
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-1"
      aria-labelledby="next-best-action-heading"
    >
      <div className="flex flex-col gap-4 rounded-[calc(var(--radius)+7px)] bg-card/90 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <DashboardIcon name={action?.icon ?? "CheckCircle"} size={27} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Votre prochaine étape
            </p>
            <h2
              id="next-best-action-heading"
              className="mt-1 text-lg font-semibold text-foreground"
            >
              {action?.title ?? "Vous êtes à jour"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {action?.description ??
                "Aucune action urgente pour le moment. Vous pouvez poursuivre votre recherche à votre rythme."}
            </p>
          </div>
        </div>
        {action?.href ? (
          <Link
            to={action.href}
            onClick={handleActionLinkClick}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Continuer
            <DashboardIcon name="ArrowRight" size={18} />
          </Link>
        ) : action?.id === "maelise" ? (
          <button
            type="button"
            onClick={openMaelise}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Ouvrir Maelise
            <DashboardIcon name="ArrowRight" size={18} />
          </button>
        ) : null}
      </div>
    </motion.section>
  );
}
