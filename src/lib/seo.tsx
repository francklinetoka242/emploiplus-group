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

export const BASE_URL = "https://emploiplus.group";

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

export function usePageSEO(metadata: SEOMetadata) {
  const ogImage = metadata.ogImage || `${BASE_URL}/og-default.svg`;
  const canonical = metadata.canonical || BASE_URL;
  const ogUrl = metadata.ogUrl || canonical;
  const robots = metadata.robots || "index,follow";
  const schema = buildJsonLd(metadata);

  return (
    <Helmet>
      <title>{metadata.title} | EmploiPlus Group</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={`${metadata.title} | EmploiPlus Group`} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={metadata.ogType || "website"} />
      {metadata.publishedTime && <meta property="article:published_time" content={metadata.publishedTime} />}
      {metadata.modifiedTime && <meta property="article:modified_time" content={metadata.modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${metadata.title} | EmploiPlus Group`} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export const DEFAULT_SEO: SEOMetadata = {
  title: "EmploiPlus Group",
  description: "Solutions numériques, diffusion d'offres d'emploi et services médias pour les talents et les entreprises.",
  keywords: "emploi, offres d'emploi, recrutement, diffusion d'annonces, Congo",
  canonical: BASE_URL,
  robots: "index,follow",
};
