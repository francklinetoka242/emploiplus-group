import { useEffect, useState } from "react";
import type { SEOMetadata, SiteSEOSettings } from "../types";

export const BASE_URL = "https://emploiplus-group.com";
const SEO_SETTINGS_STORAGE_KEY = "emploiplus.site-seo";

export const DEFAULT_SITE_SEO_SETTINGS: SiteSEOSettings = {
  title: "EmploiPlus Group",
  description:
    "Solutions numériques, diffusion d'offres d'emploi et services médias pour les talents et les entreprises.",
  keywords: "emploi, offres d'emploi, recrutement, diffusion d'annonces, Congo",
  canonical: BASE_URL,
  robots: "index,follow",
  ogImage: `${BASE_URL}/og-default.svg`,
};

export const DEFAULT_SEO: SEOMetadata = {
  title: DEFAULT_SITE_SEO_SETTINGS.title,
  description: DEFAULT_SITE_SEO_SETTINGS.description,
  keywords: DEFAULT_SITE_SEO_SETTINGS.keywords,
  canonical: DEFAULT_SITE_SEO_SETTINGS.canonical,
  robots: DEFAULT_SITE_SEO_SETTINGS.robots,
  ogImage: DEFAULT_SITE_SEO_SETTINGS.ogImage,
};

function getStoredSiteSeoSettings(): SiteSEOSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_SEO_SETTINGS;
  }

  try {
    const stored = window.localStorage.getItem(SEO_SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SiteSEOSettings>;
      return { ...DEFAULT_SITE_SEO_SETTINGS, ...parsed };
    }
  } catch {
    // Fallback to defaults if localStorage is unavailable.
  }

  return DEFAULT_SITE_SEO_SETTINGS;
}

export function getSiteSeoSettings(): SiteSEOSettings {
  return getStoredSiteSeoSettings();
}

export function saveSiteSeoSettings(settings: Partial<SiteSEOSettings>): SiteSEOSettings {
  const merged = { ...DEFAULT_SITE_SEO_SETTINGS, ...getStoredSiteSeoSettings(), ...settings };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(SEO_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("emploiplus-seo-updated"));
  }

  return merged;
}

export function useSiteSeoSettings() {
  const [settings, setSettings] = useState<SiteSEOSettings>(getStoredSiteSeoSettings);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncSettings = () => setSettings(getStoredSiteSeoSettings());
    syncSettings();
    window.addEventListener("emploiplus-seo-updated", syncSettings);
    return () => window.removeEventListener("emploiplus-seo-updated", syncSettings);
  }, []);

  return settings;
}
