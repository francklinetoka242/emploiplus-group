import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { usePublishedBlogPosts } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";
import { SectionHeader } from "@/components/page/SectionHeader";
import { PaginationNav } from "@/components/ui/pagination";
import { staggerContainer, staggerItem } from "@/lib/animations/animations";
import { ArrowRight, Star } from "lucide-react";

export function BlogPage() {
  const { t } = useI18n();
  const { posts, loading } = usePublishedBlogPosts(100);
  const featuredPosts = posts.filter((post) => post.is_featured);
  const featuredPost = featuredPosts[0];
  const regularPosts = posts.filter((post) => !post.is_featured);
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

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
        className="relative z-10 overflow-hidden bg-[#eef4ff] py-5 sm:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container-page relative z-10 max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Journal de l'Emploi</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("blog.title")}</h1>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-5 text-muted-foreground sm:block">{t("blog.subtitle")}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0">
              <article className="relative min-h-[280px] overflow-hidden rounded-xl bg-brand-deep shadow-sm sm:min-h-[340px]">
                {featuredPost?.image ? (
                  <img src={featuredPost.image} alt={featuredPost.title} className="absolute inset-0 h-full w-full object-cover opacity-75" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 max-w-3xl p-5 text-white sm:p-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  <Star className="h-3 w-3 fill-current" /> À la une
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
                    {featuredPost?.title || t("blog.title")}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs text-white/75">
                    {featuredPost?.excerpt || t("blog.subtitle")}
                  </p>
                  <Link
                    to={featuredPost ? `/blog/${featuredPost.slug}` : "/blog"}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-secondary"
                  >
                    Lire l'article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            </div>
            <aside className="rounded-xl bg-white/70 p-4 shadow-sm ring-1 ring-[#dfd0c2]">
              <h2 className="font-display text-lg font-bold text-foreground">Derniers articles</h2>
              <div className="mt-3 space-y-3">
                {posts.slice(0, 4).map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-3 border-b border-primary/15 pb-3 last:border-0 last:pb-0">
                    <div className="h-12 w-14 shrink-0 overflow-hidden rounded-md bg-primary/10">{post.image && <img src={post.image} alt="" className="h-full w-full object-cover" />}</div>
                    <div className="min-w-0"><p className="line-clamp-2 text-xs font-semibold leading-4 text-foreground">{post.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{post.publish_at ? new Date(post.publish_at).toLocaleDateString("fr-FR") : "Article"}</p></div>
                  </Link>
                ))}
              </div>
              <Link
                to="/blog"
                className="mt-4 inline-flex items-center text-sm font-semibold text-primary transition hover:text-brand-deep"
              >
                Voir plus <ArrowRight className="ml-1 size-4" />
              </Link>
            </aside>
          </div>
        </div>
      </motion.section>

      <section className="relative bg-background pb-16 pt-8 md:pb-24 md:pt-12">
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
            {featuredPosts.length > 1 ? (
              <motion.div 
                className="container-page mb-16 md:mb-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="max-w-full touch-pan-x overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <motion.div 
                    className="flex min-w-0 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    {featuredPosts.slice(1).map((post) => {
                      const canonical = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/blog/${post.slug}`;
                      return (
                        <motion.article
                          key={post.id}
                          className="flex min-w-[min(300px,calc(100vw-2.5rem))] shrink-0 flex-col overflow-hidden rounded-xl border border-primary/15 bg-white transition-shadow duration-300 hover:shadow-md sm:min-w-[320px]"
                          variants={staggerItem}
                        >
                          <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                            {post.image ? (
                                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-blue-950/85 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                                  <Star className="size-3.5 fill-current" aria-hidden="true" />
                                  À la une
                                </span>
                              </div>
                            ) : (
                              <div className="relative h-48 w-full bg-gradient-to-br from-secondary/20 to-brand/10">
                                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-blue-950/85 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                                  <Star className="size-3.5 fill-current" aria-hidden="true" />
                                  À la une
                                </span>
                              </div>
                            )}
                              <div className="flex flex-1 flex-col gap-3 p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {post.category && !["à la une", "a la une"].includes(post.category.trim().toLowerCase()) && (
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
                          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border/50 px-6 py-4">
                            <Link
                              to={`/blog/${post.slug}`}
                              className="inline-flex min-w-0 items-center gap-2 break-words text-sm font-semibold text-secondary transition hover:text-secondary/80"
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
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
                    Conseils pour avancer
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
                            className="flex h-full flex-col overflow-visible border-b border-border pb-6 transition-colors duration-300 hover:border-secondary/50"
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
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border/50 px-6 py-4">
                              <Link
                                to={`/blog/${post.slug}`}
                                className="inline-flex min-w-0 items-center gap-2 break-words text-sm font-semibold text-secondary transition hover:text-secondary/80"
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
                            className="flex h-full flex-col overflow-visible border-b border-border pb-6 transition-colors duration-300 hover:border-secondary/50"
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
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border/50 px-6 py-4">
                              <Link
                                to={`/blog/${post.slug}`}
                                className="inline-flex min-w-0 items-center gap-2 break-words text-sm font-semibold text-secondary transition hover:text-secondary/80"
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
                <PaginationNav
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="ml-auto"
                />
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
