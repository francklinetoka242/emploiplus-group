import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { useEcoMode } from '@/contexts/EcoModeContext';
import logoMonago from "@/assets/logo-monago.jpg";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { DEFAULT_SEO, BASE_URL } from "@/features/seo";
import { SectionHeader } from "@/components/page/SectionHeader";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { usePublishedJobOffers, usePublishedBlogPosts } from "@/features/jobs/hooks";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations/animations";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Sparkles,
  BarChart3,
  Handshake,
  BookOpen,
} from "lucide-react";
import { ShareButtons } from "@/components/site/ShareButtons";
import { JobCard } from "@/features/jobs/components";

function HeroSection() {
  const { isEcoMode } = useEcoMode();
  const { t } = useI18n();

  if (isEcoMode) {
    return (
      <section className="relative overflow-hidden min-h-[400px] md:min-h-[420px] bg-slate-100">
        <div className="relative z-10 container-page py-20 md:py-28">
          <div className="grid items-center gap-12">
            <div>
              <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-primary/10">
                {t("home.hero.eyebrow")}
              </p>
              <h1 className="mt-8 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                {t("home.hero.title")}
              </h1>
              <p className="mt-6 max-w-2xl text-base text-slate-700 leading-relaxed">
                {t("home.hero.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="relative overflow-hidden min-h-[600px] md:min-h-[700px] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.65),rgba(2,6,23,0.9))]" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container-page py-20 md:py-28">
        <div className="grid items-center gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p
              className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-primary/10"
              variants={fadeUp}
              transition={{ duration: 0.45 }}
            >
              {t("home.hero.eyebrow")}
            </motion.p>
            <motion.h1
              className="mt-8 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white"
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              {t("home.hero.title")}
            </motion.h1>
            <motion.p
              className="mt-6 max-w-2xl text-base text-white/90 leading-relaxed"
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              {t("home.hero.subtitle")}
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap gap-3"
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.24 }}
            >
              <Button asChild size="lg" className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
                <Link to="/jobs">{t("home.hero.cta.jobs")}</Link>
              </Button>
              <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90 shadow-lg">
                <Link to="/services">{t("home.hero.cta.services")}</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function AnimatedStat({
  value,
  label,
  t,
}: {
  value: string;
  label: string;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      className="rounded-xl overflow-hidden transform"
      variants={fadeUp}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="rounded-xl bg-card p-8 text-center shadow-sm ring-1 ring-border/80">
        <div className="text-4xl font-display font-extrabold text-foreground">
          <AnimatedCounter value={value} />
        </div>
        <div className="mt-3 text-sm text-muted-foreground">{t(label)}</div>
      </div>
    </motion.div>
  );
}

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { offers: homeJobs, loading: jobsLoading } = usePublishedJobOffers(2);
  const { posts: homePosts, loading: postsLoading } = usePublishedBlogPosts(3);

  const getContractLabel = (contractType?: string | null) => {
    if (!contractType) return null;
    const translated = t(`jobs.contract.${contractType}`);
    if (translated && translated !== `jobs.contract.${contractType}`) return translated;
    const fallbackMap: Record<string, string> = {
      cdi: "CDI",
      cdd: "CDD",
      stage: "Stage",
      freelance: "Freelance",
      prestation_de_services: "Prestation de services",
      consultance: "Consultance",
      temps_partiel: "Temps partiel",
      interim: "Intérim",
    };
    return fallbackMap[contractType] || contractType;
  };

  const stats = [
    { value: "1200+", label: "home.stats.jobs", icon: <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-secondary" /> },
    { value: "1", label: "home.stats.companies", icon: <Handshake className="h-8 w-8 md:h-10 md:w-10 text-secondary" /> },
    { value: "455+", label: "home.stats.readers", icon: <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-secondary" /> },
  ];

  const services = [
    {
      heading: "Candidat",
      title: "Un parcours candidat fluide et efficace",
      description:
        "Explorez les offres, préparez votre profil et postulez en quelques étapes. Tout est pensé pour gagner du temps et vous mettre en valeur.",
      bullets: [
        "Matching intelligent adapté à votre profil",
        "Offres recommandées et mises à jour",
        "Candidature express en quelques clics",
        "Outils de visibilité professionnelle",
      ],
      link: {
        href: "/services/hub-candidat-intelligent",
        label: "Découvrir l'espace candidat",
      },
    },
    {
      heading: "Entreprise",
      title: "Une solution RH professionnelle et sur mesure",
      description:
        "Externalisation métier, délégation et pilotage opérationnel pour faire évoluer votre organisation avec sérénité.",
      bullets: [
        "Cadrage précis des besoins RH",
        "Ressources qualifiées et opérationnelles",
        "Pilotage continu et reporting clair",
        "Valorisation de la performance RH",
      ],
      link: {
        href: "/services/solutions-entreprises-bpo",
        label: "Découvrir nos solutions",
      },
    },
  ];

  return (
    <div className="bg-background">
      <SEO {...DEFAULT_SEO} />
      <HeroSection />

      <motion.section 
        className="container-page py-16 md:py-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="rounded-[28px] border border-secondary/15 bg-gradient-to-br from-secondary/8 via-card to-card p-6 md:p-10 shadow-sm"
          whileInView={{ boxShadow: "0 18px 40px rgba(232,169,0,0.06)" }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid gap-6 lg:items-center">
            <motion.div 
              className="grid gap-4 sm:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {stats.map((item, i) => (
                <motion.div 
                  key={item.label} 
                  variants={staggerItem}
                  className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-border bg-card/80 p-5"
                >
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-center">{item.icon}</div>
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary/40" />
                  </motion.div>
                  <motion.p 
                    className="font-display text-2xl md:text-3xl font-extrabold text-secondary"
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {item.value}
                  </motion.p>
                  <motion.p 
                    className="text-sm md:text-base font-semibold text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.1 }}
                  >
                    {t(item.label)}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        className="relative z-30 overflow-visible bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container-page pt-0 pb-20 md:pb-24">
          <motion.div className="flex flex-wrap items-end justify-between gap-4 mb-10" variants={fadeUp}>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">
                {t("home.blog.title")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("home.blog.subtitle")}</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/blog">{t("home.blog.viewAll")}</Link>
            </Button>
          </motion.div>
          <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
            {postsLoading ? (
              [1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  className="rounded-3xl border border-border bg-card/95 p-6 shadow-soft animate-pulse"
                  variants={staggerItem}
                />
              ))
            ) : homePosts.length > 0 ? (
              homePosts.map((post, i) => {
                const canonical = `${BASE_URL}/blog/${post.slug}`;
                const previewText = (post.excerpt || t("blog.article.placeholder"))
                  .replace(/\s+/g, " ")
                  .trim();
                const displayText =
                  previewText.length > 140 ? `${previewText.slice(0, 137)}...` : previewText;
                return (
                  <motion.article
                    key={post.id}
                    className="relative z-30 flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all duration-300 hover:shadow-elev group-hover:border-brand"
                    variants={staggerItem}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link to={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
                      {post.image ? (
                        <div className="h-48 w-full overflow-hidden bg-slate-100">
                          <img
                            src={post.image}
                            alt={post.title}
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-slate-100" />
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        {post.is_featured ? (
                          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-600">
                            <span className="size-2 rounded-full bg-orange-500" />À la une
                          </span>
                        ) : null}
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {post.title}
                        </h3>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                          {displayText}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-3 border-t border-border/70 px-6 py-4">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:underline"
                      >
                        {t("blog.readMore") || "Voir plus"}
                        <ExternalLink className="size-4" />
                      </Link>
                      <ShareButtons
                        url={canonical}
                        text={post.title}
                        variant="compact"
                        shareData={{
                          title: post.title,
                          description: previewText,
                          image: post.image,
                        }}
                      />
                    </div>
                  </motion.article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">
                {t("blog.empty")}
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="relative z-10 overflow-hidden bg-slate-950"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-page py-20 md:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55, delay: 0.05 }}>
            <SectionHeader
              title={<span className="text-white">Nos services</span>}
              subtitle={<span className="text-slate-300">Une plateforme pensée pour les entreprises et les talents.</span>}
            />
          </motion.div>
          <motion.div className="mt-12 grid gap-6 md:grid-cols-2" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {services.map((item, i) => (
              <motion.article
                key={item.title}
                className={`group relative overflow-hidden ${
                  i === 0
                    ? "border-l-2 border-secondary/70 pl-6 md:pl-8"
                    : "rounded-[28px] border border-white/10 bg-slate-900/70 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.9)] backdrop-blur-sm"
                }`}
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerItem}
                whileHover={i === 0 ? undefined : { y: -8, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
              >
                {i === 1 ? <div className="absolute inset-x-0 top-0 h-1 bg-secondary" /> : null}
                <div className={`flex h-full flex-col justify-between gap-6 ${i === 0 ? "py-2 pr-2 md:py-4 md:pr-6" : "p-6 md:p-7"}`}>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-foreground/90">
                        {item.heading}
                      </span>
                      {i === 1 ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-brand-foreground ring-1 ring-white/10">
                          <Building2 className="h-4 w-4" />
                        </div>
                      ) : <Sparkles className="h-5 w-5 text-brand-foreground" />}
                    </div>

                    <h2 className="mt-5 font-display text-2xl font-bold text-white">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">
                      {item.description}
                    </p>

                    <ul className="mt-6 space-y-3 text-sm text-slate-200">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <span className="mt-2 h-px w-4 shrink-0 bg-brand/70" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Button asChild className="w-full justify-center rounded-xl bg-white text-slate-900 hover:bg-slate-200 shadow-sm">
                      <Link to={item.link.href}>{item.link.label}</Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="container-page py-20 md:py-24"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55, delay: 0.05 }}>
          <SectionHeader title={t("home.partners.title")} subtitle={t("home.partners.subtitle")} />
        </motion.div>
        <motion.div className="mt-12 flex items-center justify-center gap-8" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <img
            src={logoMonago}
            alt={t("home.partners.title")}
            width={180}
            height={80}
            loading="lazy"
            decoding="async"
            className="h-16 md:h-20 rounded-lg bg-card border border-border p-2 shadow-soft hover:shadow-elev transition-all duration-300 hover:-translate-y-1"
          />
        </motion.div>
      </motion.section>

      <motion.section
        className="container-page pb-24"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div className="rounded-3xl bg-[var(--brand)] p-10 md:p-16 text-center shadow-brand relative overflow-hidden" whileHover={{ y: -3 }} transition={{ duration: 0.2 }} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }}>
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2), transparent 40%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white">
              {t("home.cta.title")}
            </h2>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              {t("home.cta.subtitle")}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 bg-white text-[--brand-deep] hover:bg-white/90 font-semibold"
            >
              <Link to="/contact">{t("home.cta.button")}</Link>
            </Button>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
