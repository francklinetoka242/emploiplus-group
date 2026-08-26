import React from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { EcoImage } from "@/components/EcoImage";
import { BASE_URL } from "@/features/seo";
import { useBlogPostBySlug, usePublishedBlogPosts } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";
import { BlogPostDetailSkeleton } from "@/components/ui/skeletons";
import { ArrowLeft, ArrowRight, CalendarDays, Tag } from "lucide-react";

function NotFoundPage() {
  return (
    <>
      <SEO
        title={"Page non trouvée - 404"}
        description={"La page que vous recherchez n'existe pas ou a été supprimée."}
        canonical={`${BASE_URL}/404`}
        robots="noindex,nofollow"
      />
      <div className="bg-[#eef4ff] px-4 py-16 sm:px-6 md:py-24">
        <div className="container-page rounded-xl border border-primary/15 bg-white p-10 text-center shadow-sm">
          <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
          <p className="mt-4 text-muted-foreground">Page introuvable.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
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
  const { posts: latestPosts } = usePublishedBlogPosts(5);

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
        <BlogPostDetailSkeleton />
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
      <section className="bg-[#eef4ff] px-4 pb-16 pt-2 sm:px-6 md:pb-24">
        <div className="container-page grid min-h-0 min-w-0 gap-6 lg:h-[calc(100vh-9rem)] lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
          <aside className="order-2 min-w-0 space-y-4 lg:order-2 lg:pr-1">
            <section className="rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-primary/20">
              <h2 className="font-display text-lg font-bold text-foreground">Derniers articles</h2>
              <div className="mt-3 space-y-3">
                {latestPosts
                  .filter((latestPost) => latestPost.slug !== post.slug)
                  .slice(0, 4)
                  .map((latestPost) => (
                    <Link
                      key={latestPost.id}
                      to={`/blog/${latestPost.slug}`}
                      className="flex gap-3 border-b border-primary/15 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="h-12 w-14 shrink-0 overflow-hidden rounded-md bg-primary/10">
                        {latestPost.image ? (
                          <img
                            src={latestPost.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-semibold leading-4 text-foreground">
                          {latestPost.title}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {latestPost.publish_at
                            ? new Date(latestPost.publish_at).toLocaleDateString("fr-FR")
                            : "Article"}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
              <Link
                to="/blog"
                className="mt-4 inline-flex items-center text-sm font-semibold text-primary transition hover:text-brand-deep"
              >
                Voir plus <ArrowRight className="ml-1 size-4" />
              </Link>
            </section>

            <section className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00009e]">
                {t("blog.article.information")}
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-foreground/80">
                {post.category ? (
                  <div className="flex items-start gap-2">
                    <Tag className="mt-1 size-4 shrink-0 text-secondary" />
                    <span>
                      <strong>{t("blog.article.category")} :</strong> {post.category}
                    </span>
                  </div>
                ) : null}
                {post.publish_at ? (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-1 size-4 shrink-0 text-secondary" />
                    <span>
                      <strong>{t("blog.article.publishedAt")} :</strong>{" "}
                      {new Date(post.publish_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ) : null}
                {post.tags && post.tags.length > 0 ? (
                  <div>
                    <strong>{t("blog.article.tags")} :</strong>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(post.tags as string[]).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
            <section className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Partager l'article</p>
              <div className="mt-3">
                <ShareButtons
                  url={canonical}
                  text={post.title}
                  variant="compact"
                  showQuickActions
                  shareData={{ title: post.title, description: post.excerpt || post.content }}
                />
              </div>
            </section>
          </aside>

          <main className="order-1 min-h-0 min-w-0 space-y-6 overflow-y-auto lg:order-1 lg:pr-1">
            <article className="relative min-h-[300px] overflow-hidden rounded-xl bg-[#000079] shadow-sm sm:min-h-[380px]">
              {post.image ? (
                <EcoImage
                  src={post.image}
                  alt={post.title}
                  width={1200}
                  height={720}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 max-w-3xl p-5 text-white sm:p-8">
                <h1 className="font-display text-xl font-bold leading-tight sm:text-3xl">
                  {post.title}
                </h1>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/75">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {post.publish_at ? new Date(post.publish_at).toLocaleDateString("fr-FR") : ""}
                </div>
              </div>
            </article>
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#00009e] transition hover:text-[#000079]"
              >
                <ArrowLeft className="size-4" /> {t("blog.backToList")}
              </Link>
            </div>
            {post.excerpt ? (
              <p className="rounded-xl border border-primary/15 bg-white p-5 text-base leading-7 text-foreground/80 shadow-sm sm:p-7">
                {post.excerpt}
              </p>
            ) : null}
            <article className="min-w-0 rounded-xl border border-primary/15 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-primary/10 pb-4">
                <span className="h-8 w-1 rounded-full bg-secondary" />
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {t("blog.article.content")}
                </h2>
              </div>
              <div className="max-w-3xl break-words whitespace-pre-line text-base leading-8 text-foreground/80 [overflow-wrap:anywhere] sm:text-[17px] [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h1]:mb-5 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-foreground [&_h2]:mb-4 [&_h2]:mt-9 [&_h2]:border-b [&_h2]:border-primary/10 [&_h2]:pb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </article>
            {post.external_link || post.video_url ? (
              <section className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#00009e]">
                  {t("blog.article.resources")}
                </p>
                <div className="mt-4 space-y-2">
                  {post.external_link ? (
                    <a
                      href={post.external_link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-primary hover:bg-primary/10"
                    >
                      {t("blog.article.externalLink")}
                    </a>
                  ) : null}
                  {post.video_url ? (
                    <a
                      href={post.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-primary hover:bg-primary/10"
                    >
                      {t("blog.article.watchVideo")}
                    </a>
                  ) : null}
                </div>
              </section>
            ) : null}
          </main>
        </div>
      </section>
    </>
  );
}
