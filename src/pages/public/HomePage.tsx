import React from "react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import logoMonago from "@/assets/logo-monago.jpg";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { DEFAULT_SEO, BASE_URL } from "@/features/seo";
import { SectionHeader } from "@/components/page/SectionHeader";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { usePublishedJobOffers, usePublishedBlogPosts } from "@/features/jobs/hooks";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { ShareButtons } from "@/components/site/ShareButtons";
import { JobCard } from "@/features/jobs/components";

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
    <div className="rounded-3xl overflow-hidden transform transition-transform hover:-translate-y-1 hover:scale-[1.02] fade-up">
      <div className="p-[1px] rounded-3xl gradient-brand">
        <article className="rounded-3xl bg-card p-8 text-center shadow-lg">
          <div className="text-4xl font-display font-extrabold text-foreground">
            <AnimatedCounter value={value} />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">{t(label)}</div>
        </article>
      </div>
    </div>
  );
}

export function HomePage() {
  const { t } = useI18n();
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
      consultance: "Consultance",
      temps_partiel: "Temps partiel",
      interim: "Intérim",
    };
    return fallbackMap[contractType] || contractType;
  };

  const stats = [
    { value: "1200+", label: "home.stats.jobs" },
    { value: "1", label: "home.stats.companies" },
    { value: "440+", label: "home.stats.readers" },
  ];

  const services = [
    {
      title: "PÔLE 1 : HUB EMPLOI & RECRUTEMENT",
      description:
        "Connexion entreprises-talents : publication d'offres, sourcing, sélection et accompagnement des candidats.",
    },
    {
      title: "PÔLE 2 : MISE À DISPOSITION & GESTION RH",
      description:
        "Fourniture de personnel et gestion RH : intérim, paie, contrats et administration du personnel.",
    },
    {
      title: "PÔLE 3 : CONSEIL, FORMATION & TRANSFORMATION",
      description:
        "Conseil et digitalisation : audit, transformation, formation et intégration de solutions numériques.",
    },
    {
      title: "PÔLE 4 : PRESTATIONS OPÉRATIONNELLES",
      description:
        "Équipes opérationnelles et support : missions sur site, assistance administrative et appui technique.",
    },
  ];

  return (
    <div className="bg-background">
      <SEO {...DEFAULT_SEO} />
      <section
        className="relative overflow-hidden min-h-[600px] md:min-h-[700px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.65),rgba(2,6,23,0.9))]" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container-page py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px] items-center">
            <div>
              <p
                className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-primary/10 fade-up"
                style={{ animationDelay: "80ms" }}
              >
                {t("home.hero.eyebrow")}
              </p>
              <h1
                className="mt-8 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white fade-up"
                style={{ animationDelay: "180ms" }}
              >
                {t("home.hero.title")}
              </h1>
              <p
                className="mt-6 max-w-2xl text-base text-white/90 leading-relaxed fade-up"
                style={{ animationDelay: "260ms" }}
              >
                {t("home.hero.subtitle")}
              </p>
              <div
                className="mt-10 flex flex-wrap gap-3 fade-up"
                style={{ animationDelay: "340ms" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand"
                >
                  <Link to="/jobs">{t("home.hero.cta.jobs")}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-white hover:bg-accent/90 shadow-lg"
                >
                  <Link to="/services">{t("home.hero.cta.services")}</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((item, i) => (
            <div key={item.label} className="fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <AnimatedStat value={item.value} label={item.label} t={t} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeader
          title={"Nos services"}
          subtitle={"Une plateforme pensée pour les entreprises et les talents."}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((item, i) => (
            <article
              key={item.title}
              className="rounded-3xl transform transition-transform hover:-translate-y-1 hover:shadow-xl fade-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="p-[1px] rounded-3xl gradient-brand">
                <div className="rounded-3xl bg-card p-6 h-full">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {t(item.title)}
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {t(item.description)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/10 border-y border-border">
        <div className="container-page py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">
                {t("home.jobs.title")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("home.jobs.subtitle")}</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/jobs">{t("home.jobs.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {jobsLoading ? (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="h-5 w-1/3 rounded-full bg-muted-foreground/20 animate-pulse" />
                <div className="mt-4 h-4 w-2/3 rounded-full bg-muted-foreground/20 animate-pulse" />
                <div className="mt-3 h-4 w-1/2 rounded-full bg-muted-foreground/20 animate-pulse" />
              </div>
            ) : homeJobs.length > 0 ? (
              homeJobs.map((job, i) => {
                const location =
                  [job.location_city, job.location_country].filter(Boolean).join(", ") ||
                  t("jobs.location.remote");
                const previewText = (job.description || job.requirements || "")
                  .replace(/\s+/g, " ")
                  .trim();
                const contractLabel = getContractLabel(job.contract_type);
                const tags = (job.tags || []).filter(Boolean).slice(0, 3);
                const deadlineValue = job.deadline || null;
                const isExpired = Boolean(
                  deadlineValue && new Date(deadlineValue).getTime() < Date.now(),
                );

                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    location={location}
                    previewText={previewText}
                    contractLabel={contractLabel}
                    tags={tags}
                    deadlineValue={deadlineValue}
                    isExpired={isExpired}
                    t={t}
                    index={i}
                  />
                );
              })
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">
                {t("jobs.none")}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">
              {t("home.blog.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("home.blog.subtitle")}</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/blog">{t("home.blog.viewAll")}</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {postsLoading ? (
            [1, 2, 3].map((index) => (
              <div
                key={index}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse"
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
                <article
                  key={post.id}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elev group-hover:border-brand fade-up"
                  style={{ animationDelay: `${i * 120}ms` }}
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
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">
              {t("blog.empty")}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeader title={t("home.partners.title")} subtitle={t("home.partners.subtitle")} />
        <div className="mt-12 flex items-center justify-center gap-8">
          <img
            src={logoMonago}
            alt={t("home.partners.title")}
            className="h-16 md:h-20 rounded-lg bg-card border border-border p-2 shadow-soft hover:shadow-elev transition-all"
          />
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-3xl gradient-brand p-10 md:p-16 text-center shadow-brand relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 40%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-brand-foreground">
              {t("home.cta.title")}
            </h2>
            <p className="mt-3 text-brand-foreground/80 max-w-2xl mx-auto">
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
        </div>
      </section>
    </div>
  );
}
