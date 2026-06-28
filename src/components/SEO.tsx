import React from "react";
import { usePageSEO } from "@/lib/seo";
import type { SEOMetadata } from "@/lib/seo";

export default function SEO(props: SEOMetadata) {
  return usePageSEO(props);
}

export type { SEOMetadata };
