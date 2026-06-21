import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import sitemapPlugin from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    sitemapPlugin({
      hostname: "https://emploiplus-group.com",
      dynamicRoutes: ["/", "/auth", "/about", "/services", "/jobs", "/blog", "/contact"],
      exclude: [],
      priority: 0.7,
      changefreq: "daily",
      lastmod: new Date(),
      outDir: "dist",
      generateRobotsTxt: true,
      robots: [
        { userAgent: "*", allow: "/", disallow: ["/admin", "/auth"] },
        { userAgent: "Googlebot", allow: "/" },
      ],
    }),
  ],
});
