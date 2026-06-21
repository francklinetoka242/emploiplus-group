import React from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "./assets/hero-bg.jpg";
import logoMonago from "./assets/logo-monago.jpg";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, DEFAULT_SEO } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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
        .select("id, slug, title, company, location_city, location_country, status, publish_at")
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
  const { offers: homeJobs, loading: jobsLoading } = usePublishedJobOffers(4);
  const { posts: homePosts, loading: postsLoading } = usePublishedBlogPosts(3);

  const stats = [
    { value: "50+", label: "Offres diffusées" },
    { value: "11+", label: "Entreprises partenaires" },
    { value: "20+", label: "Lecteurs / mois" },
  ];

  const services = [
    { title: "Services numériques", description: "Solutions web et expérience digitale pour vous démarquer." },
    { title: "Diffusion d'offres", description: "Publiez vos offres et touchez des candidats qualifiés." },
    { title: "Contenu média", description: "Articles métiers et insights pour faire grandir votre visibilité." },
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
                Tech · Emplois · Médias
              </p>
              <h1 className="mt-8 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white fade-up" style={{ animationDelay: '180ms' }}>
                Construisez votre prochaine étape professionnelle avec EmploiPlus Group.
              </h1>
              <p className="mt-6 max-w-2xl text-base text-white/90 leading-relaxed fade-up" style={{ animationDelay: '260ms' }}>
                EmploiPlus Group offre une présence digitale moderne, une diffusion ciblée d'offres d'emploi et des services numériques pour les talents et les entreprises.
              </p>
              <div className="mt-10 flex flex-wrap gap-3 fade-up" style={{ animationDelay: '340ms' }}>
                <Button asChild size="lg" className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
                  <Link to="/jobs">Voir les offres</Link>
                </Button>
                <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90 shadow-lg">
                  <Link to="/services">Nos services</Link>
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
                  <div className="mt-3 text-sm text-muted-foreground">{item.label}</div>
                </article>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeader title="Nos services" subtitle="Une plateforme pensée pour les entreprises et les talents." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((item, i) => (
            <article key={item.title} className="rounded-3xl transform transition-transform hover:-translate-y-1 hover:shadow-xl fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="p-[1px] rounded-3xl gradient-brand">
                <div className="rounded-3xl bg-card p-6 h-full">
                  <h2 className="font-display text-lg font-bold text-foreground">{item.title}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{item.description}</p>
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
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">Dernières offres</h2>
              <p className="mt-2 text-muted-foreground">Trouvez votre prochain poste parmi nos opportunités sélectionnées.</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/jobs">Voir toutes les offres</Link>
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
                const location = [job.location_city, job.location_country].filter(Boolean).join(", ") || "Télétravail";
                return (
                  <article key={job.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up" style={{ animationDelay: `${i * 120}ms` }}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.company}</div>
                    <h3 className="mt-3 font-display text-xl font-bold text-foreground">{job.title}</h3>
                    <div className="mt-3 text-sm text-muted-foreground">{location}</div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">Aucune offre publiée disponible pour le moment.</div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">Du blog</h2>
            <p className="mt-2 text-muted-foreground">Conseils et actualités pour les talents et les entreprises.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/blog">Voir le blog</Link>
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
                <p className="mt-3 text-muted-foreground leading-relaxed">{post.excerpt || post.subtitle || "Article à découvrir."}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">Aucun article publié disponible pour le moment.</div>
          )}
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeader title="Nos partenaires" subtitle="Collaborations stratégiques pour vos projets." />
        <div className="mt-12 flex items-center justify-center gap-8">
          <img src={logoMonago} alt="Partenaire" className="h-16 md:h-20 rounded-lg bg-card border border-border p-2 shadow-soft hover:shadow-elev transition-all" />
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-3xl gradient-brand p-10 md:p-16 text-center shadow-brand relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 40%)" }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-brand-foreground">Travaillons ensemble.</h2>
            <p className="mt-3 text-brand-foreground/80 max-w-2xl mx-auto">
              Une opportunité à diffuser, un projet tech à lancer ou une collaboration média ? Parlons-en.
            </p>
            <Button asChild size="lg" className="mt-7 bg-white text-[--brand-deep] hover:bg-white/90 font-semibold">
              <Link to="/contact">Contactez-nous</Link>
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
  const values = [
    { icon: '🤝', title: 'Transparence et proximité', description: 'Nous travaillons en confiance, à l\'écoute de vos vrais besoins.' },
    { icon: '⚙️', title: 'Expertise tech et emploi', description: 'Maîtrise profonde des technologies et de l\'écosystème recrutement.' },
    { icon: '📈', title: 'Performances mesurables', description: 'Résultats concrets et chiffrés pour justifier votre investissement.' },
  ];

  const pillars = [
    { title: 'Développement numérique', description: 'Accompagnement complet pour transformer votre présence digitale.' },
    { title: 'Diffusion d\'offres', description: 'Stratégies pour atteindre les meilleurs talents sur les bons canaux.' },
    { title: 'Médias & contenu', description: 'Production de contenus métier qui engagent vos audiences.' },
  ];

  return (
    <>
      {usePageSEO({
        title: "À propos - EmploiPlus Group",
        description: "Découvrez notre mission, nos valeurs et nos trois piliers: développement numérique, diffusion d'offres d'emploi et services médias.",
        keywords: "à propos, mission, valeurs, services numériques, emploi, Congo",
        canonical: "https://emploiplus.group/#/about",
      })}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Notre mission</h2>
              <p className="text-lg text-foreground/90 leading-relaxed">
                EmploiPlus Group accompagne les entreprises dans leur développement numérique et accompagne les talents dans leur recherche d'opportunités.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">Notre approche</h3>
              <p className="text-base text-foreground/80 leading-relaxed">
                Nous concevons des stratégies de diffusion, produisons du contenu métier et développons des solutions numériques adaptées aux besoins locaux et internationaux.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">Notre promesse</h3>
              <p className="text-base text-foreground/80 leading-relaxed">
                Notre approche combine savoir-faire humain, technologies modernes et exigence sur l'expérience utilisateur pour délivrer des résultats mesurables.
              </p>
            </div>
          </div>
          
          <div className="rounded-2xl p-[1px] gradient-brand">
            <div className="rounded-2xl bg-card p-8 space-y-8">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-6">Nos valeurs</h3>
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
        </div>
      </section>

      <section className="bg-secondary/10 border-y border-border py-16 md:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">Nos trois piliers</h2>
            <p className="mt-3 text-muted-foreground">Les fondations de notre stratégie pour vos succès</p>
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Pourquoi nous choisir ?</h2>
            <div className="grid gap-6 md:grid-cols-3 mt-8">
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">50+</p>
                <p className="text-foreground/80">Offres diffusées</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">11+</p>
                <p className="text-foreground/80">Entreprises partenaires</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">20+</p>
                <p className="text-foreground/80">Lecteurs mensuels</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ServicesPage() {
  return (
    <>
      {usePageSEO({
        title: "Nos services",
        description: "Services de diffusion d'offres d'emploi, développement web, stratégie média et conseils digital pour les entreprises.",
        keywords: "services, offres emploi, développement web, stratégie média, branding employeur",
        canonical: "https://emploiplus.group/#/services",
      })}
      <PageHeading
        title="Nos services"
        description="Des solutions sur mesure pour la diffusion, le développement numérique et la communication média."
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Diffusion d'offres d'emploi", description: "Attirez les bons profils avec des annonces visibles et ciblées." },
            { title: "Développement web", description: "Création de sites, applications et plateformes sur mesure." },
            { title: "Stratégie média", description: "Contenu, blog et visibilité pour renforcer votre image." },
            { title: "Branding employeur", description: "Valorisez votre marque pour attirer les meilleurs talents." },
            { title: "Conseil digital", description: "Actions concrètes pour optimiser vos performances en ligne." },
            { title: "Support opérationnel", description: "Accompagnement de A à Z sur vos projets numériques. " },
          ].map((item, i) => (
            <article key={item.title} className="rounded-3xl transform transition-transform hover:-translate-y-1 hover:shadow-xl fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="p-[1px] rounded-3xl gradient-brand">
                <div className="rounded-3xl bg-card p-6 h-full">
                  <h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{item.description}</p>
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

  return (
    <>
      {usePageSEO({
        title: "Offres d'emploi",
        description: "Découvrez nos dernières offres d'emploi en Afrique et accédez à des opportunités professionnelles sélectionnées.",
        keywords: "offres d'emploi, opportunités, recrutement, emploi Congo",
        canonical: "https://emploiplus.group/#/jobs",
      })}
      <PageHeading title={t("jobs.title")} description={t("jobs.subtitle")} />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p className="fade-up" style={{ animationDelay: '80ms' }}>
              Retrouvez une sélection d'opportunités professionnelles triées pour vous aider à trouver votre prochain poste rapidement.
            </p>
            <p className="fade-up" style={{ animationDelay: '160ms' }}>
              Pour consulter toutes les offres et contacter notre équipe recrutement, utilisez l'espace dédié ou envoyez-nous un message via le formulaire de contact.
            </p>
            <div className="mt-6 grid gap-4">
              {loading ? (
                [1, 2, 3].map((index) => (
                  <article key={index} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse" />
                ))
              ) : offers.length > 0 ? (
                offers.map((job, i) => {
                  const location = [job.location_city, job.location_country].filter(Boolean).join(", ") || "Télétravail";
                  return (
                    <article key={job.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.company}</div>
                      <h3 className="mt-3 font-display text-xl font-bold text-foreground">{job.title}</h3>
                      <div className="mt-3 text-sm text-muted-foreground">{location}</div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">Aucune offre publiée disponible pour le moment.</div>
              )}
            </div>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-8 shadow-soft fade-up" style={{ animationDelay: '240ms' }}>
            <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Accès rapide</div>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              Visitez notre chaîne WhatsApp pour recevoir les dernières offres et mises à jour emploi.
            </p>
            <a href="https://chat.whatsapp.com/JxHlaMwrzBA6gUopLg7C5s" target="_blank" rel="noreferrer" className="inline-flex mt-6 items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
              Rejoindre WhatsApp
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}

export function BlogPage() {
  const { posts, loading } = usePublishedBlogPosts(9);

  return (
    <>
      {usePageSEO({
        title: "Blog - Articles et conseils emploi",
        description: "Articles, conseils carrière et actualités pour les talents et les entreprises.",
        keywords: "blog, articles, conseils carrière, actualités emploi, recrutement",
        canonical: "https://emploiplus.group/#/blog",
      })}
      <PageHeading
        title="Blog EmploiPlus"
        description="Articles, conseils carrière et actualités pour les talents et les entreprises."
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
                <p className="mt-3 text-muted-foreground leading-relaxed">{post.excerpt || post.subtitle || "Article à découvrir."}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">Aucun article publié disponible pour le moment.</div>
          )}
        </div>
      </section>
    </>
  );
}

export function ContactPage() {
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
        title: "Nous contacter",
        description: "Contactez EmploiPlus Group pour vos besoins en recrutement, développement web ou stratégie média.",
        keywords: "contact, nous contacter, support, recrutement, développement web",
        canonical: "https://emploiplus.group/#/contact",
      })}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">Écrivez-nous</h2>
              <p className="mt-2 text-muted-foreground">Nous répondons rapidement à toutes les demandes en recrutement, technologie ou stratégie médias.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Sujet</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Parlez-nous de votre projet"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Décrivez votre besoin..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
              <Button size="lg" className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold shadow-brand">
                Envoyer le message
              </Button>
            </form>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Direct Contact Card */}
            <div className="rounded-2xl p-[1px] gradient-brand">
              <div className="rounded-2xl bg-card p-8 space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">Contact direct</h3>
                  <div className="space-y-5">
                    {/* Phone */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand/10">
                          <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Téléphone</p>
                        <a href="tel:+242067311033" className="text-lg font-semibold text-brand hover:text-brand/80">+242 0673 11033</a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand/10">
                          <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Email</p>
                        <a href="mailto:contact@emploiplus.group" className="text-lg font-semibold text-foreground hover:text-brand">contact@emploiplus.group</a>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand/10">
                          <svg className="h-6 w-6 text-brand" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.783 1.14L.855 2.6l1.508 4.514c-.915 1.594-1.395 3.472-1.395 5.441 0 5.346 4.357 9.704 9.704 9.704 2.592 0 5.023-.997 6.858-2.809 1.835-1.811 2.846-4.233 2.846-6.895 0-5.346-4.357-9.704-9.704-9.704z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">WhatsApp</p>
                        <a href="https://chat.whatsapp.com/JxHlaMwrzBA6gUopLg7C5s" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lg font-semibold text-brand hover:text-brand/80">Rejoindre le groupe</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Localisation</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">Siège social</p>
                  <p className="text-lg text-foreground font-semibold">Pointe-Noire</p>
                  <p className="text-foreground/80">République du Congo</p>
                </div>
                <a href="https://goo.gl/maps/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/5 transition-colors">
                  Voir sur la carte
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function AuthPage() {
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
      setMessage("Connexion réussie. Redirection en cours...");
      navigate("/admin");
    }
  };

  return (
    <>
      {usePageSEO({
        title: "Connexion administrateur",
        description: "Connectez-vous à votre espace administrateur EmploiPlus Group pour gérer vos offres et contenus.",
        canonical: "https://emploiplus.group/#/auth",
      })}
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 shadow-soft">
          <h1 className="font-display text-3xl font-bold text-foreground text-center">Espace administrateur</h1>
          <p className="mt-4 text-muted-foreground text-center">
            Connectez-vous avec votre email et mot de passe pour accéder à l'espace d'administration.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="auth-password">
                Mot de passe
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="••••••••"
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
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export function AdminPage() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/auth");
  };

  if (loading) {
    return (
      <>
        {usePageSEO({
          title: "Tableau de bord administrateur",
          description: "Gestion administrative de vos offres d'emploi et contenus blog.",
          canonical: "https://emploiplus.group/#/admin",
        })}
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <p className="text-muted-foreground">Chargement du compte administrateur...</p>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        {usePageSEO({
          title: "Tableau de bord administrateur",
          description: "Gestion administrative de vos offres d'emploi et contenus blog.",
          canonical: "https://emploiplus.group/#/admin",
        })}
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <h1 className="font-display text-3xl font-bold text-foreground">Administration</h1>
            <p className="mt-4 text-muted-foreground">Vous devez vous connecter pour accéder à cet espace.</p>
            <div className="mt-8">
              <Link to="/auth" className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
                Retour à la connexion
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
        title: "Tableau de bord administrateur",
        description: "Gestion administrative de vos offres d'emploi et contenus blog.",
        canonical: "https://emploiplus.group/#/admin",
      })}
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-soft">
          <h1 className="font-display text-3xl font-bold text-foreground">Tableau de bord administrateur</h1>
          <p className="mt-4 text-muted-foreground">Connecté en tant que <strong>{session.user?.email}</strong>.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Offres</h2>
              <p className="mt-3 text-sm text-muted-foreground">Gérez les annonces d'emploi publiées et celles à venir.</p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Blog</h2>
              <p className="mt-3 text-sm text-muted-foreground">Accédez aux articles et publiez vos contenus métier.</p>
            </div>
          </div>
          <div className="mt-8 text-right">
            <Button onClick={handleSignOut} size="lg" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </>
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
