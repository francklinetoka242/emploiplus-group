import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, Rocket, Sparkles, Zap, Globe2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils-ext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EmploiPlus Group — Tech, Emplois & Médias" },
      { name: "description", content: "Plateforme tech, diffusion d'offres d'emploi et média professionnel. Trouvez votre prochain poste ou faites grandir votre entreprise." },
      { property: "og:title", content: "EmploiPlus Group — Tech, Emplois & Médias" },
      { property: "og:description", content: "Plateforme tech, diffusion d'offres d'emploi et média professionnel." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, locale } = useI18n();

  const { data: jobs } = useQuery({
    queryKey: ["home-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_offers")
        .select("id, slug, title, company, location_city, location_country, contract_type, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["home-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, subtitle, excerpt, image, category, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  const { data: services } = useQuery({
    queryKey: ["home-services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(6);
      return data ?? [];
    },
  });

  const fallbackServices = [
    { icon: Briefcase, title: "Diffusion d'offres", description: "Une visibilité maximale pour vos opportunités professionnelles." },
    { icon: Rocket, title: "Solutions tech", description: "Développement web, applications et infrastructures sur mesure." },
    { icon: Sparkles, title: "Contenu média", description: "Articles, conseils carrière et insights pour votre audience." },
    { icon: Building2, title: "Branding employeur", description: "Mettez en valeur votre marque pour attirer les meilleurs talents." },
    { icon: Globe2, title: "Présence digitale", description: "Stratégie web, SEO et visibilité internationale." },
    { icon: Zap, title: "Conseil & accompagnement", description: "Audit, stratégie et exécution pour vos projets numériques." },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="" width={1920} height={1080} className="size-full object-cover opacity-90" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.15_0.06_255/0.6)] via-[oklch(0.15_0.06_255/0.75)] to-background" />
        </div>
        <div className="container-page pt-24 pb-32 md:pt-32 md:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-medium text-white/90 mb-6">
              <span className="size-1.5 rounded-full bg-[--accent-cyan] animate-pulse" />
              {t("home.hero.eyebrow")}
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
              {t("home.hero.title")}
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/75 max-w-2xl">{t("home.hero.subtitle")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-[--brand-deep] hover:bg-white/90 font-semibold shadow-brand">
                <Link to="/jobs">{t("cta.viewJobs")} <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link to="/services">{t("cta.discover")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="container-page -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {[
            { v: "500+", l: t("home.stats.jobs") },
            { v: "120+", l: t("home.stats.companies") },
            { v: "20k+", l: t("home.stats.readers") },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl bg-card border border-border p-5 md:p-7 shadow-elev"
            >
              <div className="font-display text-3xl md:text-5xl font-extrabold gradient-text-brand">{s.v}</div>
              <div className="mt-1 text-xs md:text-sm text-muted-foreground">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-page py-24">
        <SectionHeader title={t("home.services.title")} subtitle={t("home.services.subtitle")} />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(services && services.length > 0 ? services : fallbackServices).map((s: any, i: number) => {
            const Icon = (s as any).icon ?? fallbackServices[i % fallbackServices.length].icon;
            return (
              <motion.article
                key={s.id ?? s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                className="group rounded-2xl bg-card border border-border p-6 hover:shadow-elev hover:-translate-y-1 transition-all"
              >
                <div className="size-11 rounded-xl gradient-brand grid place-items-center text-brand-foreground shadow-brand">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.article>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline"><Link to="/services">{t("cta.viewAll")} <ArrowRight className="ml-1 size-4" /></Link></Button>
        </div>
      </section>

      {/* JOBS */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container-page py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">{t("home.jobs.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("home.jobs.subtitle")}</p>
            </div>
            <Button asChild variant="ghost"><Link to="/jobs">{t("cta.viewAll")} <ArrowRight className="ml-1 size-4" /></Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(jobs ?? []).map((j) => (
              <Link key={j.id} to="/jobs/$slug" params={{ slug: j.slug }}
                className="group rounded-xl bg-card border border-border p-5 hover:shadow-elev hover:border-brand transition-all">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="size-3.5" /> {j.company}
                  {j.contract_type && <span className="px-2 py-0.5 rounded-full bg-accent text-[--brand-deep] font-medium uppercase text-[10px] tracking-wide">{j.contract_type}</span>}
                </div>
                <h3 className="mt-2 font-display text-lg font-bold group-hover:text-brand transition-colors">{j.title}</h3>
                <div className="mt-2 text-xs text-muted-foreground">{[j.location_city, j.location_country].filter(Boolean).join(", ")}</div>
              </Link>
            ))}
            {(!jobs || jobs.length === 0) && (
              <div className="md:col-span-2 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Aucune offre publiée pour le moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="container-page py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">{t("home.blog.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("home.blog.subtitle")}</p>
          </div>
          <Button asChild variant="ghost"><Link to="/blog">{t("cta.viewAll")} <ArrowRight className="ml-1 size-4" /></Link></Button>
        </div>
        {posts && posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group block rounded-xl overflow-hidden bg-card border border-border hover:shadow-elev transition-all">
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="size-full gradient-brand" />
                  )}
                </div>
                <div className="p-5">
                  {p.category && <div className="text-[11px] uppercase tracking-wider font-semibold text-brand">{p.category}</div>}
                  <h3 className="mt-1 font-display text-lg font-bold group-hover:text-brand transition-colors line-clamp-2">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                  <div className="mt-3 text-xs text-muted-foreground">{formatDate(p.created_at, locale)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Aucun article publié.
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="rounded-3xl gradient-brand p-10 md:p-16 text-center shadow-brand relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 40%)" }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-brand-foreground">Travaillons ensemble.</h2>
            <p className="mt-3 text-brand-foreground/80 max-w-2xl mx-auto">
              Une opportunité à diffuser, un projet tech à lancer ou une collaboration média ? Parlons-en.
            </p>
            <Button asChild size="lg" className="mt-7 bg-white text-[--brand-deep] hover:bg-white/90 font-semibold">
              <Link to="/contact">{t("cta.contactUs")} <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl font-extrabold">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
