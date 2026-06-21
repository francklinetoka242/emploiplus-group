import { Helmet } from "react-helmet-async";

export interface SEOMetadata {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  keywords?: string;
}

export function usePageSEO(metadata: SEOMetadata) {
  const baseUrl = "https://emploiplus.group";
  const ogImage = metadata.ogImage || `${baseUrl}/og-default.png`;
  const ogUrl = metadata.ogUrl || baseUrl;
  const canonical = metadata.canonical || baseUrl;

  return (
    <Helmet>
      <title>{metadata.title} | EmploiPlus Group</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={`${metadata.title} | EmploiPlus Group`} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${metadata.title} | EmploiPlus Group`} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

export const DEFAULT_SEO: SEOMetadata = {
  title: "EmploiPlus Group",
  description: "Solutions numériques, diffusion d'offres d'emploi et services médias pour les talents et les entreprises.",
  keywords: "emploi, offres d'emploi, recruitment, diffusion d'annonces, Congo",
};
