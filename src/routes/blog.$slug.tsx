import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils-ext";
import { ShareButtons } from "@/components/site/ShareButtons";
import { Button } from "@/components/ui/button";

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
    const title = p ? `${p.title} — Blog EmploiPlus` : "Article — EmploiPlus Group";
    const description = p?.excerpt || p?.subtitle || p?.content?.slice(0, 160) || "Article EmploiPlus Group";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/blog/${params.slug}` },
        ...(p?.image ? [{ property: "og:image", content: p.image }, { name: "twitter:image", content: p.image }] : []),
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: p ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description,
          image: p.image ?? undefined,
          datePublished: p.publish_at ?? p.created_at,
          dateModified: p.updated_at,
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

  return (
    <article className="container-page py-10 md:py-14 max-w-4xl">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("nav.blog")}
      </Link>

      <header className="mt-8">
        {post.category && <div className="text-xs uppercase tracking-wider font-semibold text-brand mb-3">{post.category}</div>}
        <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">{post.title}</h1>
        {post.subtitle && <p className="mt-4 text-lg text-muted-foreground">{post.subtitle}</p>}
        <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          {t("common.publishedOn")} {formatDate(post.publish_at ?? post.created_at, locale)}
        </div>
      </header>

      {post.image && (
        <div className="mt-8 aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
          <img src={post.image} alt={post.title} className="size-full object-cover" />
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
  );
}
