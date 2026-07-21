/**
 * Utilitaires pour le Mode Économie de Données (Eco Mode)
 * 
 * Ensemble de fonctions et constantes pour gérer les assets lourds
 * et optimiser la consommation de données en fonction du mode actif
 */

/**
 * Types d'assets qui peuvent être bloqués en Mode Économie
 */
export type EcoAssetType = "image" | "video" | "animation" | "iframe" | "font";

/**
 * Configuration des assets bloqués par type
 */
export const ECO_MODE_CONFIG = {
  image: {
    blocked: true,
    fallback: "placeholder",
    description: "Images externes",
  },
  video: {
    blocked: true,
    fallback: "thumbnail",
    description: "Vidéos et flux média",
  },
  animation: {
    blocked: false, // Les animations CSS sont légères, à adapter selon les besoins
    fallback: "static",
    description: "Animations CSS/JS",
  },
  iframe: {
    blocked: true,
    fallback: "link",
    description: "Contenus externes (iframes)",
  },
  font: {
    blocked: false, // Les fonts système sont généralement pré-chargées
    fallback: "system",
    description: "Polices personnalisées",
  },
} as const;

/**
 * Détermine si un asset doit être bloqué en Mode Économie
 * 
 * @param assetType - Type d'asset à vérifier
 * @param isEcoMode - État du Mode Économie
 * @returns true si l'asset doit être bloqué
 * 
 * @example
 * if (shouldBlockAsset("image", isEcoMode)) {
 *   // Afficher placeholder au lieu de l'image
 * }
 */
export function shouldBlockAsset(
  assetType: EcoAssetType,
  isEcoMode: boolean,
): boolean {
  if (!isEcoMode) return false;
  return ECO_MODE_CONFIG[assetType].blocked;
}

/**
 * Génère une classe CSS pour désactiver les animations en Mode Économie
 * 
 * À ajouter à la balise <html> ou <body> pour appliquer globalement
 * 
 * @returns Sélecteur CSS à utiliser
 * 
 * @example
 * // Dans un useEffect au top-level
 * useEffect(() => {
 *   const className = getAnimationDisabledClassName();
 *   if (isEcoMode) {
 *     document.documentElement.classList.add(className);
 *   } else {
 *     document.documentElement.classList.remove(className);
 *   }
 * }, [isEcoMode]);
 */
export function getAnimationDisabledClassName(): string {
  return "eco-mode-no-animations";
}

/**
 * Crée un style CSS inline pour désactiver les animations
 * 
 * Utile pour appliquer rapidement le Mode Économie à un composant
 * 
 * @returns Objet de style CSS
 * 
 * @example
 * <div style={getAnimationDisabledStyles()}>
 *   {/* Contenu sans animations */}
 * </div>
 */
export function getAnimationDisabledStyles(): React.CSSProperties {
  return {
    animation: "none",
    transition: "none",
  };
}

/**
 * Classe pour gérer les préférences de réduction de mouvement
 * Compatible avec les réglages d'accessibilité du système
 */
export class EcoModeMediaQuery {
  /**
   * Vérifie si l'utilisateur a activé "Réduire les mouvements" au niveau système
   * 
   * @returns true si la préférence est active
   */
  static prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Combine la préférence système et le Mode Économie
   * 
   * @param isEcoMode - État du Mode Économie
   * @returns true si les animations doivent être désactivées
   */
  static shouldDisableAnimations(isEcoMode: boolean): boolean {
    return isEcoMode || this.prefersReducedMotion();
  }
}

/**
 * Génère une URL de data URI pour un placeholder 1x1 transparent
 * 
 * Utile pour remplacer les src d'images en Mode Économie
 * 
 * @returns Data URI d'un pixel transparent
 */
export function getTransparentPixelDataUri(): string {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
}

/**
 * Calcule l'économie de données estimée en bloquant une ressource
 * 
 * @param resourceType - Type de ressource (image, video, etc.)
 * @param count - Nombre de ressources bloquées
 * @returns Objet avec estimation en bytes et format lisible
 * 
 * @example
 * const savings = estimateDataSavings("image", 10);
 * console.log(`Économie : ${savings.humanReadable}`);
 */
export function estimateDataSavings(
  resourceType: EcoAssetType,
  count: number,
): {
  bytes: number;
  humanReadable: string;
} {
  // Estimations moyennes (à adapter selon votre usage)
  const averageSizes: Record<EcoAssetType, number> = {
    image: 250_000, // ~250 KB par image moyenne
    video: 5_000_000, // ~5 MB par vidéo
    animation: 50_000, // ~50 KB (fichiers JS/CSS)
    iframe: 200_000, // ~200 KB
    font: 100_000, // ~100 KB
  };

  const totalBytes = (averageSizes[resourceType] || 0) * count;
  const humanReadable = formatBytes(totalBytes);

  return { bytes: totalBytes, humanReadable };
}

/**
 * Formate les bytes en format lisible (B, KB, MB, GB)
 * 
 * @param bytes - Nombre de bytes à formater
 * @param decimals - Nombre de décimales (par défaut 2)
 * @returns Chaîne formatée
 * 
 * @example
 * formatBytes(1048576); // "1.00 MB"
 * formatBytes(512000); // "500.00 KB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Applique le Mode Économie de manière globale au document
 * 
 * À appeler dans un useEffect au top-level de l'app
 * 
 * @param isEcoMode - État du Mode Économie
 * 
 * @example
 * useEffect(() => {
 *   applyEcoModeToDocument(isEcoMode);
 * }, [isEcoMode]);
 */
export function applyEcoModeToDocument(isEcoMode: boolean): void {
  const html = document.documentElement;
  const animationClass = getAnimationDisabledClassName();

  if (isEcoMode) {
    html.classList.add(animationClass);
    html.style.setProperty("--eco-mode-enabled", "true");
  } else {
    html.classList.remove(animationClass);
    html.style.setProperty("--eco-mode-enabled", "false");
  }
}

/**
 * Hook pour synchroniser automatiquement le Mode Économie avec le document
 * 
 * À utiliser dans le composant root de l'application
 * 
 * @example
 * // Dans App.tsx ou un composant root
 * export function AppRoot() {
 *   const { isEcoMode } = useEcoMode();
 *   useSyncEcoModeWithDocument(isEcoMode);
 *   
 *   return (
 *     <div>
 *       {/* Contenu de l'app */}
 *     </div>
 *   );
 * }
 */
export function useSyncEcoModeWithDocument(isEcoMode: boolean): void {
  // Utiliser une syntaxe qui fonctionne sans importer React
  const useEffect = require("react").useEffect;

  useEffect(() => {
    applyEcoModeToDocument(isEcoMode);
  }, [isEcoMode]);
}

/**
 * Classe pour tracker l'usage de données en Mode Économie
 * 
 * Utile pour générer des statistiques/rapports
 */
export class EcoModeAnalytics {
  private static stats = {
    imagesBlocked: 0,
    videosBlocked: 0,
    iframesBlocked: 0,
    estimatedBytesSaved: 0,
    toggleCount: 0,
  };

  static recordBlockedAsset(type: EcoAssetType, estimatedBytes: number = 0): void {
    switch (type) {
      case "image":
        this.stats.imagesBlocked++;
        break;
      case "video":
        this.stats.videosBlocked++;
        break;
      case "iframe":
        this.stats.iframesBlocked++;
        break;
    }
    this.stats.estimatedBytesSaved += estimatedBytes;
  }

  static recordToggle(): void {
    this.stats.toggleCount++;
  }

  static getStats() {
    return { ...this.stats };
  }

  static reset(): void {
    this.stats = {
      imagesBlocked: 0,
      videosBlocked: 0,
      iframesBlocked: 0,
      estimatedBytesSaved: 0,
      toggleCount: 0,
    };
  }
}
