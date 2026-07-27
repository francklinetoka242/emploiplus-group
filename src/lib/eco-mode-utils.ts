import type React from "react";

export type EcoAssetType = "image" | "video" | "animation" | "iframe" | "font";

export const ECO_MODE_CONFIG = {
  image: { blocked: true, fallback: "placeholder", description: "Images externes" },
  video: { blocked: true, fallback: "thumbnail", description: "Vidéos et flux média" },
  animation: { blocked: false, fallback: "static", description: "Animations CSS/JS" },
  iframe: { blocked: true, fallback: "link", description: "Contenus externes" },
  font: { blocked: false, fallback: "system", description: "Polices personnalisées" },
} as const;

export function shouldBlockAsset(assetType: EcoAssetType, isEcoMode: boolean): boolean {
  if (!isEcoMode) return false;
  return ECO_MODE_CONFIG[assetType].blocked;
}

export function getAnimationDisabledClassName(): string {
  return "eco-mode-no-animations";
}

export function getAnimationDisabledStyles(): React.CSSProperties {
  return {
    animation: "none",
    transition: "none",
  };
}

export class EcoModeMediaQuery {
  static prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  static shouldDisableAnimations(isEcoMode: boolean): boolean {
    return isEcoMode || this.prefersReducedMotion();
  }
}

export function getTransparentPixelDataUri(): string {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
}

export function estimateDataSavings(resourceType: EcoAssetType, count: number): { bytes: number; humanReadable: string } {
  const averageSizes: Record<EcoAssetType, number> = {
    image: 250_000,
    video: 5_000_000,
    animation: 50_000,
    iframe: 200_000,
    font: 100_000,
  };

  const totalBytes = (averageSizes[resourceType] || 0) * count;
  return { bytes: totalBytes, humanReadable: formatBytes(totalBytes) };
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

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

export function useSyncEcoModeWithDocument(isEcoMode: boolean): void {
  const React = require("react") as typeof import("react");
  React.useEffect(() => {
    applyEcoModeToDocument(isEcoMode);
  }, [isEcoMode]);
}

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
