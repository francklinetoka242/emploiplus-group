import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type BlogPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  og_image?: string | null;
  publish_at?: string | null;
};

const SITE_URL = "https://emploiplus-group.com";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function absoluteUrl(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = getQueryValue(req.query.slug);
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!slug || !supabaseUrl || !serviceRoleKey) {
    return res.status(404).send("Not found");
  }

  const query = new URLSearchParams({
    select: "slug,title,excerpt,content,image,og_image,publish_at",
    slug: `eq.${slug}`,
    status: "eq.published",
    limit: "1",
  });

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/blog_posts?${query.toString()}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    );

    if (!response.ok) {
      return res.status(404).send("Not found");
    }

    const posts = (await response.json()) as BlogPost[];
    const post = posts[0];
    if (!post) {
      return res.status(404).send("Not found");
    }

    const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
    const title = post.title || "Blog EmploiPlus";
    const description = (post.excerpt || post.content || "Articles, conseils carrière et actualités.")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
    const image = absoluteUrl(post.og_image || post.image, `${SITE_URL}/og-default.svg`);

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.status(200).send(`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)} | EmploiPlus Group</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)} | EmploiPlus Group">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:secure_url" content="${escapeHtml(image)}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="EmploiPlus Group">
    <meta property="og:locale" content="fr_FR">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)} | EmploiPlus Group">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
  </head>
  <body></body>
</html>`);
  } catch {
    return res.status(404).send("Not found");
  }
}
