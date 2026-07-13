import type { SEOMetadata } from "../types";
import { usePageSEO } from "../hooks/usePageSEO";

export default function SEO(props: SEOMetadata) {
  return usePageSEO(props);
}

export type { SEOMetadata };
