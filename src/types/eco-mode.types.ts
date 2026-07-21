/**
 * Types et interfaces réutilisables pour le Mode Économie
 * 
 * Importer ces types pour assurer la cohérence à travers l'application
 */

/**
 * État du Mode Économie
 */
export interface EcoModeState {
  isEcoMode: boolean;
  toggleEcoMode: () => void;
}

/**
 * Configuration du Mode Économie
 */
export interface EcoModeConfig {
  /**
   * Clé de stockage localStorage
   */
  storageKey: string;

  /**
   * Valeur par défaut au premier chargement
   */
  defaultValue: boolean;

  /**
   * Permettre de persister dans localStorage
   */
  persistToLocalStorage: boolean;

  /**
   * Logger les changements (development only)
   */
  debug: boolean;
}

/**
 * Configuration d'un asset bloqué en Mode Économie
 */
export interface EcoAssetConfig {
  /** Bloquer cet asset en Mode Économie */
  blocked: boolean;

  /** Type de fallback à utiliser */
  fallback: "placeholder" | "thumbnail" | "link" | "static" | "system";

  /** Description lisible pour les logs */
  description: string;
}

/**
 * Propriétés du composant EcoImage
 */
export interface EcoImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * URL de l'image à charger
   */
  src: string;

  /**
   * Texte alternatif (requis pour l'accessibilité)
   */
  alt: string;

  /**
   * Couleur du placeholder en Mode Économie
   */
  ecoPlaceholderColor?: string;

  /**
   * Texte du placeholder en Mode Économie
   */
  ecoPlaceholderText?: string;

  /**
   * Hauteur du placeholder
   */
  ecoPlaceholderHeight?: number;

  /**
   * Largeur du placeholder
   */
  ecoPlaceholderWidth?: number;
}

/**
 * Résultats de l'estimation d'économies de données
 */
export interface DataSavingsEstimate {
  /** Taille en bytes */
  bytes: number;

  /** Format lisible (e.g., "12.5 MB") */
  humanReadable: string;
}

/**
 * Statistiques de suivi du Mode Économie
 */
export interface EcoModeStats {
  /** Nombre d'images bloquées */
  imagesBlocked: number;

  /** Nombre de vidéos bloquées */
  videosBlocked: number;

  /** Nombre d'iframes bloquées */
  iframesBlocked: number;

  /** Données sauvegardées estimées (en bytes) */
  estimatedBytesSaved: number;

  /** Nombre de fois que le Mode a été basculé */
  toggleCount: number;
}

/**
 * Options pour le hook useEcoMode
 */
export interface UseEcoModeOptions {
  /** Callback exécuté quand le Mode change */
  onToggle?: (isEcoMode: boolean) => void;

  /** Logger les changements en development */
  debug?: boolean;
}

/**
 * Résultat du hook useConditionalAnimation
 */
export interface ConditionalAnimationOptions {
  /** Nom de l'animation CSS */
  animationName?: string;

  /** Durée de l'animation */
  duration?: string;

  /** Timing function */
  timingFunction?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";

  /** Délai avant l'animation */
  delay?: string;
}

/**
 * Type pour les assets supportés
 */
export type EcoAssetType = "image" | "video" | "animation" | "iframe" | "font";

/**
 * Type pour les fallbacks d'assets
 */
export type EcoAssetFallback = "placeholder" | "thumbnail" | "link" | "static" | "system";

/**
 * Fonction callback pour les changements de Mode Économie
 */
export type EcoModeToggleCallback = (isEcoMode: boolean) => void;

/**
 * Fonction pour calculer les économies de données
 */
export type DataSavingsCalculator = (
  assetType: EcoAssetType,
  count: number,
) => DataSavingsEstimate;

/**
 * Configuration personnalisée pour EcoImage
 */
export interface EcoImageConfig {
  /** Couleur par défaut des placeholders */
  defaultPlaceholderColor: string;

  /** Texte par défaut des placeholders */
  defaultPlaceholderText: string;

  /** Largeur par défaut */
  defaultWidth: number;

  /** Hauteur par défaut */
  defaultHeight: number;

  /** Activer le cache des images en Mode Normal */
  enableImageCache: boolean;
}

/**
 * Contexte d'exécution pour les utilitaires EcoMode
 */
export interface EcoModeContext {
  isEcoMode: boolean;
  config: EcoModeConfig;
  stats: EcoModeStats;
}

/**
 * Options de personnalisation du Provider
 */
export interface EcoModeProviderProps {
  children: React.ReactNode;

  /**
   * Configuration personnalisée
   */
  config?: Partial<EcoModeConfig>;

  /**
   * Valeur initiale (override localStorage)
   */
  initialValue?: boolean;

  /**
   * Callback exécuté au premier montage
   */
  onInitialize?: (isEcoMode: boolean) => void;
}

/**
 * Union de tous les types supportés
 */
export type EcoModeValue = boolean | string | "true" | "false";

/**
 * Énumération des événements Mode Économie
 */
export enum EcoModeEvent {
  ENABLED = "eco-mode:enabled",
  DISABLED = "eco-mode:disabled",
  TOGGLED = "eco-mode:toggled",
  ASSET_BLOCKED = "eco-mode:asset-blocked",
  ANALYTICS_RECORDED = "eco-mode:analytics-recorded",
}

/**
 * Payload pour les événements Mode Économie
 */
export interface EcoModeEventPayload {
  type: EcoModeEvent;
  timestamp: Date;
  data?: Record<string, unknown>;
}
