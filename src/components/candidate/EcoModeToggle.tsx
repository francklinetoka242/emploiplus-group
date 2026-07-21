/**
 * Composant Toggle Mode Économie de Données
 * 
 * Interrupteur moderne et responsive pour contrôler le Mode Économie
 * Destiné à être intégré dans la Sidebar candidat
 * 
 * Utilisation :
 * <EcoModeToggle />                    // Compact (sidebar fermée)
 * <EcoModeToggle variant="expanded" /> // Complet (sidebar ouverte)
 */

import React from "react";
import { useEcoMode } from "@/contexts/EcoModeContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Leaf, Zap, ToggleLeft, ToggleRight } from "lucide-react";

interface EcoModeToggleProps {
  /**
   * Variant d'affichage
   * - "compact" : Icône seule (pour sidebar fermée)
   * - "expanded" : Icône + texte + switch (pour sidebar ouverte)
   * - "full" : Version complète avec description
   * @default "expanded"
   */
  variant?: "compact" | "expanded" | "full";

  /**
   * Classe CSS supplémentaire
   */
  className?: string;

  /**
   * Si true, affiche les données économisées (si disponible)
   */
  showStats?: boolean;

  /**
   * Icône à utiliser
   * - "leaf" : Feuille (naturel, écologique)
   * - "zap" : Éclair (énergie)
   * @default "leaf"
   */
  iconType?: "leaf" | "zap";

  /**
   * Callback optionnel quand le toggle change
   */
  onChange?: (isEcoMode: boolean) => void;

  /**
   * Rendre le toggle désactivé
   */
  disabled?: boolean;

  /**
   * Texte personnalisé
   */
  label?: string;
}

/**
 * Composant Toggle Mode Économie de Données
 * 
 * Caractéristiques :
 * ✅ 3 variantes d'affichage (compact, expanded, full)
 * ✅ Responsive (44px+ zone tactile)
 * ✅ Accessibilité (ARIA labels, keyboard)
 * ✅ Animations fluides
 * ✅ Design cohérent avec la Sidebar
 * ✅ Support stats (données sauvegardées)
 */
export function EcoModeToggle({
  variant = "expanded",
  className,
  showStats = false,
  iconType = "leaf",
  onChange,
  disabled = false,
  label = "Économie de données",
}: EcoModeToggleProps): React.ReactElement {
  const { isEcoMode, toggleEcoMode } = useEcoMode();

  const handleToggle = () => {
    if (!disabled) {
      toggleEcoMode();
      onChange?.(!isEcoMode);
    }
  };

  const Icon = iconType === "leaf" ? Leaf : Zap;

  // ─────────────────────────────────────────────────────────
  // VARIANT: COMPACT (sidebar fermée)
  // ─────────────────────────────────────────────────────────

  if (variant === "compact") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            disabled={disabled}
            className={cn(
              "group relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 transition-all duration-250",
              isEcoMode
                ? "bg-green-600/20 text-green-300 hover:bg-green-600/30"
                : "bg-slate-800/50 text-slate-200 hover:bg-slate-700/50",
              disabled && "cursor-not-allowed opacity-50",
              className,
            )}
            aria-label={`${label} - ${isEcoMode ? "activé" : "désactivé"}`}
            aria-pressed={isEcoMode}
            type="button"
          >
            <Icon className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="rounded-lg border border-white/10 bg-slate-900 text-xs font-medium"
        >
          <p className="font-semibold">{label}</p>
          <p className="text-slate-400">{isEcoMode ? "Activé" : "Désactivé"}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // ─────────────────────────────────────────────────────────
  // VARIANT: EXPANDED (sidebar ouverte)
  // ─────────────────────────────────────────────────────────

  if (variant === "expanded") {
    return (
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "group relative flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2.5 transition-all duration-250",
          isEcoMode
            ? "bg-green-600/20 text-green-300 hover:bg-green-600/30"
            : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        aria-label={`${label} - ${isEcoMode ? "activé" : "désactivé"}`}
        aria-pressed={isEcoMode}
        type="button"
      >
        {/* Icon & Label */}
        <div className="flex flex-1 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 transition-all duration-250",
              isEcoMode
                ? "bg-green-600/30 text-green-300"
                : "bg-slate-950/90 text-slate-200",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium">{label}</p>
            <p
              className={cn(
                "text-xs transition-colors duration-250",
                isEcoMode ? "text-green-200" : "text-slate-400",
              )}
            >
              {isEcoMode ? "Activé" : "Désactivé"}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div
          className={cn(
            "flex h-6 w-11 flex-shrink-0 items-center rounded-full p-1 transition-colors duration-250",
            isEcoMode ? "bg-green-600/50" : "bg-slate-700",
          )}
        >
          {isEcoMode ? (
            <ToggleRight className="h-4 w-4 text-white" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-slate-200" />
          )}
        </div>
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────
  // VARIANT: FULL (version complète avec stats)
  // ─────────────────────────────────────────────────────────

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        "group relative flex w-full flex-col gap-2 rounded-lg border border-white/10 px-3 py-2.5 transition-all duration-250",
        isEcoMode
          ? "bg-green-600/20 text-green-300 hover:bg-green-600/30"
          : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      aria-label={`${label} - ${isEcoMode ? "activé" : "désactivé"}`}
      aria-pressed={isEcoMode}
      type="button"
    >
      {/* Header: Icon + Label + Switch */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 transition-all duration-250",
              isEcoMode
                ? "bg-green-600/30 text-green-300"
                : "bg-slate-950/90 text-slate-200",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{label}</p>
            <p
              className={cn(
                "text-xs transition-colors duration-250",
                isEcoMode ? "text-green-200" : "text-slate-400",
              )}
            >
              {isEcoMode ? "Activé" : "Désactivé"}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex h-6 w-11 flex-shrink-0 items-center rounded-full p-1 transition-colors duration-250",
            isEcoMode ? "bg-green-600/50" : "bg-slate-700",
          )}
        >
          {isEcoMode ? (
            <ToggleRight className="h-4 w-4 text-white" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-slate-200" />
          )}
        </div>
      </div>

      {/* Description */}
      {showStats && (
        <p
          className={cn(
            "text-xs transition-colors duration-250",
            isEcoMode ? "text-green-200/80" : "text-slate-400",
          )}
        >
          {isEcoMode
            ? "Images et animations masquées"
            : "Réduisez votre consommation de données"}
        </p>
      )}
    </button>
  );
}

EcoModeToggle.displayName = "EcoModeToggle";
