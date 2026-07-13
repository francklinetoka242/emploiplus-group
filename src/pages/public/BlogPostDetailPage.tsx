import React from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { useBlogPostBySlug } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";

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

  if (loading) {
    return (
      <div className="container-page py-20 md:py-28">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <p className="text-muted-foreground">{t("blog.loading")}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <NotFoundPage />;
  }

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || t("blog.subtitle");
  const ogImage = post.og_image || post.image || `${BASE_URL}/og-default.svg`;
  const canonical = `${BASE_URL}/blog/${post.slug}`;

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
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <main className="space-y-8">
            <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              {post.image ? (
                <div className="h-72 w-full overflow-hidden bg-slate-100 md:h-[420px]">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="p-8">
                <div className="flex flex-col gap-3">
                  <Link to="/blog" className="text-sm text-brand hover:underline">
                    ← {t("blog.backToList")}
                  </Link>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {post.category && <span>{post.category}</span>}
                      {post.publish_at && (
                        <span>{new Date(post.publish_at).toLocaleDateString()}</span>
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
                  <h1 className="font-display text-4xl font-bold text-foreground">{post.title}</h1>
                  {post.excerpt ? (
                    <p className="mt-4 max-w-3xl text-lg text-foreground/80 leading-relaxed">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("blog.article.content")}
              </h2>
              <div className="mt-6 space-y-6 text-foreground/90 leading-relaxed whitespace-pre-line max-w-none">
                <p>{post.content}</p>
              </div>
            </article>
          </main>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {t("blog.article.information")}
              </p>
              <div className="mt-6 space-y-4 text-sm text-foreground/90">
                {post.category ? (
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">
                      {t("blog.article.category")} :
                    </span>
                    <span>{post.category}</span>
                  </div>
                ) : null}
                {post.publish_at ? (
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">
                      {t("blog.article.publishedAt")} :
                    </span>
                    <span>{new Date(post.publish_at).toLocaleDateString()}</span>
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
