import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils-ext";
import { ShareButtons } from "@/components/site/ShareButtons";
import { Button } from "@/components/ui/button";
import { BlogSidebar } from "@/components/site/BlogSidebar";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) throw notFound();
    return { post: data };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const title = p?.meta_title || (p ? `${p.title} — Blog EmploiPlus` : "Article — EmploiPlus Group");
    const description = p?.meta_description || p?.excerpt || p?.subtitle || p?.content?.slice(0, 160) || "Article EmploiPlus Group";
    const image = p?.og_image || p?.image;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/blog/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: p ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description,
          image: image ?? undefined,
          datePublished: p.publish_at ?? p.created_at,
          dateModified: p.updated_at,
          author: { "@type": "Organization", name: "EmploiPlus Group" },
          publisher: { "@type": "Organization", name: "EmploiPlus Group" },
        }),
      }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Article introuvable</h1>
      <Button asChild className="mt-6"><Link to="/blog">Retour au blog</Link></Button>
    </div>
  ),
  errorComponent: () => (
    <div className="container-page py-24 text-center"><p className="text-muted-foreground">Erreur de chargement.</p></div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const { t, locale } = useI18n();
  const pageUrl = typeof window !== "undefined" ? window.location.href : `/blog/${post.slug}`;

  useEffect(() => {
    supabase.from("blog_posts").update({ views_count: (post.views_count ?? 0) + 1 }).eq("id", post.id).then(() => {});
  }, [post.id]);

  return (
    <div className="container-page py-10 md:py-14">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("nav.blog")}
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10 mt-6">
        <article className="max-w-3xl">
          <header>
            {post.category && <div className="text-xs uppercase tracking-wider font-semibold text-brand mb-3">{post.category}</div>}
            <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">{post.title}</h1>
            {post.subtitle && <p className="mt-4 text-lg text-muted-foreground">{post.subtitle}</p>}
            <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {formatDate(post.publish_at ?? post.created_at, locale)}</span>
              {post.reading_time ? <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {post.reading_time} min</span> : null}
            </div>
          </header>

          {post.image && (
            <div className="mt-8 aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
              <img src={post.image} alt={post.title} className="size-full object-cover" decoding="async" />
            </div>
          )}

          {post.video_url && (
            <div className="mt-8 aspect-video rounded-2xl overflow-hidden bg-black">
              <iframe src={post.video_url} title={post.title} className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}

          <div className="mt-10 prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-foreground/90 leading-relaxed text-base md:text-lg">{post.content}</div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-xs">#{tag}</span>
              ))}
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-border">
            <div className="text-sm font-semibold mb-3">{t("cta.share")}</div>
            <ShareButtons url={pageUrl} text={post.title} />
          </div>
        </article>

        <BlogSidebar />
      </div>
    </div>
  );
}
