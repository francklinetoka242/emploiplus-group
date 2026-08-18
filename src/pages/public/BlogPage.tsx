import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { usePublishedBlogPosts } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";
import { SectionHeader } from "@/components/page/SectionHeader";
import { staggerContainer, staggerItem } from "@/lib/animations/animations";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        title={t("blog.title")}
        description={t("blog.subtitle")}
        keywords="blog, articles, conseils carrière, actualités emploi, recrutement"
        canonical={`${BASE_URL}/blog`}
        robots="index,follow"
        ogType="website"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("blog.title"), url: `${BASE_URL}/blog` },
        ]}
      />
      <motion.section 
        className="relative z-10 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 md:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand rounded-full filter blur-3xl" />
        </div>
        <div className="container-page relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">
              {t("blog.title")}
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              {t("blog.title")}
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl">
              {t("blog.subtitle")}
            </p>
            <div className="mt-8 flex items-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-secondary" />
                <span>{posts.length} articles</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="relative bg-white pt-16 pb-20 md:pt-20 md:pb-28">
        {loading ? (
          <div className="container-page">
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : posts.length > 0 ? (
          <>
            {featuredPosts.length > 0 ? (
              <motion.div 
                className="container-page mb-16 md:mb-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">
                    Sélection éditoriale
                  </span>
                  <h2 className="mt-4 font-display text-3xl font-bold text-foreground">
                    Articles mis en avant
                  </h2>
                  <p className="mt-2 text-slate-600">Nos derniers contenus pour vous accompagner dans votre carrière</p>
                </div>
                <div className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <motion.div 
                    className="flex gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    {featuredPosts.map((post) => {
                      const canonical = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/blog/${post.slug}`;
                      return (
                        <motion.article
                          key={post.id}
                          className="flex min-w-[360px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-3 hover:shadow-lg hover:border-secondary/30"
                          variants={staggerItem}
                        >
                          <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                            {post.image ? (
                              <div className="h-48 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              </div>
                            ) : (
                              <div className="h-48 w-full bg-gradient-to-br from-secondary/20 to-brand/10" />
                            )}
                            <div className="flex flex-1 flex-col gap-4 p-6">
                              <div className="flex flex-wrap items-center gap-2">
                                {post.category && (
                                  <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                                    {post.category}
                                  </span>
                                )}
                                {post.publish_at && (
                                  <span className="text-xs text-slate-500">{new Date(post.publish_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                )}
                              </div>
                              <h3 className="font-display text-lg font-bold text-foreground line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                                {post.excerpt || t("blog.article.placeholder")}
                              </p>
                            </div>
                          </Link>
                          <div className="flex items-center justify-between gap-3 border-t border-border/50 px-6 py-4">
                            <Link
                              to={`/blog/${post.slug}`}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-secondary/80"
                            >
                              Lire l'article
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
                        </motion.article>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            ) : null}

            <div className="bg-gradient-to-b from-white via-slate-50 to-white py-4">
              <motion.div 
                className="container-page"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-semibold text-slate-600">
                    Tous les articles
                  </span>
                  <h2 className="mt-4 font-display text-3xl font-bold text-foreground">
                    Ressources et conseils
                  </h2>
                </div>
                <motion.div 
                  className="grid gap-6 md:grid-cols-3"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                >
                  {regularPosts.length > 0
                    ? paginatedPosts.map((post, i) => {
                        const canonical = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/blog/${post.slug}`;
                        return (
                          <motion.article
                            key={post.id}
                            className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
                            variants={staggerItem}
                          >
                            <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                              {post.image ? (
                                <div className="h-48 w-full overflow-hidden bg-slate-100">
                                  <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                </div>
                              ) : (
                                <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-50" />
                              )}
                              <div className="flex flex-1 flex-col p-6">
                                <div className="flex flex-wrap items-center gap-2">
                                  {post.category && (
                                    <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                                      {post.category}
                                    </span>
                                  )}
                                  {post.publish_at && (
                                    <span className="text-xs text-slate-500">{new Date(post.publish_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  )}
                                </div>
                                <h3 className="mt-3 font-display text-lg font-bold text-foreground line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="mt-3 flex-1 text-sm text-slate-600 leading-relaxed line-clamp-3">
                                  {post.excerpt || t("blog.article.placeholder")}
                                </p>
                              </div>
                            </Link>
                            <div className="flex items-center justify-between gap-3 border-t border-border/50 px-6 py-4">
                              <Link
                                to={`/blog/${post.slug}`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-secondary/80"
                              >
                                Lire l'article
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
                          </motion.article>
                        );
                      })
                    : posts.map((post, i) => {
                        const canonical = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/blog/${post.slug}`;
                        return (
                          <motion.article
                            key={post.id}
                            className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
                            variants={staggerItem}
                          >
                            <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                              {post.image ? (
                                <div className="h-48 w-full overflow-hidden bg-slate-100">
                                  <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                </div>
                              ) : (
                                <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-50" />
                              )}
                              <div className="flex flex-1 flex-col p-6">
                                <div className="flex flex-wrap items-center gap-2">
                                  {post.category && (
                                    <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                                      {post.category}
                                    </span>
                                  )}
                                  {post.publish_at && (
                                    <span className="text-xs text-slate-500">{new Date(post.publish_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  )}
                                </div>
                                <h3 className="mt-3 font-display text-lg font-bold text-foreground line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="mt-3 flex-1 text-sm text-slate-600 leading-relaxed line-clamp-3">
                                  {post.excerpt || t("blog.article.placeholder")}
                                </p>
                              </div>
                            </Link>
                            <div className="flex items-center justify-between gap-3 border-t border-border/50 px-6 py-4">
                              <Link
                                to={`/blog/${post.slug}`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-secondary/80"
                              >
                                Lire l'article
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
                          </motion.article>
                        );
                      })}
                </motion.div>
              </motion.div>
            </div>

            {regularPosts.length > pageSize ? (
              <motion.div 
                className="container-page mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 px-6 py-4 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{safePage}</span> sur <span className="font-semibold text-foreground">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={safePage === 1}
                    className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-sm font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-50 hover:border-secondary"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={safePage === totalPages}
                    className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-sm font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-50 hover:border-secondary"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </>
        ) : (
          <motion.div 
            className="container-page rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-muted-foreground">{t("blog.empty")}</p>
          </motion.div>
        )}
      </section>
    </>
  );
}
