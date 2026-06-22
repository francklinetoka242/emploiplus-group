import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import heroBg from "./assets/hero-bg.jpg";
import logoMonago from "./assets/logo-monago.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, DEFAULT_SEO } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";
import {
  FileText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function usePublishedJobOffers(limit = 10) {
  const [offers, setOffers] = React.useState<Database["public"]["Tables"]["job_offers"]["Row"][]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadOffers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("job_offers")
        .select("id, slug, title, company, contract_type, location_city, location_country, description, requirements, status, publish_at")
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        console.error("Failed to load job offers:", error.message);
        setOffers([]);
      } else {
        setOffers(data ?? []);
      }
      setLoading(false);
    }

    loadOffers();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { offers, loading };
}

function usePublishedBlogPosts(limit = 9) {
  const [posts, setPosts] = React.useState<Database["public"]["Tables"]["blog_posts"]["Row"][]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, status, publish_at")
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        console.error("Failed to load blog posts:", error.message);
        setPosts([]);
      } else {
        setPosts(data ?? []);
      }
      setLoading(false);
    }

    loadPosts();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { posts, loading };
}

export function HomePage() {
  const { t } = useI18n();
  const { offers: homeJobs, loading: jobsLoading } = usePublishedJobOffers(4);
  const { posts: homePosts, loading: postsLoading } = usePublishedBlogPosts(3);

  const stats = [
    { value: "50+", label: "home.stats.jobs" },
    { value: "11+", label: "home.stats.companies" },
    { value: "20+", label: "home.stats.readers" },
  ];

  const services = [
    { title: "home.services.card1.title", description: "home.services.card1.description" },
    { title: "home.services.card2.title", description: "home.services.card2.description" },
    { title: "home.services.card3.title", description: "home.services.card3.description" },
  ];

  return (
    <div className="bg-background">
      {usePageSEO(DEFAULT_SEO)}
      <section
        className="relative overflow-hidden min-h-[600px] md:min-h-[700px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.65),rgba(2,6,23,0.9))]" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container-page py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px] items-center">
            <div>
              <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-primary/10 fade-up" style={{ animationDelay: '80ms' }}>
                {t("home.hero.eyebrow")}
              </p>
              <h1 className="mt-8 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white fade-up" style={{ animationDelay: '180ms' }}>
                {t("home.hero.title")}
              </h1>
              <p className="mt-6 max-w-2xl text-base text-white/90 leading-relaxed fade-up" style={{ animationDelay: '260ms' }}>
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-10 flex flex-wrap gap-3 fade-up" style={{ animationDelay: '340ms' }}>
                <Button asChild size="lg" className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
                  <Link to="/jobs">{t("home.hero.cta.jobs")}</Link>
                </Button>
                <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90 shadow-lg">
                  <Link to="/services">{t("home.hero.cta.services")}</Link>
                </Button>
              </div>
            </div>
            {/* Right column removed per request (Notre mission) */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((item, i) => (
            <div key={item.label} className="rounded-3xl overflow-hidden transform transition-transform hover:-translate-y-1 hover:scale-[1.02] fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="p-[1px] rounded-3xl gradient-brand">
                <article className="rounded-3xl bg-card p-8 text-center shadow-lg">
                  <div className="text-4xl font-display font-extrabold text-foreground">{item.value}</div>
                  <div className="mt-3 text-sm text-muted-foreground">{t(item.label)}</div>
                </article>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeader title={t("home.services.title")} subtitle={t("home.services.subtitle")} />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((item, i) => (
            <article key={item.title} className="rounded-3xl transform transition-transform hover:-translate-y-1 hover:shadow-xl fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="p-[1px] rounded-3xl gradient-brand">
                <div className="rounded-3xl bg-card p-6 h-full">
                  <h2 className="font-display text-lg font-bold text-foreground">{t(item.title)}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{t(item.description)}</p>
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
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">{t("home.jobs.title")}</h2>
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
                const location = [job.location_city, job.location_country].filter(Boolean).join(", ") || t("jobs.location.remote");
                return (
                  <article key={job.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up" style={{ animationDelay: `${i * 120}ms` }}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.company}</div>
                    <h3 className="mt-3 font-display text-xl font-bold text-foreground">{job.title}</h3>
                    <div className="mt-3 text-sm text-muted-foreground">{location}</div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t("jobs.none")}</div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">{t("home.blog.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("home.blog.subtitle")}</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/blog">{t("home.blog.viewAll")}</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {postsLoading ? (
            [1, 2, 3].map((index) => (
              <div key={index} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse" />
            ))
          ) : homePosts.length > 0 ? (
            homePosts.map((post, i) => (
              <article key={post.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up" style={{ animationDelay: `${i * 120}ms` }}>
                <h3 className="font-display text-xl font-bold text-foreground">{post.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{post.excerpt || post.subtitle || t('blog.article.placeholder')}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t('blog.empty')}</div>
          )}
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeader title={t("home.partners.title")} subtitle={t("home.partners.subtitle")} />
        <div className="mt-12 flex items-center justify-center gap-8">
          <img src={logoMonago} alt={t("home.partners.title")} className="h-16 md:h-20 rounded-lg bg-card border border-border p-2 shadow-soft hover:shadow-elev transition-all" />
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-3xl gradient-brand p-10 md:p-16 text-center shadow-brand relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 40%)" }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-brand-foreground">{t("home.cta.title")}</h2>
            <p className="mt-3 text-brand-foreground/80 max-w-2xl mx-auto">
              {t("home.cta.subtitle")}
            </p>
            <Button asChild size="lg" className="mt-7 bg-white text-[--brand-deep] hover:bg-white/90 font-semibold">
              <Link to="/contact">{t("home.cta.button")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function AboutPage() {
  const { t } = useI18n();

  const values = [
    { icon: '🤝', title: t('about.values.item1.title'), description: t('about.values.item1.description') },
    { icon: '⚙️', title: t('about.values.item2.title'), description: t('about.values.item2.description') },
    { icon: '📈', title: t('about.values.item3.title'), description: t('about.values.item3.description') },
  ];

  const pillars = [
    { title: t('about.pillars.item1.title'), description: t('about.pillars.item1.description') },
    { title: t('about.pillars.item2.title'), description: t('about.pillars.item2.description') },
    { title: t('about.pillars.item3.title'), description: t('about.pillars.item3.description') },
  ];

  return (
    <>
      {usePageSEO({
        title: t('about.title'),
        description: t('about.subtitle'),
        keywords: "à propos, mission, valeurs, services numériques, emploi, Congo",
        canonical: "https://emploiplus.group/#/about",
      })}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">{t('about.mission.title')}</h2>
              <p className="text-lg text-foreground/90 leading-relaxed">
                {t('about.mission.description')}
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{t('about.approach.title')}</h3>
              <p className="text-base text-foreground/80 leading-relaxed">
                {t('about.approach.description')}
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{t('about.promise.title')}</h3>
              <p className="text-base text-foreground/80 leading-relaxed">
                {t('about.promise.description')}
              </p>
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">{t('about.values.title')}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {values.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-border bg-card p-6">
                    <div className="text-3xl">{item.icon}</div>
                    <h4 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">{t('about.pillars.title')}</h3>
              <div className="grid gap-4">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-3xl border border-border bg-card p-6">
                    <h4 className="text-lg font-semibold text-foreground">{pillar.title}</h4>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      <div className="rounded-2xl p-[1px] gradient-brand">
        <div className="rounded-2xl bg-card p-8 space-y-8">
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">{t('about.values.title')}</h3>
            <div className="space-y-4">
              {values.map((value, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-3xl flex-shrink-0">{value.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{value.title}</p>
                    <p className="text-sm text-foreground/70 mt-1">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

      <section className="bg-secondary/10 border-y border-border py-16 md:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">{t('about.pillars.title')}</h2>
            <p className="mt-3 text-muted-foreground">{t('about.pillars.subtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <article key={i} className="rounded-2xl transform transition-transform hover:-translate-y-1 hover:shadow-xl bg-card border border-border p-6 fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                  <div className="text-brand font-bold text-lg">{i + 1}</div>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-foreground/80">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">{t('about.whyChooseUs.title')}</h2>
            <div className="grid gap-6 md:grid-cols-3 mt-8">
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">50+</p>
                <p className="text-foreground/80">{t('about.stats.jobs')}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">11+</p>
                <p className="text-foreground/80">{t('about.stats.companies')}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">20+</p>
                <p className="text-foreground/80">{t('about.stats.readers')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ServicesPage() {
  const { t } = useI18n();

  const serviceCards = [
    { title: 'services.card1.title', description: 'services.card1.description' },
    { title: 'services.card2.title', description: 'services.card2.description' },
    { title: 'services.card3.title', description: 'services.card3.description' },
    { title: 'services.card4.title', description: 'services.card4.description' },
    { title: 'services.card5.title', description: 'services.card5.description' },
    { title: 'services.card6.title', description: 'services.card6.description' },
  ];

  return (
    <>
      {usePageSEO({
        title: t('services.title'),
        description: t('services.subtitle'),
        keywords: "services, offres emploi, développement web, stratégie média, branding employeur",
        canonical: "https://emploiplus.group/#/services",
      })}
      <PageHeading
        title={t('services.title')}
        description={t('services.subtitle')}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map((item, i) => (
            <article key={item.title} className="rounded-3xl transform transition-transform hover:-translate-y-1 hover:shadow-xl fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="p-[1px] rounded-3xl gradient-brand">
                <div className="rounded-3xl bg-card p-6 h-full">
                  <h2 className="font-display text-lg font-semibold text-foreground">{t(item.title)}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{t(item.description)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function JobsPage() {
  const { t } = useI18n();
  const { offers, loading } = usePublishedJobOffers(12);
  const [query, setQuery] = React.useState("");
  const [companyQuery, setCompanyQuery] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [contractType, setContractType] = React.useState("");

  const q = query.trim().toLowerCase();
  const companyFilter = companyQuery.trim().toLowerCase();
  const lq = locationQuery.trim().toLowerCase();
  const filteredOffers = offers.filter((job) => {
    const hay = `${job.title || ""} ${job.company || ""} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (companyFilter && !job.company?.toLowerCase().includes(companyFilter)) return false;
    if (lq) {
      const location = `${job.location_city || ""} ${job.location_country || ""}`.toLowerCase();
      if (!location.includes(lq)) return false;
    }
    if (contractType && job.contract_type !== contractType) return false;
    return true;
  });

  return (
    <>
      {usePageSEO({
        title: t('jobs.page.title'),
        description: t('jobs.page.description'),
        keywords: "offres d'emploi, opportunités, recrutement, emploi Congo",
        canonical: "https://emploiplus.group/#/jobs",
      })}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            {/* Search form (enterprise style) */}
            <div className="rounded-3xl p-[1px] gradient-brand">
              <div className="rounded-3xl bg-card p-6 md:p-8">
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{t('jobs.search.title')}</h3>
                <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 md:grid-cols-[1fr_1fr]">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.keywords')}</label>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('jobs.search.keywords.placeholder')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.company')}</label>
                    <input
                      value={companyQuery}
                      onChange={(e) => setCompanyQuery(e.target.value)}
                      placeholder={t('jobs.search.company.placeholder')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.location')}</label>
                    <input
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder={t('jobs.search.location.placeholder')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.contractType')}</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="">{t('jobs.search.all')}</option>
                      <option value="cdi">{t('jobs.search.type.cdi')}</option>
                      <option value="cdd">{t('jobs.search.type.cdd')}</option>
                      <option value="stage">{t('jobs.search.type.stage')}</option>
                      <option value="freelance">{t('jobs.search.type.freelance')}</option>
                      <option value="temps_partiel">{t('jobs.search.type.temps_partiel')}</option>
                      <option value="interim">{t('jobs.search.type.interim')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex flex-wrap justify-end gap-3 mt-2">
                    <button type="button" onClick={() => { setQuery(''); setCompanyQuery(''); setLocationQuery(''); setContractType(''); }} className="rounded-md px-4 py-2 border border-border text-sm text-foreground hover:bg-primary/5">{t('jobs.search.reset')}</button>
                    <button type="submit" className="rounded-md px-4 py-2 bg-brand text-brand-foreground font-semibold">{t('jobs.search.submit')}</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {loading ? (
                [1, 2, 3].map((index) => (
                  <article key={index} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse" />
                ))
              ) : filteredOffers.length > 0 ? (
                filteredOffers.map((job, i) => {
                  const location = [job.location_city, job.location_country].filter(Boolean).join(", ") || t('jobs.location.remote');
                  return (
                    <article key={job.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.company}</div>
                      <h3 className="mt-3 font-display text-xl font-bold text-foreground">{job.title}</h3>
                      <div className="mt-3 text-sm text-muted-foreground">{location}</div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t('jobs.none')}</div>
              )}
            </div>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-8 shadow-soft fade-up" style={{ animationDelay: '240ms' }}>
            <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{t('jobs.quickAccess.title')}</div>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              {t('jobs.quickAccess.description')}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
                {t('jobs.quickAccess.channel1')}
              </a>
              <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-brand/50 text-sm font-semibold text-brand hover:bg-brand/60">
                {t('jobs.quickAccess.channel2')}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export function BlogPage() {
  const { t } = useI18n();
  const { posts, loading } = usePublishedBlogPosts(9);

  return (
    <>
      {usePageSEO({
        title: t('blog.title'),
        description: t('blog.subtitle'),
        keywords: "blog, articles, conseils carrière, actualités emploi, recrutement",
        canonical: "https://emploiplus.group/#/blog",
      })}
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
              <article key={post.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <h3 className="font-display text-xl font-bold text-foreground">{post.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{post.excerpt || post.subtitle || t('blog.article.placeholder')}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t('blog.empty')}</div>
          )}
        </div>
      </section>
    </>
  );
}

export function ContactPage() {
  const { t } = useI18n();
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (can be extended with actual backend call)
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      {usePageSEO({
        title: t('contact.title'),
        description: t('contact.subtitle'),
        keywords: "contact, nous contacter, support, recrutement, développement web",
        canonical: "https://emploiplus.group/#/contact",
      })}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Contact Form Card */}
          <div className="rounded-3xl p-[1px] gradient-brand">
            <div className="rounded-3xl bg-card p-8 md:p-10">
              <div className="mb-4">
                <h2 className="font-display text-2xl font-bold text-foreground">{t('contact.form.title')}</h2>
                <p className="mt-2 text-muted-foreground">{t('contact.form.subtitle')}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto md:mx-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">{t('contact.form.label.name')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={t('contact.form.placeholder.name')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">{t('contact.form.label.email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t('contact.form.placeholder.email')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">{t('contact.form.label.subject')}</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder={t('contact.form.placeholder.subject')}
                    className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">{t('contact.form.label.message')}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder={t('contact.form.placeholder.message')}
                    className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <Button size="lg" className="w-full md:w-auto bg-brand hover:bg-brand/90 text-brand-foreground font-semibold shadow-brand">
                    {t('contact.form.submit')}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <aside className="space-y-6 md:sticky md:top-24">
            {/* Direct Contact Card */}
            <div className="rounded-2xl p-[1px] gradient-brand">
              <div className="rounded-2xl bg-card p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">{t('contact.info.directTitle')}</h3>
                  <div className="space-y-5">
                    {/* Phone */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand/10">
                          <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{t('contact.info.phoneLabel')}</p>
                        <a href="tel:+242067311033" className="text-lg font-semibold text-brand hover:text-brand/80">{t('contact.info.phoneValue')}</a>
                        <p className="text-sm text-muted-foreground mt-1">{t('contact.info.phoneHelp')}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand/10">
                          <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{t('contact.info.emailLabel')}</p>
                        <a href="mailto:contact@emploiplus.group" className="text-lg font-semibold text-foreground hover:text-brand">{t('contact.info.emailValue')}</a>
                      </div>
                    </div>

                    {/* WhatsApp channels */}
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3 items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-50">
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.783 1.14L.855 2.6l1.508 4.514c-.915 1.594-1.395 3.472-1.395 5.441 0 5.346 4.357 9.704 9.704 9.704 2.592 0 5.023-.997 6.858-2.809 1.835-1.811 2.846-4.233 2.846-6.895 0-5.346-4.357-9.704-9.704-9.704z" /></svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{t('contact.info.whatsappLabel')}</p>
                          <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" target="_blank" rel="noreferrer" className="text-lg font-semibold text-brand hover:text-brand/80">{t('jobs.quickAccess.channel1')}</a>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-50">
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.783 1.14L.855 2.6l1.508 4.514c-.915 1.594-1.395 3.472-1.395 5.441 0 5.346 4.357 9.704 9.704 9.704 2.592 0 5.023-.997 6.858-2.809 1.835-1.811 2.846-4.233 2.846-6.895 0-5.346-4.357-9.704-9.704-9.704z" /></svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{t('contact.info.whatsappLabel')}</p>
                          <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noreferrer" className="text-lg font-semibold text-brand hover:text-brand/80">{t('jobs.quickAccess.channel2')}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft">
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{t('contact.location.title')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">{t('contact.location.headquarter')}</p>
                  <p className="text-lg text-foreground font-semibold">{t('contact.location.city')}</p>
                  <p className="text-foreground/80">{t('contact.location.country')}</p>
                </div>
                <a href="https://goo.gl/maps/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/5 transition-colors">
                  {t('contact.location.map')}
                </a>

                <div className="pt-4 border-t border-border mt-4">
                  <p className="text-sm text-muted-foreground mb-2">{t('contact.social.title')}</p>
                  <div className="flex gap-3">
                    <a href="https://www.linkedin.com/company/emploiplus-consulting/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold border border-border hover:bg-primary/5">
                      <svg className="h-4 w-4 text-foreground/80" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM.5 24h4V7h-4v17zM8.5 7h3.8v2.3h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.8 2.6 4.8 6v10.6h-4v-9.4c0-2.2 0-5-3-5s-3.4 2.3-3.4 4.8V24h-4V7z"/></svg>
                      {t('contact.social.linkedin')}
                    </a>
                    <a href="https://www.facebook.com/EmploiplusConsulting" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold border border-border hover:bg-primary/5">
                      <svg className="h-4 w-4 text-foreground/80" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7H7.9v-2.9h2.6V9.4c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z"/></svg>
                      {t('contact.social.facebook')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (data.user) {
      setMessage(t("auth.successRedirect"));
      navigate("/admin");
    }
  };

  return (
    <>
      {usePageSEO({
        title: t("auth.page.title"),
        description: t("auth.page.description"),
        canonical: "https://emploiplus.group/#/auth",
      })}
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 shadow-soft">
          <h1 className="font-display text-3xl font-bold text-foreground text-center">{t("auth.heading")}</h1>
          <p className="mt-4 text-muted-foreground text-center">
            {t("auth.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="auth-email">
                {t("common.email")}
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder={t("auth.placeholder.email")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="auth-password">
                {t("common.password")}
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder={t("auth.placeholder.password")}
              />
            </div>

            {error ? (
              <div className="rounded-2xl bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl bg-success/10 border border-success px-4 py-3 text-sm text-success">
                {message}
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
              {loading ? t("auth.submit.loading") : t("common.signIn")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

type AdminView = "dashboard" | "jobs" | "blog" | "team";

function AdminSidebar({
  open,
  activeView,
  onSelect,
  onToggle,
  onLogout,
  session,
}: {
  open: boolean;
  activeView: AdminView;
  onSelect: (view: AdminView) => void;
  onToggle: () => void;
  onLogout: () => void;
  session: any;
}) {
  const { t } = useI18n();
  const name = session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "Administrateur";
  const email = session.user?.email || "admin@emploiplus.group";
  const avatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || "";

  const navItems: { id: AdminView; label: string; icon: LucideIcon }[] = [
    { id: "dashboard", label: t("admin.sidebar.dashboard"), icon: LayoutDashboard },
    { id: "jobs", label: t("admin.sidebar.jobs"), icon: Briefcase },
    { id: "blog", label: t("admin.sidebar.blog"), icon: FileText },
    { id: "team", label: t("admin.sidebar.team"), icon: Users },
  ];

  return (
    <aside className={cn(
      "flex min-h-[calc(100vh-48px)] flex-col gap-6 rounded-[2rem] border border-border bg-slate-950/95 p-4 text-slate-50 shadow-xl shadow-slate-950/10 transition-all duration-300",
      open ? "w-72" : "w-20",
    )}>
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className={cn("space-y-1 overflow-hidden transition-all duration-300", open ? "max-w-full opacity-100" : "max-w-0 opacity-0")}> 
            <p className="text-sm font-semibold">Emploi+</p>
            <p className="text-xs text-slate-300">Dashboard pro</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-100 transition hover:bg-white/15"
            aria-label={open ? t("admin.sidebar.collapse") : t("admin.sidebar.expand")}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("space-y-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 transition-all duration-300", open ? "max-h-[12rem] opacity-100" : "max-h-0 opacity-0")}> 
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl bg-slate-800">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-slate-200">{name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "group flex items-center gap-3 rounded-3xl px-4 py-3 text-left transition-all duration-300 hover:bg-white/10",
                active ? "bg-white/10 ring-1 ring-white/20" : "",
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5 text-slate-100" />
              <span className={cn("text-sm font-medium transition-all duration-300", open ? "opacity-100" : "opacity-0")}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="group inline-flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          <span className={cn("transition-all duration-300", open ? "opacity-100" : "opacity-0")}>{t("common.signOut")}</span>
        </button>
      </div>
    </aside>
  );
}

function AdminTopbar({ session }: { session: any }) {
  const name = session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "Administrateur";
  const email = session.user?.email || "admin@emploiplus.group";
  const avatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || "";

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-slate-950/95 p-5 text-slate-50 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Administration Emploi+</p>
        <h2 className="text-2xl font-semibold text-white">Bienvenue, {name}</h2>
        <p className="text-sm text-slate-300">Gérez vos offres, contenus et équipe depuis un espace premium.</p>
      </div>
      <div className="flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl bg-slate-800 text-slate-200">
          {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : <Sparkles className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-slate-400">{email}</p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardView() {
  const { t } = useI18n();
  const metrics = [
    { label: t("admin.dashboard.metric.activeJobs"), value: "18" },
    { label: t("admin.dashboard.metric.publishedPosts"), value: "12" },
    { label: t("admin.dashboard.metric.receivedRequests"), value: "324" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t("admin.dashboard.overview")}</p>
            <h1 className="text-3xl font-semibold text-foreground">{t("admin.dashboard.title")}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{t("admin.dashboard.description")}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-sm text-slate-200 shadow-sm">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>{t("admin.dashboard.premium")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t("admin.dashboard.jobs.title")}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{t("admin.dashboard.jobs.subtitle")}</h3>
            </div>
            <div className="rounded-3xl bg-emerald-500/10 px-3 py-2 text-emerald-400">Stable</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("admin.dashboard.jobs.description")}</p>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t("admin.dashboard.content.title")}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{t("admin.dashboard.content.subtitle")}</h3>
            </div>
            <div className="rounded-3xl bg-blue-500/10 px-3 py-2 text-blue-300">Engagé</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("admin.dashboard.content.description")}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminJobsPage() {
  const [form, setForm] = React.useState({
    title: "",
    company: "",
    city: "",
    contract_type: "cdi",
    description: "",
    salary: "",
    company_logo: "",
    keywords: "",
    auto_share: false,
    deadline: "",
    seo_description: "",
  });
  const [success, setSuccess] = React.useState<string | null>(null);
  const { t } = useI18n();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(t("admin.jobs.successMessage"));
    console.log("Offre d'emploi soumise", form);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-foreground">{t("admin.jobs.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.jobs.description")}</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-[2rem] border border-border bg-background p-8 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.title")}</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder={t("admin.jobs.field.titlePlaceholder")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.company")}</label>
              <Input name="company" value={form.company} onChange={handleChange} required placeholder={t("admin.jobs.field.companyPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.city")}</label>
              <Select value={form.city} onValueChange={(value) => setForm((prev) => ({ ...prev, city: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.jobs.field.cityPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brazzaville">{t("admin.jobs.field.cityOption.brazzaville")}</SelectItem>
                  <SelectItem value="Pointe-Noire">{t("admin.jobs.field.cityOption.pointenoire")}</SelectItem>
                  <SelectItem value="Remote">{t("admin.jobs.field.cityOption.remote")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.contractType")}</label>
              <Select value={form.contract_type} onValueChange={(value) => setForm((prev) => ({ ...prev, contract_type: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.jobs.field.contractTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">{t("admin.jobs.field.contractTypeOption.cdi")}</SelectItem>
                  <SelectItem value="cdd">{t("admin.jobs.field.contractTypeOption.cdd")}</SelectItem>
                  <SelectItem value="stage">{t("admin.jobs.field.contractTypeOption.stage")}</SelectItem>
                  <SelectItem value="freelance">{t("admin.jobs.field.contractTypeOption.freelance")}</SelectItem>
                  <SelectItem value="temps_partiel">{t("admin.jobs.field.contractTypeOption.temps_partiel")}</SelectItem>
                  <SelectItem value="interim">{t("admin.jobs.field.contractTypeOption.interim")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.salary")}</label>
              <Input name="salary" value={form.salary} onChange={handleChange} placeholder={t("admin.jobs.field.salaryPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">{t("admin.jobs.field.description")}</label>
              <Textarea name="description" value={form.description} onChange={handleChange} rows={6} required placeholder={t("admin.jobs.field.descriptionPlaceholder")} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">{t("admin.jobs.field.seoDescription")}</label>
              <Textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={6} placeholder={t("admin.jobs.field.seoDescriptionPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.companyLogo")}</label>
              <Input
                name="company_logo"
                type="file"
                onChange={(event) => setForm((prev) => ({ ...prev, company_logo: event.target.files?.[0]?.name || "" }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.keywords")}</label>
              <Input name="keywords" value={form.keywords} onChange={handleChange} placeholder={t("admin.jobs.field.keywordsPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 items-end">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.deadline")}</label>
              <Input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
            </div>
            <div className="rounded-3xl border border-border bg-secondary/10 p-4">
              <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                <input type="checkbox" name="auto_share" checked={form.auto_share} onChange={handleChange} className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary" />
                {t("admin.jobs.field.autoShare")}
              </label>
              <p className="mt-2 text-xs text-muted-foreground">{t("admin.jobs.field.autoShareHelp")}</p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-slate-950/95 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">{t("admin.jobs.field.requiredFieldsTitle")}</p>
            <p className="mt-2">{t("admin.jobs.field.requiredFieldsDescription")}</p>
          </div>

          {success ? <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500 px-4 py-3 text-sm text-emerald-500">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {t("admin.jobs.field.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminBlogPage() {
  const { t } = useI18n();
  const [form, setForm] = React.useState({
    title: "",
    category: "",
    content: "",
    status: "draft",
    image: "",
    excerpt: "",
    author: "",
    slug: "",
    seo_title: "",
    seo_description: "",
  });
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(t("admin.blog.successDraft"));
    console.log("Article blog soumis", form);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-foreground">{t("admin.blog.pageTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.blog.pageDescription")}</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-[2rem] border border-border bg-background p-8 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.title")}</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder={t("admin.blog.field.titlePlaceholder")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.category")}</label>
              <Input name="category" value={form.category} onChange={handleChange} required placeholder={t("admin.blog.field.categoryPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">{t("admin.blog.field.excerpt")}</label>
              <Textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={4} placeholder={t("admin.blog.field.excerptPlaceholder")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.author")}</label>
              <Input name="author" value={form.author} onChange={handleChange} placeholder={t("admin.blog.field.authorPlaceholder")} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.content")}</label>
            <Textarea name="content" value={form.content} onChange={handleChange} required rows={8} placeholder={t("admin.blog.field.contentPlaceholder")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.image")}</label>
              <Input
                name="image"
                type="file"
                onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0]?.name || "" }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.slug")}</label>
              <Input name="slug" value={form.slug} onChange={handleChange} placeholder={t("admin.blog.field.slugPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.seoTitle")}</label>
              <Input name="seo_title" value={form.seo_title} onChange={handleChange} placeholder={t("admin.blog.field.seoTitlePlaceholder")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.status")}</label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.blog.field.statusPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-slate-950/95 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">{t("admin.blog.field.requiredFieldsTitle")}</p>
            <p className="mt-2">{t("admin.blog.field.requiredFieldsDescription")}</p>
          </div>

          {success ? <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500 px-4 py-3 text-sm text-emerald-500">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {t("admin.blog.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminTeamPage() {
  const teamMembers = [
    { name: "Amina K.", role: "Directrice administrative", email: "amina@emploiplus.group", label: "Leadership" },
    { name: "David L.", role: "Chef de produit", email: "david@emploiplus.group", label: "Stratégie" },
    { name: "Salima T.", role: "Responsable contenu", email: "salima@emploiplus.group", label: "Editorial" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-foreground">Équipe Admin</h1>
        <p className="mt-3 text-sm text-muted-foreground">Gérez les profils d'équipe, les accès et les responsabilités métier.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div key={member.email} className="rounded-[2rem] border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Email :</span> {member.email}
              </div>
              <div>
                <span className="font-semibold text-foreground">Spécialité :</span> {member.label}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="mt-5 w-full justify-center">
              Voir le profil
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminHomePage() {
  return <AdminDashboardView />;
}

export function AdminPage() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [activeView, setActiveView] = React.useState<AdminView>("dashboard");
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    }
    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const path = location.pathname.replace("/admin", "").replace(/^\//, "");
    if (path === "jobs") setActiveView("jobs");
    else if (path === "blog") setActiveView("blog");
    else if (path === "team") setActiveView("team");
    else setActiveView("dashboard");
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSelect = (view: AdminView) => {
    setActiveView(view);
    navigate(view === "dashboard" ? "/admin" : `/admin/${view}`);
  };

  if (loading) {
    return (
      <>
        {usePageSEO({
          title: t("admin.page.title"),
          description: t("admin.page.description"),
          canonical: "https://emploiplus.group/#/admin",
        })}
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <p className="text-muted-foreground">{t("admin.page.loading")}</p>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        {usePageSEO({
          title: t("admin.page.title"),
          description: t("admin.page.description"),
          canonical: "https://emploiplus.group/#/admin",
        })}
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <h1 className="font-display text-3xl font-bold text-foreground">{t("admin.page.protectedTitle")}</h1>
            <p className="mt-4 text-muted-foreground">{t("admin.page.protectedDescription")}</p>
            <div className="mt-8">
              <Link to="/auth" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                {t("admin.page.loginButton")}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {usePageSEO({
        title: t("admin.page.title"),
        description: t("admin.page.description"),
        canonical: "https://emploiplus.group/#/admin",
      })}
      <div className="bg-slate-950/5 min-h-screen py-6">
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1600px] gap-6 px-4 sm:px-6 lg:px-8">
          <AdminSidebar
            open={sidebarOpen}
            activeView={activeView}
            onSelect={handleSelect}
            onToggle={() => setSidebarOpen((prev) => !prev)}
            onLogout={handleLogout}
            session={session}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <AdminTopbar session={session} />
            <main className="flex-1 rounded-[2rem] border border-border bg-background p-6 shadow-soft transition-all duration-300">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}


export function AdminJobCreatePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: "",
    company: "",
    company_logo: "",
    location_city: "",
    location_country: "",
    contract_type: "cdi",
    description: "",
    requirements: "",
    application_email: "",
    application_whatsapp: "",
    external_link: "",
    cover_image: "",
    status: "draft",
    publish_at: "",
    expires_at: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const slug = createSlug(form.title || `${form.company}-${Date.now()}`);
    const payload = {
      slug,
      title: form.title,
      company: form.company,
      company_logo: form.company_logo || null,
      location_city: form.location_city || null,
      location_country: form.location_country || null,
      contract_type: form.contract_type as Database["public"]["Enums"]["contract_type"],
      description: form.description,
      requirements: form.requirements || null,
      application_email: form.application_email || null,
      application_whatsapp: form.application_whatsapp || null,
      external_link: form.external_link || null,
      cover_image: form.cover_image || null,
      status: form.status as Database["public"]["Enums"]["job_status"],
      publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    const { error } = await supabase.from("job_offers").insert([payload]);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(t("admin.jobs.create.successMessage"));
    navigate("/admin/jobs");
  };

  return (
    <div className="space-y-6">
      {usePageSEO({
        title: t("admin.jobs.create.title"),
        description: t("admin.jobs.create.description"),
        canonical: "https://emploiplus.group/#/admin/jobs/new",
      })}
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">{t("admin.jobs.create.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("admin.jobs.create.description")}</p>
          </div>
          <Button size="lg" variant="outline" onClick={() => navigate("/admin/jobs")}>{t("admin.jobs.create.button.back")}</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.title")}</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder={t("admin.jobs.field.titlePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.company")}</label>
              <Input name="company" value={form.company} onChange={handleChange} required placeholder={t("admin.jobs.field.companyPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.city")}</label>
              <Input name="location_city" value={form.location_city} onChange={handleChange} placeholder={t("admin.jobs.field.cityPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.country")}</label>
              <Input name="location_country" value={form.location_country} onChange={handleChange} placeholder={t("admin.jobs.create.field.countryPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.contractType")}</label>
              <Select value={form.contract_type} onValueChange={(value) => setForm((prev) => ({ ...prev, contract_type: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.jobs.field.choosePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">{t("admin.jobs.field.contractTypeOption.cdi")}</SelectItem>
                  <SelectItem value="cdd">{t("admin.jobs.field.contractTypeOption.cdd")}</SelectItem>
                  <SelectItem value="stage">{t("admin.jobs.field.contractTypeOption.stage")}</SelectItem>
                  <SelectItem value="freelance">{t("admin.jobs.field.contractTypeOption.freelance")}</SelectItem>
                  <SelectItem value="consultance">{t("admin.jobs.field.contractTypeOption.consultance")}</SelectItem>
                  <SelectItem value="temps_partiel">{t("admin.jobs.field.contractTypeOption.temps_partiel")}</SelectItem>
                  <SelectItem value="interim">{t("admin.jobs.field.contractTypeOption.interim")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.status")}</label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.jobs.field.choosePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("admin.jobs.create.field.statusOption.draft")}</SelectItem>
                  <SelectItem value="published">{t("admin.jobs.create.field.statusOption.published")}</SelectItem>
                  <SelectItem value="archived">{t("admin.jobs.create.field.statusOption.archived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.applicationEmail")}</label>
              <Input name="application_email" value={form.application_email} onChange={handleChange} placeholder={t("admin.jobs.create.field.applicationEmailPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.externalLink")}</label>
              <Input name="external_link" value={form.external_link} onChange={handleChange} placeholder={t("admin.jobs.create.field.externalLinkPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.publishAt")}</label>
              <Input name="publish_at" type="datetime-local" value={form.publish_at} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.expiresAt")}</label>
              <Input name="expires_at" type="datetime-local" value={form.expires_at} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.description")}</label>
            <Textarea name="description" value={form.description} onChange={handleChange} required rows={6} placeholder={t("admin.jobs.create.field.requirementsPlaceholder")} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.requirements")}</label>
            <Textarea name="requirements" value={form.requirements} onChange={handleChange} rows={5} placeholder={t("admin.jobs.create.field.requirementsPlaceholder")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.companyLogo")}</label>
              <Input name="company_logo" value={form.company_logo} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.coverImage")}</label>
              <Input name="cover_image" value={form.cover_image} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          {error ? <div className="rounded-2xl bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-success/10 border border-success px-4 py-3 text-sm text-success">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
            {saving ? t("admin.jobs.create.saving") : t("admin.jobs.create.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminBlogCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    image: "",
    video_url: "",
    external_link: "",
    status: "draft",
    publish_at: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const slug = createSlug(form.title || `article-${Date.now()}`);
    const payload = {
      slug,
      title: form.title,
      subtitle: form.subtitle || null,
      content: form.content,
      excerpt: form.excerpt || null,
      image: form.image || null,
      video_url: form.video_url || null,
      external_link: form.external_link || null,
      category: form.category || null,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: form.status as Database["public"]["Enums"]["post_status"],
      publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
    };

    const { error } = await supabase.from("blog_posts").insert([payload]);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Article créé avec succès.");
    navigate("/admin/blog");
  };

  return (
    <div className="space-y-6">
      {usePageSEO({
        title: "Créer un article",
        description: "Publiez un nouvel article sur le blog depuis l'administration EmploiPlus.",
        canonical: "https://emploiplus.group/#/admin/blog/new",
      })}
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Nouvel article</h1>
            <p className="mt-2 text-sm text-muted-foreground">Créez un article clair, professionnel et orienté entreprise.</p>
          </div>
          <Button size="lg" variant="outline" onClick={() => navigate("/admin/blog")}>Retour au blog</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Titre</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder="Titre de l'article" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sous-titre</label>
              <Input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Résumé sous le titre" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Extrait</label>
            <Textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={4} placeholder="Phrase d'accroche visible sur la page blog." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Contenu</label>
            <Textarea name="content" value={form.content} onChange={handleChange} required rows={8} placeholder="Rédigez votre article ici avec un message clair pour les entreprises." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Catégorie</label>
              <Input name="category" value={form.category} onChange={handleChange} placeholder="Recrutement, SaaS, RH..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Mots-clés</label>
              <Input name="tags" value={form.tags} onChange={handleChange} placeholder="talent, recrutement, marque employeur" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Image principale (URL)</label>
              <Input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Lien vidéo</label>
              <Input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Lien externe</label>
              <Input name="external_link" value={form.external_link} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Statut</label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Date de publication</label>
              <Input name="publish_at" type="datetime-local" value={form.publish_at} onChange={handleChange} />
            </div>
            <div className="pt-8 text-sm text-muted-foreground">Laisser vide pour publier immédiatement selon le statut.</div>
          </div>
          {error ? <div className="rounded-2xl bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-success/10 border border-success px-4 py-3 text-sm text-success">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
            {saving ? "Enregistrement..." : "Publier l'article"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <>
      {usePageSEO({
        title: "Page non trouvée - 404",
        description: "La page que vous recherchez n'existe pas ou a été supprimée.",
        canonical: "https://emploiplus.group/#/404",
      })}
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
