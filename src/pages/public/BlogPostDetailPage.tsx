import React from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { EcoImage } from '@/components/EcoImage';
import { BASE_URL } from "@/features/seo";
import { useBlogPostBySlug } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";

function NotFoundPage() {
  return (
    <>
      <SEO
        title={"Page non trouvée - 404"}
        description={"La page que vous recherchez n'existe pas ou a été supprimée."}
        canonical={`${BASE_URL}/404`}
        robots="noindex,nofollow"
      />
      <div className="container-page py-20 md:py-28">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
          <p className="mt-4 text-muted-foreground">Page introuvable.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
}

export function BlogPostDetailPage() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const { post, loading } = useBlogPostBySlug(slug);

  const canonical = slug ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/blog`;
  const title = post?.meta_title || post?.title || "Blog - EmploiPlus Group";
  const description = post?.meta_description || post?.excerpt || t("blog.subtitle");
  const ogImage = post?.og_image || post?.image || `${BASE_URL}/og-default.svg`;
  const blogPostingStructuredData = post
    ? {
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image: post.image || post.og_image || ogImage,
        datePublished: post.publish_at || undefined,
        author: {
          "@type": "Organization",
          name: "EmploiPlus Group",
        },
        publisher: {
          "@type": "Organization",
          name: "EmploiPlus Group",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/logo.png`,
          },
        },
        mainEntityOfPage: canonical,
      }
    : undefined;

  if (loading) {
    return (
      <>
        <SEO
          title={title}
          description={description}
          canonical={canonical}
          robots="index,follow"
          ogImage={ogImage}
          ogType="article"
          structuredData={blogPostingStructuredData}
        />
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <p className="text-muted-foreground">{t("blog.loading")}</p>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return <NotFoundPage />;
  }

  const canonicalPost = `${BASE_URL}/blog/${post.slug}`;
  const blogPostingStructuredDataPost = {
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.image || post.og_image || ogImage,
    datePublished: post.publish_at || undefined,
    author: {
      "@type": "Organization",
      name: "EmploiPlus Group",
    },
    publisher: {
      "@type": "Organization",
      name: "EmploiPlus Group",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: canonicalPost,
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        robots="index,follow"
        ogImage={ogImage}
        ogType={"article"}
        publishedTime={post.publish_at || undefined}
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("blog.title"), url: `${BASE_URL}/blog` },
          { name: post.title, url: canonical },
        ]}
        structuredData={blogPostingStructuredDataPost}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <main className="space-y-8">
            <article className="overflow-visible rounded-[28px] border border-border bg-card shadow-soft">
              {post.image ? (
                <div className="relative h-56 w-full overflow-hidden rounded-t-[28px] bg-slate-100 sm:h-72 md:h-[360px]">
                  <EcoImage
                    src={post.image}
                    alt={post.title}
                    width={1200}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
                </div>
              ) : null}
              <div className="p-6 sm:p-8 md:p-10">
                <div className="flex flex-col gap-3">
                  <Link
                    to="/blog"
                    className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand/75"
                  >
                    <ArrowLeft className="size-4" />
                    {t("blog.backToList")}
                  </Link>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border/70 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {post.category ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-brand">
                          <Tag className="size-3.5" />
                          {post.category}
                        </span>
                      ) : null}
                      {post.publish_at && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          {new Date(post.publish_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    <ShareButtons
                      url={canonical}
                      text={post.title}
                      variant="compact"
                      shareData={{
                        title: post.title,
                        description: post.excerpt || post.content,
                      }}
                    />
                  </div>
                  <h1 className="max-w-4xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
                    {post.title}
                  </h1>
                  {post.excerpt ? (
                    <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-border bg-card p-6 shadow-soft sm:p-8 md:p-10">
              <h2 className="border-l-4 border-brand pl-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {t("blog.article.content")}
              </h2>
              <div className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-foreground/85 sm:text-lg sm:leading-9">
                {post.content}
              </div>
            </article>
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[24px] border border-brand/15 bg-card p-6 shadow-soft sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                {t("blog.article.information")}
              </p>
              <div className="mt-5 space-y-4 text-sm leading-6 text-foreground/90">
                {post.category ? (
                  <div className="flex items-start gap-2">
                    <Tag className="mt-1 size-4 shrink-0 text-brand" />
                    <span>
                      <span className="font-semibold text-foreground">
                      {t("blog.article.category")} :
                      </span>{" "}
                      {post.category}
                    </span>
                  </div>
                ) : null}
                {post.publish_at ? (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-1 size-4 shrink-0 text-brand" />
                    <span>
                      <span className="font-semibold text-foreground">
                        {t("blog.article.publishedAt")} :
                      </span>{" "}
                      {new Date(post.publish_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ) : null}
                {post.tags && post.tags.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-foreground">
                      {t("blog.article.tags")} :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(post.tags as string[]).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {post.external_link || post.video_url ? (
              <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                  {t("blog.article.resources")}
                </p>
                <div className="mt-6 space-y-4 text-sm text-foreground/90">
                  {post.external_link ? (
                    <a
                      href={post.external_link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-border/80 bg-background px-4 py-3 text-brand transition hover:bg-brand/5"
                    >
                      {t("blog.article.externalLink")}
                    </a>
                  ) : null}
                  {post.video_url ? (
                    <a
                      href={post.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-border/80 bg-background px-4 py-3 text-brand transition hover:bg-brand/5"
                    >
                      {t("blog.article.watchVideo")}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
