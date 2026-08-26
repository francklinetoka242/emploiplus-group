import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "@/assets/home/home-hero-background.webp";
import heroMain from "@/assets/home/home-recruitment-image.webp";
import enterpriseTeamImage from "@/assets/home/enterprise-team-03.webp";
import mainJcImage from "@/assets/home/main-j-c.webp";
import { useEcoMode } from '@/contexts/EcoModeContext';
import logoMonago from "@/assets/partners/logo-monago.webp";
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
  ClipboardCheck,
  Users,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Sparkles,
  BarChart3,
  Handshake,
  BookOpen,
  ArrowUp,
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
              <Button asChild size="lg" className="bg-accent text-secondary-foreground hover:bg-accent/90 shadow-lg">
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 200;
      setShowScrollTop(nearBottom);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      {showScrollTop && (
        <button
          type="button"
          aria-label="Retour en haut"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-lg shadow-slate-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/40 md:bottom-7 md:right-7"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <motion.section 
        className="container-page max-w-5xl py-[1.125rem] md:py-[1.625rem]"
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
        className="relative z-30 overflow-visible bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container-page max-w-5xl pt-[1.125rem] pb-20 md:pt-[1.625rem] md:pb-24">
          <motion.div className="flex flex-wrap items-end justify-between gap-4 mb-10" variants={fadeUp}>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">
                {t("home.blog.title")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("home.blog.subtitle")}</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/blog" className="link link-animated">{t("home.blog.viewAll")}</Link>
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
                    className="relative z-30 flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-elev group-hover:border-brand"
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
                          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
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
                        className="link link-animated inline-flex items-center gap-2 text-sm font-semibold text-brand transition"
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

      <>
        {services.map((item, i) => (
          <motion.section
            key={item.title}
            className={`relative z-10 overflow-hidden bg-white ${i === 1 ? "py-[1.125rem] md:py-[1.625rem]" : ""}`}
            initial={i === 0 || i === 1 ? false : { opacity: 0, y: 40 }}
            whileInView={i === 0 || i === 1 ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className={`container-page ${i === 1 ? "max-w-5xl" : "max-w-6xl py-16 md:py-20"}`}>
              <div className="grid gap-8">
              <div className="group relative">
                {i === 0 ? (
                  <motion.div
                    className="grid min-h-[28rem] items-start gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:p-10"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.25 }}
                    variants={staggerContainer}
                  >
                    <motion.div className="max-w-md pt-2 md:pt-1" variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                      <span className="inline-block font-display text-3xl font-extrabold leading-none text-brand md:text-4xl">
                        {item.heading}
                      </span>
                      <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">
                        {item.title}
                      </h2>
                      <p className="mt-5 text-base leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                      <Button asChild className="mt-7 rounded-xl bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] px-6 text-white shadow-sm hover:brightness-110 transition-transform hover:scale-105">
                        <Link to={item.link.href}>{item.link.label}</Link>
                      </Button>
                    </motion.div>

                    <motion.div className="relative mx-auto flex min-h-[20rem] w-full max-w-[30rem] items-center justify-center" variants={staggerItem}>
                      <div className="relative size-72 overflow-visible rounded-full md:size-[21rem]">
                        <motion.div
                          className="h-full w-full overflow-hidden rounded-full bg-slate-200 shadow-xl"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.04 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                          <img src={heroMain} alt="Parcours candidat EmploiPlus Group" className="h-full w-full object-cover" loading="lazy" />
                        </motion.div>
                        <motion.div
                          className="absolute left-1/2 top-1/2 flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white shadow-xl shadow-brand/30 md:size-32"
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.2 }}
                          whileHover={{ scale: 1.1, rotate: 8 }}
                        >
                          <Sparkles className="h-9 w-9" />
                        </motion.div>
                      </div>
                      {item.bullets.map((bullet, bulletIndex) => (
                        <motion.div
                          key={bullet}
                          className="pointer-events-none absolute inset-0"
                          initial={{ rotate: 0 }}
                          whileInView={{ rotate: [0, 360] }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 3, delay: 0.35 + bulletIndex * 0.12, ease: "easeInOut" }}
                        >
                          <motion.div
                            className={`pointer-events-auto absolute flex size-28 items-center justify-center rounded-full border border-white bg-white/95 p-4 text-center text-[0.68rem] font-semibold leading-4 text-slate-800 shadow-lg md:size-32 md:text-xs ${
                              bulletIndex === 0 ? "right-0 top-0" : bulletIndex === 1 ? "right-0 bottom-0" : bulletIndex === 2 ? "left-0 bottom-0" : "left-0 top-0"
                            }`}
                            whileHover={{ scale: 1.1, backgroundColor: "#ffffff", boxShadow: "0 12px 28px rgba(0, 0, 158, 0.2)" }}
                            transition={{ duration: 0.2 }}
                          >
                            <span>{bullet}</span>
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-10 md:space-y-14">
                    <motion.div
                      className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-8"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.25 }}
                      variants={staggerContainer}
                    >
                      <div className="grid min-h-80 grid-cols-[9rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-3 md:h-[360px]">
                        <motion.div className="flex items-end rounded-xl bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] p-5" whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                          <span className="break-words font-display text-xl font-extrabold uppercase leading-tight text-white md:text-2xl">
                            À propos<br />de nous
                          </span>
                        </motion.div>
                        <motion.img src={enterpriseTeamImage} alt="Équipe Entreprise EmploiPlus Group" className="h-full min-h-0 w-full rounded-xl object-cover" loading="lazy" variants={staggerItem} whileHover={{ scale: 1.04 }} transition={{ duration: 0.25 }} />
                        <motion.img src={mainJcImage} alt="Environnement professionnel Entreprise" className="col-span-2 h-full min-h-0 w-full rounded-xl object-cover" loading="lazy" variants={staggerItem} whileHover={{ scale: 1.04 }} transition={{ duration: 0.25 }} />
                      </div>
                      <motion.div className="pt-1" variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                        <h2 className="font-display text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">{item.title}</h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600">{item.description}</p>
                        <Button asChild size="sm" className="mt-5 rounded-full bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] px-5 text-white shadow-sm hover:brightness-110 transition-transform hover:scale-105">
                          <Link to={item.link.href}>{item.link.label}<ArrowUp className="ml-2 h-4 w-4 rotate-45" /></Link>
                        </Button>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="grid gap-4 md:grid-cols-[9rem_repeat(3,minmax(0,1fr))] md:gap-5"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      variants={staggerContainer}
                    >
                      <motion.div className="flex min-h-[154px] w-[9rem] self-start items-end rounded-xl bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] p-5 md:min-h-[174px]" whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <span className="font-display text-2xl font-extrabold uppercase leading-tight text-white md:text-3xl">Pro<br />duits</span>
                      </motion.div>
                      {item.bullets.slice(0, 3).map((bullet, bulletIndex) => (
                        <motion.div
                          key={bullet}
                          className="flex min-h-84 flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] md:min-h-[384px]"
                          variants={staggerItem}
                          whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        >
                          <div>
                            {bulletIndex === 0 ? (
                              <ClipboardCheck className="h-5 w-5 text-brand" />
                            ) : bulletIndex === 1 ? (
                              <Users className="h-5 w-5 text-brand" />
                            ) : (
                              <BarChart3 className="h-5 w-5 text-brand" />
                            )}
                            <p className="mt-5 font-display text-base font-bold leading-5 text-slate-800">{bullet}</p>
                            <p className="mt-3 text-xs leading-5 text-slate-500">Une solution professionnelle adaptée à vos objectifs et à votre organisation.</p>
                          </div>
                          <Link to={item.link.href} aria-label={`Découvrir ${bullet}`} className="flex size-7 items-center justify-center self-end rounded-full bg-brand text-white transition hover:bg-brand/90">
                            <ArrowUp className="h-3.5 w-3.5 rotate-45" />
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
              </div>
            </div>
          </motion.section>
        ))}
      </>

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
        className="overflow-hidden bg-card py-[1.125rem] md:py-[1.625rem]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container-page max-w-5xl">
          <div className="grid items-center gap-9 sm:grid-cols-12 sm:gap-12">
            <motion.div
              className="overflow-hidden rounded-xl bg-muted shadow-soft sm:col-span-4"
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <img src="/home-team-collaboration.webp" alt="Équipe professionnelle en collaboration" className="h-[15.5rem] w-full object-cover sm:h-[10.5rem]" loading="lazy" />
            </motion.div>

            <motion.div
              className="sm:col-span-8"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-brand">Excellence du recrutement</p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight text-foreground sm:text-[1.75rem]">Développez vos talents pour faire grandir votre organisation</h2>
            </motion.div>

            <motion.div className="sm:col-span-4" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
              <h3 className="font-display text-xl font-bold text-foreground">Les bons talents pour votre équipe</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-[0.85rem] sm:leading-5">Nous vous aidons à identifier les profils qui correspondent à vos besoins et à construire des équipes engagées, compétentes et prêtes à contribuer durablement à vos projets.</p>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] p-6 text-white shadow-soft sm:col-span-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm leading-5">Une approche structurée pour attirer, évaluer et accompagner les talents dont votre organisation a besoin.</p>
              <ul className="mt-4 space-y-2 text-sm leading-5"><li className="flex items-center gap-2"><span aria-hidden="true">✓</span> 1 ans d’expérience</li><li className="flex items-center gap-2"><span aria-hidden="true">✓</span> Gestion des talents</li><li className="flex items-center gap-2"><span aria-hidden="true">✓</span> Recherche de profils dirigeants</li></ul>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-xl bg-brand-deep shadow-brand sm:col-span-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <img
                src={heroMain}
                alt="Présentation EmploiPlus Group"
                className="h-56 w-full object-cover sm:h-48"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="relative min-h-[360px] overflow-hidden py-12 md:min-h-[430px] md:py-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <img
          src="/home-career-consultation.svg"
          alt="Environnement professionnel EmploiPlus Group"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-brand-deep/35" />
        <div className="container-page relative flex min-h-[300px] max-w-lg items-center md:min-h-[365px]">
          <motion.div
            className="relative -translate-x-3 max-w-lg rounded-2xl bg-card/85 p-6 shadow-elev sm:-translate-x-6 sm:w-72 sm:p-5"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              Planifiez une consultation aujourd’hui
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-foreground sm:text-xl">
              Commencez votre parcours vers l’excellence des talents
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-[9px] sm:leading-4">
              Échangeons sur vos enjeux et bénéficiez d’un accompagnement adapté pour trouver les compétences qui feront avancer votre activité.
            </p>
            <Button asChild className="mt-6 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/contact">Demander un devis <ArrowUp className="ml-1 h-4 w-4 rotate-45" /></Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

    </div>
  );
}
