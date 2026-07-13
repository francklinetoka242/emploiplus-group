import type { BreadcrumbItem, SEOMetadata } from "../types";

const BASE_URL = "https://emploiplus-group.com";

export function buildJsonLd(metadata: SEOMetadata) {
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
    description:
      "Solutions numériques, diffusion d'offres d'emploi et contenus médias professionnels pour le marché congolais.",
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
    graph.push(
      ...(Array.isArray(metadata.structuredData)
        ? metadata.structuredData
        : [metadata.structuredData]),
    );
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function resolveAbsoluteUrl(value: string) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}
