import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { usePublishedBlogPosts } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";

export function BlogPage() {
  const { t } = useI18n();
  const { posts, loading } = usePublishedBlogPosts(100);
  const featuredPosts = posts.filter((post) => post.is_featured);
  const regularPosts = posts.filter((post) => !post.is_featured);
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  React.useEffect(() => {
    setPage(1);
  }, [posts.length]);

  const totalPages = Math.max(1, Math.ceil(regularPosts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedPosts = regularPosts.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <SEO
        title={t('blog.title')}
        description={t('blog.subtitle')}
        keywords="blog, articles, conseils carrière, actualités emploi, recrutement"
        canonical={`${BASE_URL}/blog`}
        robots="index,follow"
        ogType="website"
        breadcrumbs={[
          { name: t('home.hero.title'), url: `${BASE_URL}/` },
          { name: t('blog.title'), url: `${BASE_URL}/blog` },
        ]}
      />
      <section className="container-page pt-8 pb-20 md:pt-10 md:pb-28">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <article key={index} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            {featuredPosts.length > 0 ? (
              <div className="mb-10 rounded-[2rem] border border-orange-200 bg-orange-50/80 p-4 shadow-soft md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">À la une</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Articles mis en avant</h2>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {featuredPosts.map((post) => {
                      const canonical = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/blog/${post.slug}`;
                      return (
                        <article key={post.id} className="flex h-full min-w-[280px] flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-orange-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-elev md:min-w-[320px]">
                          <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                            {post.image ? (
                              <div className="h-40 w-full overflow-hidden bg-slate-100">
                                <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                              </div>
                            ) : (
                              <div className="h-40 w-full bg-slate-100" />
                            )}
                            <div className="flex flex-1 flex-col p-5">
                              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                                {post.category && <span>{post.category}</span>}
                                {post.publish_at && <span>{new Date(post.publish_at).toLocaleDateString()}</span>}
                              </div>
                              <h3 className="mt-3 font-display text-lg font-bold text-foreground">{post.title}</h3>
                              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt || t('blog.article.placeholder')}</p>
                            </div>
                          </Link>
                          <div className="flex items-center justify-between gap-3 border-t border-orange-100 px-5 py-4">
                            <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:underline">
                              {t('blog.readMore') || 'Lire la suite'}
                              <span aria-hidden="true">→</span>
                            </Link>
                            <ShareButtons
                              url={canonical}
                              text={post.title}
                              variant="compact"
                              shareData={{
                                title: post.title,
                                description: post.excerpt || post.title,
                                image: post.image,
                              }}
                            />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 md:grid-cols-3">
              {regularPosts.length > 0 ? (
                paginatedPosts.map((post, i) => {
                  const canonical = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/blog/${post.slug}`;
                  return (
                    <article key={post.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elev group-hover:border-brand" style={{ animationDelay: `${i * 80}ms` }}>
                      <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                        {post.image ? (
                          <div className="h-48 w-full overflow-hidden bg-slate-100">
                            <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                          </div>
                        ) : (
                          <div className="h-48 w-full bg-slate-100" />
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            {post.category && <span>{post.category}</span>}
                            {post.publish_at && <span>{new Date(post.publish_at).toLocaleDateString()}</span>}
                          </div>
                          <h3 className="mt-4 font-display text-xl font-bold text-foreground">{post.title}</h3>
                          <p className="mt-3 flex-1 text-muted-foreground leading-relaxed">{post.excerpt || t('blog.article.placeholder')}</p>
                        </div>
                      </Link>
                      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-6 py-4">
                        <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:underline">
                          {t('blog.readMore') || 'Lire la suite'}
                          <span aria-hidden="true">→</span>
                        </Link>
                        <ShareButtons
                          url={canonical}
                          text={post.title}
                          variant="compact"
                          shareData={{
                            title: post.title,
                            description: post.excerpt || post.title,
                            image: post.image,
                          }}
                        />
                      </div>
                    </article>
                  );
                })
              ) : (
                posts.map((post, i) => {
                  const canonical = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/blog/${post.slug}`;
                  return (
                    <article key={post.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elev group-hover:border-brand" style={{ animationDelay: `${i * 80}ms` }}>
                      <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                        {post.image ? (
                          <div className="h-48 w-full overflow-hidden bg-slate-100">
                            <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                          </div>
                        ) : (
                          <div className="h-48 w-full bg-slate-100" />
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            {post.category && <span>{post.category}</span>}
                            {post.publish_at && <span>{new Date(post.publish_at).toLocaleDateString()}</span>}
                          </div>
                          <h3 className="mt-4 font-display text-xl font-bold text-foreground">{post.title}</h3>
                          <p className="mt-3 flex-1 text-muted-foreground leading-relaxed">{post.excerpt || t('blog.article.placeholder')}</p>
                        </div>
                      </Link>
                      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-6 py-4">
                        <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:underline">
                          {t('blog.readMore') || 'Lire la suite'}
                          <span aria-hidden="true">→</span>
                        </Link>
                        <ShareButtons
                          url={canonical}
                          text={post.title}
                          variant="compact"
                          shareData={{
                            title: post.title,
                            description: post.excerpt || post.title,
                            image: post.image,
                          }}
                        />
                      </div>
                    </article>
                  );
                })
              )}
            </div>
            {regularPosts.length > pageSize ? (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {safePage} sur {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={safePage === 1}
                    className="rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={safePage === totalPages}
                    className="rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t('blog.empty')}</div>
        )}
      </section>
    </>
  );
}
