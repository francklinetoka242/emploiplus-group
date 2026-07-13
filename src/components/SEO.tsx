import React from "react";
import { usePageSEO } from "@/features/seo";
import type { SEOMetadata } from "@/features/seo";

export default function SEO(props: SEOMetadata) {
  return usePageSEO(props);
}

export type { SEOMetadata };
