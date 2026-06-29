import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { PageHeading } from "@/components/page/PageHeading";
import { usePublishedBlogPosts } from "@/hooks/usePublishedOffers";

export function BlogPage() {
  const { t } = useI18n();
  const { posts, loading } = usePublishedBlogPosts(9);

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
      <PageHeading
        title={t('blog.title')}
        description={t('blog.subtitle')}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-6 md:grid-cols-3">
          {loading ? (
            [1, 2, 3].map((index) => (
              <article key={index} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse" />
            ))
          ) : posts.length > 0 ? (
            posts.map((post, i) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elev group-hover:border-brand" style={{ animationDelay: `${i * 80}ms` }}>
                  {post.image ? (
                    <div className="h-48 w-full overflow-hidden bg-slate-100">
                      <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-slate-100" />
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {post.category && <span>{post.category}</span>}
                      {post.publish_at && (
                        <span>{new Date(post.publish_at).toLocaleDateString()}</span>
                      )}
                      {post.is_featured ? <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">À la une</span> : null}
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold text-foreground">{post.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed min-h-[4.5rem]">{post.excerpt || t('blog.article.placeholder')}</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-brand">{t('blog.readMore') || 'Lire la suite'} →</span>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t('blog.empty')}</div>
          )}
        </div>
      </section>
    </>
  );
}
