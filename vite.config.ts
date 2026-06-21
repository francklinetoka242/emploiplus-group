import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

function sitemapGeneratorPlugin() {
  let outputDir = "dist";
  let rootDir = process.cwd();

  return {
    name: "custom-sitemap-generator",
    configResolved(config) {
      outputDir = config.build.outDir || "dist";
      rootDir = config.root || process.cwd();
      if (!resolve(outputDir).startsWith("/") && !outputDir.includes(":")) {
        outputDir = resolve(rootDir, outputDir);
      }
    },
    closeBundle() {
      const hostname = "https://emploiplus-group.com".replace(/\/$/, "");
      const routes = ["/", "/auth", "/about", "/services", "/jobs", "/blog", "/contact"];
      const lastmod = new Date().toISOString().split("T")[0];
      const sitemapItems = routes
        .map((route) => {
          const url = `${hostname}${route}`;
          return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`;
        })
        .join("\n");
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapItems}\n</urlset>`;
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(join(outputDir, "sitemap.xml"), sitemapXml, "utf8");
    },
  };
}

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss(), sitemapGeneratorPlugin()],
});
