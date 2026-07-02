import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import type { ResolvedConfig } from "vite";

function sitemapGeneratorPlugin(env: Record<string, string>) {
  let outputDir = "dist";
  let rootDir = process.cwd();

  return {
    name: "custom-sitemap-generator",

    configResolved(config: ResolvedConfig) {
      outputDir = config.build.outDir || "dist";
      rootDir = config.root || process.cwd();

      if (!resolve(outputDir).startsWith("/") && !outputDir.includes(":")) {
        outputDir = resolve(rootDir, outputDir);
      }
    },

    async closeBundle() {
      const hostname = "https://emploiplus-group.com".replace(/\/$/, "");

      const staticRoutes = [
        "/",
        "/about",
        "/services",
        "/jobs",
        "/blog",
        "/contact",
      ];

      const now = new Date().toISOString();

      const publishRoute = (
        route: string,
        lastmod = now,
        changefreq = "weekly",
        priority = "0.7",
      ) =>
        `  <url>\n    <loc>${hostname}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

      const pageItems = staticRoutes
        .map((route) => publishRoute(route, now, "daily", "0.9"))
        .join("\n");

      const sitemapItems: string[] = [pageItems];

      try {
        const { createClient } = await import("@supabase/supabase-js");

        const supabaseUrl =
          env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";

        const supabaseKey =
          env.VITE_SUPABASE_ANON_KEY ||
          env.SUPABASE_ANON_KEY ||
          env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          env.SUPABASE_PUBLISHABLE_KEY ||
          env.SUPABASE_SERVICE_ROLE_KEY ||
          "";

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: jobs } = await supabase
            .from("job_offers")
            .select("slug, publish_at, updated_at, status")
            .order("publish_at", { ascending: false });

          const { data: posts } = await supabase
            .from("blog_posts")
            .select("slug, publish_at, updated_at, status")
            .order("publish_at", { ascending: false });

          if (Array.isArray(jobs)) {
            sitemapItems.push(
              ...jobs.map((job) => {
                const route = `/jobs/${job.slug}`;
                const lastmod =
                  job.updated_at || job.publish_at || now;

                return publishRoute(route, lastmod, "weekly", "0.8");
              }),
            );
          }

          if (Array.isArray(posts)) {
            sitemapItems.push(
              ...posts.map((post) => {
                const route = `/blog/${post.slug}`;
                const lastmod =
                  post.updated_at || post.publish_at || now;

                return publishRoute(route, lastmod, "weekly", "0.8");
              }),
            );
          }
        }
      } catch (err) {
        console.warn("Sitemap warning:", err);
      }

      const sitemapXml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `${sitemapItems.join("\n")}\n` +
        `</urlset>`;

      mkdirSync(outputDir, { recursive: true });
      writeFileSync(
        join(outputDir, "sitemap.xml"),
        sitemapXml,
        "utf8",
      );

      try {
        const indexPath = join(outputDir, "index.html");
        const notFoundPath = join(outputDir, "404.html");

        if (existsSync(indexPath)) {
          copyFileSync(indexPath, notFoundPath);
        }
      } catch (err) {
        console.warn("404 warning:", err);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      sitemapGeneratorPlugin(env),
    ],

    // ✅ FIX COMPLET alias @ (Vite + TS + dev scan)
    resolve: {
      // single, Windows-safe alias for `@` -> `src`
      alias: {
        "@": resolve(__dirname, "src").replace(/\\/g, "/") + "/",
      },
    },

    // ✅ empêche crash dependency scan Vite (Windows safe)
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
  };
});