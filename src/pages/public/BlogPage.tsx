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
                <article className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up group-hover:border-brand" style={{ animationDelay: `${i * 80}ms` }}>
                  <h3 className="font-display text-xl font-bold text-foreground">{post.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{post.excerpt || t('blog.article.placeholder')}</p>
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
