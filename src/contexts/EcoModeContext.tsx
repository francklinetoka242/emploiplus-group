import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Contexte pour le Mode Économie de Données (Eco Mode)
 * 
 * Objectif : réduire la consommation de données en bloquant :
 * - Les images lourdes
 * - Les animations CSS/JS
 * - Les vidéos et médias
 * 
 * Persistance : localStorage (clé: "emploiplus_eco_mode")
 * Aucune synchronisation Supabase pour éviter les appels réseau inutiles
 */

interface EcoModeContextType {
  /** Indique si le Mode Économie est activé */
  isEcoMode: boolean;
  
  /** Bascule l'état du Mode Économie */
  toggleEcoMode: () => void;
}

const EcoModeContext = createContext<EcoModeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "emploiplus_eco_mode";

/**
 * Provider pour le Mode Économie de Données
 * 
 * À placer au plus haut niveau de l'application (dans App.tsx ou main.tsx)
 * pour assurer que tous les composants ont accès au contexte.
 */
export function EcoModeProvider({ children }: { children: React.ReactNode }) {
  const [isEcoMode, setIsEcoMode] = useState<boolean>(() => {
    // Initialisation sécurisée du localStorage (SSR safe)
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Si aucune valeur n'existe, par défaut Eco Mode est désactivé
      return stored === "true";
    } catch (error) {
      console.warn("Could not read eco mode preference from localStorage:", error);
      return false;
    }
  });

  /**
   * Persiste l'état du Mode Économie dans localStorage
   * Exécuté chaque fois que isEcoMode change
   */
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(isEcoMode));
    } catch (error) {
      console.warn("Could not persist eco mode preference to localStorage:", error);
    }
  }, [isEcoMode]);

  // Add/remove a global HTML class to disable animations when Eco Mode is enabled
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isEcoMode) {
        root.classList.add('eco-mode-no-animations');
        root.style.setProperty('--eco-mode-enabled', 'true');
      } else {
        root.classList.remove('eco-mode-no-animations');
        root.style.setProperty('--eco-mode-enabled', 'false');
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [isEcoMode]);

  /**
   * Bascule l'état du Mode Économie
   * Utilise useCallback pour éviter les re-renders inutiles
   */
  const toggleEcoMode = useCallback(() => {
    setIsEcoMode((prev) => !prev);
  }, []);

  const value = useMemo<EcoModeContextType>(
    () => ({ isEcoMode, toggleEcoMode }),
    [isEcoMode, toggleEcoMode],
  );

  return (
    <EcoModeContext.Provider value={value}>
      {children}
    </EcoModeContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte Mode Économie
 * 
 * @returns {EcoModeContextType} Objet avec isEcoMode et toggleEcoMode
 * @throws Erreur si utilisé en dehors du Provider
 * 
 * @example
 * const { isEcoMode, toggleEcoMode } = useEcoMode();
 * if (isEcoMode) {
 *   // Implémenter logique économe en données
 * }
 */
export function useEcoMode(): EcoModeContextType {
  const context = useContext(EcoModeContext);
  
  if (!context) {
    throw new Error(
      "useEcoMode doit être utilisé au sein d'un EcoModeProvider. " +
      "Assurez-vous que EcoModeProvider enveloppe votre application."
    );
  }
  
  return context;
}

/**
 * HOC (Higher-Order Component) pour envelopper un composant avec le Provider EcoMode
 * Utile pour les tests ou les composants isolés
 */
export function withEcoMode<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  return (props: P) => (
    <EcoModeProvider>
      <Component {...props} />
    </EcoModeProvider>
  );
}
