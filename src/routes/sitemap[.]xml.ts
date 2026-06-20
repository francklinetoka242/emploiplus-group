import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; lastmod?: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/services", changefreq: "monthly", priority: "0.8" },
          { path: "/jobs", changefreq: "daily", priority: "0.9" },
          { path: "/blog", changefreq: "daily", priority: "0.8" },
          { path: "/about", changefreq: "yearly", priority: "0.5" },
          { path: "/contact", changefreq: "yearly", priority: "0.5" },
        ];

        try {
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const [jobs, posts] = await Promise.all([
            supabase.from("job_offers").select("slug, updated_at").eq("status", "published"),
            supabase.from("blog_posts").select("slug, updated_at").eq("status", "published"),
          ]);
          (jobs.data ?? []).forEach((j: any) => entries.push({ path: `/jobs/${j.slug}`, lastmod: j.updated_at, changefreq: "weekly", priority: "0.7" }));
          (posts.data ?? []).forEach((p: any) => entries.push({ path: `/blog/${p.slug}`, lastmod: p.updated_at, changefreq: "monthly", priority: "0.7" }));
        } catch (e) {
          console.error("[sitemap] dynamic entries failed", e);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
