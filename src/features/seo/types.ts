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
