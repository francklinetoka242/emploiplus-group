import React from "react";
import { Helmet } from "react-helmet-async";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  keywords?: string;
  robots?: string;
  ogType?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  structuredData?: object | object[];
}

export interface SiteSEOSettings {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  robots: string;
  ogImage: string;
}

export const BASE_URL = "https://emploiplus.group";
const SEO_SETTINGS_STORAGE_KEY = "emploiplus.site-seo";

export const DEFAULT_SITE_SEO_SETTINGS: SiteSEOSettings = {
  title: "EmploiPlus Group",
  description: "Solutions numériques, diffusion d'offres d'emploi et services médias pour les talents et les entreprises.",
  keywords: "emploi, offres d'emploi, recrutement, diffusion d'annonces, Congo",
  canonical: BASE_URL,
  robots: "index,follow",
  ogImage: `${BASE_URL}/og-default.svg`,
};

function buildJsonLd(metadata: SEOMetadata) {
  const organization = {
    "@type": "Organization",
    name: "EmploiPlus Group",
    url: BASE_URL,
    logo: `${BASE_URL}/Logo.png`,
    sameAs: [
      "https://www.facebook.com/EmploiplusConsulting",
      "https://www.linkedin.com/company/emploiplus-consulting/",
    ],
  };

  const website = {
    "@type": "WebSite",
    url: BASE_URL,
    name: "EmploiPlus Group",
    description: "Solutions numériques, diffusion d'offres d'emploi et contenus médias professionnels pour le marché congolais.",
    publisher: {
      "@type": "Organization",
      name: "EmploiPlus Group",
    },
  };

  const graph: object[] = [organization, website];

  if (metadata.breadcrumbs && metadata.breadcrumbs.length > 0) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: metadata.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  if (metadata.structuredData) {
    graph.push(...(Array.isArray(metadata.structuredData) ? metadata.structuredData : [metadata.structuredData]));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

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
  const [settings, setSettings] = React.useState<SiteSEOSettings>(getStoredSiteSeoSettings);

  React.useEffect(() => {
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

function resolveAbsoluteUrl(value: string) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function usePageSEO(metadata: SEOMetadata) {
  const siteSeo = useSiteSeoSettings();
  const resolvedTitle = metadata.title === DEFAULT_SEO.title ? siteSeo.title : metadata.title || siteSeo.title;
  const resolvedDescription = metadata.description === DEFAULT_SEO.description ? siteSeo.description : metadata.description || siteSeo.description;
  const resolvedKeywords = metadata.keywords === DEFAULT_SEO.keywords ? siteSeo.keywords : metadata.keywords || siteSeo.keywords;
  const resolvedCanonical = metadata.canonical === DEFAULT_SEO.canonical ? siteSeo.canonical : metadata.canonical || siteSeo.canonical;
  const resolvedRobots = metadata.robots === DEFAULT_SEO.robots ? siteSeo.robots : metadata.robots || siteSeo.robots;
  const resolvedOgImage = resolveAbsoluteUrl(metadata.ogImage || siteSeo.ogImage || `${BASE_URL}/og-default.svg`);
  const ogUrl = metadata.ogUrl || resolvedCanonical;
  const schema = buildJsonLd(metadata);

  return (
    <Helmet>
      <title>{resolvedTitle} | EmploiPlus Group</title>
      <meta name="description" content={resolvedDescription} />
      {resolvedKeywords && <meta name="keywords" content={resolvedKeywords} />}
      <meta name="robots" content={resolvedRobots} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={`${resolvedTitle} | EmploiPlus Group`} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:secure_url" content={resolvedOgImage} />
      <meta property="og:image:alt" content={resolvedTitle} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={metadata.ogType || "website"} />
      {metadata.publishedTime && <meta property="article:published_time" content={metadata.publishedTime} />}
      {metadata.modifiedTime && <meta property="article:modified_time" content={metadata.modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${resolvedTitle} | EmploiPlus Group`} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:image:alt" content={resolvedTitle} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export const DEFAULT_SEO: SEOMetadata = {
  title: DEFAULT_SITE_SEO_SETTINGS.title,
  description: DEFAULT_SITE_SEO_SETTINGS.description,
  keywords: DEFAULT_SITE_SEO_SETTINGS.keywords,
  canonical: DEFAULT_SITE_SEO_SETTINGS.canonical,
  robots: DEFAULT_SITE_SEO_SETTINGS.robots,
  ogImage: DEFAULT_SITE_SEO_SETTINGS.ogImage,
};
