import React from "react";
import { useEcoMode } from "@/contexts/EcoModeContext";
import { EcoModeMediaQuery, applyEcoModeToDocument } from "@/lib/eco-mode-utils";

/**
 * Composant Root Wrapper pour appliquer le Mode Économie globalement
 * 
 * À placer autour de votre application complète (dans App.tsx ou main.tsx)
 * pour synchroniser le Mode Économie avec le document HTML
 */
export function EcoModeRootWrapper({ children }: { children: React.ReactNode }) {
  const { isEcoMode } = useEcoMode();

  React.useEffect(() => {
    // Synchroniser le Mode Économie avec le document HTML
    applyEcoModeToDocument(isEcoMode);
  }, [isEcoMode]);

  return <>{children}</>;
}

/**
 * Hook personnalisé pour déterminer si les animations doivent être désactivées
 * 
 * Combine :
 * - La préférence système (prefers-reduced-motion)
 * - L'état du Mode Économie
 * 
 * @returns true si les animations doivent être désactivées
 * 
 * @example
 * const shouldDisableAnimations = useEcoAnimations();
 * 
 * <div style={{ animation: shouldDisableAnimations ? "none" : "fadeIn 0.3s" }}>
 *   Contenu avec animation conditionnelle
 * </div>
 */
export function useEcoAnimations(): boolean {
  const { isEcoMode } = useEcoMode();
  return EcoModeMediaQuery.shouldDisableAnimations(isEcoMode);
}

/**
 * Hook pour déterminer les styles d'animation conditionnels
 * 
 * Retourne une fonction qui génère les styles appropriés
 * 
 * @returns Fonction (nom animation) => style CSS object
 * 
 * @example
 * const getAnimationStyle = useConditionalAnimation();
 * 
 * <div style={getAnimationStyle("fadeIn")}>
 *   {/* S'animera sauf en Mode Économie */}
 * </div>
 */
export function useConditionalAnimation(
  animationName?: string,
): React.CSSProperties {
  const shouldDisable = useEcoAnimations();

  if (!animationName || shouldDisable) {
    return { animation: "none" };
  }

  return { animation: `${animationName} 0.3s ease-in-out` };
}

/**
 * Hook pour déterminer les styles de transition conditionnels
 * 
 * @returns Objet de styles CSS
 * 
 * @example
 * const transitionStyle = useConditionalTransition();
 * 
 * <button style={transitionStyle}>
 *   Bouton avec transition conditionnelle
 * </button>
 */
export function useConditionalTransition(
  transitionValue: string = "all 0.3s ease",
): React.CSSProperties {
  const shouldDisable = useEcoAnimations();

  return {
    transition: shouldDisable ? "none" : transitionValue,
  };
}
