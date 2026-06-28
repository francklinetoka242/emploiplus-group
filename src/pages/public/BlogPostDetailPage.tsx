import React from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { useBlogPostBySlug } from "@/hooks/usePublishedOffers";

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
          <Link to="/" className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
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
          <p className="text-muted-foreground">{t('blog.loading')}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <NotFoundPage />;
  }

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || t('blog.subtitle');
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
        ogType={'article'}
        publishedTime={post.publish_at || undefined}
        breadcrumbs={[
          { name: t('home.hero.title'), url: `${BASE_URL}/` },
          { name: t('blog.title'), url: `${BASE_URL}/blog` },
          { name: post.title, url: canonical },
        ]}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <div className="flex flex-col gap-3">
                <Link to="/blog" className="text-sm text-brand hover:underline">← {t('blog.backToList')}</Link>
                <h1 className="font-display text-4xl font-bold text-foreground">{post.title}</h1>
                {post.category ? <p className="text-sm text-muted-foreground">{post.category}</p> : null}
                {post.publish_at ? <p className="text-sm text-muted-foreground">{new Date(post.publish_at).toLocaleDateString()}</p> : null}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">{t('blog.article.content')}</h2>
                <p className="mt-4 text-foreground/90 leading-relaxed whitespace-pre-line">{post.content}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            {post.image ? (
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
                <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
              </div>
            ) : null}

            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t('blog.article.information')}</p>
              <div className="mt-6 space-y-3 text-sm text-foreground/90">
                {post.category ? <div><span className="font-semibold">{t('blog.article.category')} :</span> {post.category}</div> : null}
                {post.publish_at ? <div><span className="font-semibold">{t('blog.article.publishedAt')} :</span> {new Date(post.publish_at).toLocaleDateString()}</div> : null}
                {post.tags && post.tags.length > 0 ? <div><span className="font-semibold">{t('blog.article.tags')} :</span> {(post.tags as string[]).join(', ')}</div> : null}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
