import React from "react";
import { Helmet } from "react-helmet-async";
import { buildJsonLd, resolveAbsoluteUrl } from "../utils/jsonLd";
import { useSiteSeoSettings } from "../services/seoSettingsService";
import { DEFAULT_SITE_SEO_SETTINGS } from "../services/seoSettingsService";
import type { SEOMetadata } from "../types";

export function usePageSEO(metadata: SEOMetadata) {
  const siteSeo = useSiteSeoSettings();
  const resolvedTitle =
    metadata.title === DEFAULT_SITE_SEO_SETTINGS.title ? siteSeo.title : metadata.title || siteSeo.title;
  const resolvedDescription =
    metadata.description === DEFAULT_SITE_SEO_SETTINGS.description
      ? siteSeo.description
      : metadata.description || siteSeo.description;
  const resolvedKeywords =
    metadata.keywords === DEFAULT_SITE_SEO_SETTINGS.keywords
      ? siteSeo.keywords
      : metadata.keywords || siteSeo.keywords;
  const resolvedCanonical =
    metadata.canonical === DEFAULT_SITE_SEO_SETTINGS.canonical
      ? siteSeo.canonical
      : metadata.canonical || siteSeo.canonical;
  const resolvedRobots =
    metadata.robots === DEFAULT_SITE_SEO_SETTINGS.robots ? siteSeo.robots : metadata.robots || siteSeo.robots;
  const resolvedOgImage = resolveAbsoluteUrl(
    metadata.ogImage || siteSeo.ogImage || `${DEFAULT_SITE_SEO_SETTINGS.canonical}/og-default.svg`,
  );
  const ogUrl = metadata.ogUrl || resolvedCanonical;
  const schema = buildJsonLd(metadata);

  const children: React.ReactNode[] = [
    React.createElement("title", null, `${resolvedTitle} | EmploiPlus Group`),
    React.createElement("meta", { name: "description", content: resolvedDescription }),
  ];

  if (resolvedKeywords) {
    children.push(React.createElement("meta", { name: "keywords", content: resolvedKeywords }));
  }

  children.push(
    React.createElement("meta", { name: "robots", content: resolvedRobots }),
    React.createElement("link", { rel: "canonical", href: resolvedCanonical }),
    React.createElement("meta", { property: "og:title", content: `${resolvedTitle} | EmploiPlus Group` }),
    React.createElement("meta", { property: "og:description", content: resolvedDescription }),
    React.createElement("meta", { property: "og:image", content: resolvedOgImage }),
    React.createElement("meta", { property: "og:image:secure_url", content: resolvedOgImage }),
    React.createElement("meta", { property: "og:image:alt", content: resolvedTitle }),
    React.createElement("meta", { property: "og:image:type", content: "image/jpeg" }),
    React.createElement("meta", { property: "og:url", content: ogUrl }),
    React.createElement("meta", { property: "og:type", content: metadata.ogType || "website" }),
  );

  if (metadata.publishedTime) {
    children.push(
      React.createElement("meta", {
        property: "article:published_time",
        content: metadata.publishedTime,
      }),
    );
  }

  if (metadata.modifiedTime) {
    children.push(
      React.createElement("meta", {
        property: "article:modified_time",
        content: metadata.modifiedTime,
      }),
    );
  }

  children.push(
    React.createElement("meta", { name: "twitter:card", content: "summary_large_image" }),
    React.createElement("meta", { name: "twitter:title", content: `${resolvedTitle} | EmploiPlus Group` }),
    React.createElement("meta", { name: "twitter:description", content: resolvedDescription }),
    React.createElement("meta", { name: "twitter:image", content: resolvedOgImage }),
    React.createElement("meta", { name: "twitter:image:alt", content: resolvedTitle }),
    React.createElement("script", { type: "application/ld+json" }, JSON.stringify(schema)),
  );

  return React.createElement(Helmet, null, ...children);
}
