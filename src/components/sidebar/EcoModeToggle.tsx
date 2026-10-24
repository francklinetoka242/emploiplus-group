import React from "react";
import { LeafIcon as Leaf } from "@phosphor-icons/react";
import { useEcoMode } from "../../contexts/EcoModeContext";

type Props = {
  /** Optionnel : classe additionnelle pour le wrapper */
  className?: string;
};

/**
 * EcoModeToggle
 * - Conçu pour être placé en bas de la Sidebar (juste au-dessus du bouton Déconnexion)
 * - Responsive et accessible
 * - Utilise Tailwind CSS pour le style
 */
export const EcoModeToggle: React.FC<Props> = ({ className = "" }) => {
  const { isEcoMode, toggleEcoMode } = useEcoMode();

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={toggleEcoMode}
        role="switch"
        aria-checked={isEcoMode}
        aria-label={`Économie de données ${isEcoMode ? "activée" : "désactivée"}`}
        className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:text-slate-300 dark:hover:bg-white/5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-950/90 dark:text-slate-200">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          Économie de données (Mo)
        </span>
        <span
          className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
            isEcoMode ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              isEcoMode ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
};

export default EcoModeToggle;
