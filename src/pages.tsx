import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

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

export function HomePage() {
  const { t } = useI18n();

  const stats = [
    { value: "50+", label: "Offres diffusées" },
    { value: "11+", label: "Entreprises partenaires" },
    { value: "20+", label: "Lecteurs / mois" },
  ];

  const services = [
    { title: "Services numériques", description: "Solutions web et expérience digitale pour vous démarquer." },
    { title: "Diffusion d’offres", description: "Publiez vos offres et touchez des candidats qualifiés." },
    { title: "Contenu média", description: "Articles métiers et insights pour faire grandir votre visibilité." },
  ];

  const jobs = [
    { title: "Chargé(e) de communication digitale", company: "EmploiPlus Group", location: "Pointe-Noire, Congo" },
    { title: "Développeur(se) front-end", company: "Tech Partners", location: "Télétravail" },
  ];

  const posts = [
    { title: "Tendances recrutement 2026", excerpt: "Les nouvelles attentes des talents et les bons leviers pour vos annonces." },
    { title: "Optimiser votre présence digitale", excerpt: "Boostez votre visibilité avec une stratégie média claire et efficace." },
    { title: "Créer du contenu qui engage", excerpt: "Comment parler aux candidats et aux clients sur les bons canaux." },
  ];

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
        <div className="absolute inset-0 -z-10">
          <img src="/hero-bg.jpg" alt="" width={1920} height={1080} className="size-full object-cover opacity-90" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.15_0.06_255/0.25)] via-[oklch(0.15_0.06_255/0.4)] to-[rgba(255,255,255,0.08)]" />
        </div>
        <div className="container-page py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px] items-center">
            <div>
              <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-foreground ring-1 ring-primary/10">
                Tech · Emplois · Médias
              </p>
              <h1 className="mt-8 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                Construisez votre prochaine étape professionnelle avec EmploiPlus Group.
              </h1>
              <p className="mt-6 max-w-2xl text-base text-muted-foreground leading-relaxed">
                EmploiPlus Group offre une présence digitale moderne, une diffusion ciblée d’offres d’emploi et des services numériques pour les talents et les entreprises.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
                  <Link to="/jobs">Voir les offres</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border border-border text-foreground hover:bg-accent/10">
                  <Link to="/services">Nos services</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-elev">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Notre mission</div>
              <p className="mt-4 text-foreground/90 leading-relaxed">
                Connecter les talents, les entreprises et les médias dans un espace numérique simple, performant et accessible.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
                <li>✓ Diffusion d’offres qualifiées</li>
                <li>✓ Stratégie digitale et visibilité</li>
                <li>✓ Contenu média professionnel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <article key={item.label} className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
              <div className="text-4xl font-display font-extrabold text-foreground">{item.value}</div>
              <div className="mt-3 text-sm text-muted-foreground">{item.label}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeader title="Nos services" subtitle="Une plateforme pensée pour les entreprises et les talents." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <article key={item.title} className="rounded-3xl border border-border bg-card p-8 shadow-soft hover:border-brand transition-colors">
              <h2 className="font-display text-xl font-bold text-foreground">{item.title}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{item.description}</p>
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
            {jobs.map((job) => (
              <article key={job.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.company}</div>
                <h3 className="mt-3 font-display text-xl font-bold text-foreground">{job.title}</h3>
                <div className="mt-3 text-sm text-muted-foreground">{job.location}</div>
              </article>
            ))}
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
          {posts.map((post) => (
            <article key={post.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all">
              <h3 className="font-display text-xl font-bold text-foreground">{post.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
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
  return (
    <>
      <PageHeading
        title="À propos d’EmploiPlus Group"
        description="Une équipe qui accompagne les entreprises sur la technologie, la diffusion d’offres et le média emploi."
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p>
              EmploiPlus Group aide les entreprises à recruter et à se développer sur le web, tout en accompagnant les talents dans leur recherche d’opportunités.
            </p>
            <p>
              Nous réalisons des stratégies de diffusion, des créations de contenu et des solutions numériques adaptées aux besoins locaux et internationaux.
            </p>
            <p>
              Notre approche est simple : des services humains, une technologie moderne et une attention constante à la qualité de l’expérience.
            </p>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-8 shadow-soft">
            <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Nos valeurs</div>
            <ul className="mt-6 space-y-4 text-sm text-foreground/90">
              <li>• Transparence et proximité</li>
              <li>• Expertise tech et emploi</li>
              <li>• Performances mesurables</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}

export function ServicesPage() {
  return (
    <>
      <PageHeading
        title="Nos services"
        description="Des solutions sur mesure pour la diffusion, le développement numérique et la communication média."
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Diffusion d’offres d’emploi", description: "Attirez les bons profils avec des annonces visibles et ciblées." },
            { title: "Développement web", description: "Création de sites, applications et plateformes sur mesure." },
            { title: "Stratégie média", description: "Contenu, blog et visibilité pour renforcer votre image." },
            { title: "Branding employeur", description: "Valorisez votre marque pour attirer les meilleurs talents." },
            { title: "Conseil digital", description: "Actions concrètes pour optimiser vos performances en ligne." },
            { title: "Support opérationnel", description: "Accompagnement de A à Z sur vos projets numériques. " },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl border border-border bg-card p-8 shadow-soft hover:border-brand transition-colors">
              <h2 className="font-display text-xl font-semibold text-foreground">{item.title}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function JobsPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHeading title={t("jobs.title")} description={t("jobs.subtitle")} />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p>
              Retrouvez une sélection d’opportunités professionnelles triées pour vous aider à trouver votre prochain poste rapidement.
            </p>
            <p>
              Pour consulter toutes les offres et contacter notre équipe recrutement, utilisez l’espace dédié ou envoyez-nous un message via le formulaire de contact.
            </p>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-8 shadow-soft">
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
  return (
    <>
      <PageHeading
        title="Blog EmploiPlus"
        description="Articles, conseils carrière et actualités pour les talents et les entreprises."
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
          <p className="text-foreground/90 leading-relaxed">
            Le blog est en cours de migration. Retrouvez bientôt nos analyses, nos conseils carrière et nos actualités média.
          </p>
        </div>
      </section>
    </>
  );
}

export function ContactPage() {
  return (
    <>
      <PageHeading
        title="Contactez-nous"
        description="Une question, un projet ou une collaboration ? Nous sommes là pour vous répondre rapidement."
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p>Écrivez-nous pour vos besoins en recrutement, technologie ou stratégie médias.</p>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Contact direct</div>
              <div className="mt-6 space-y-3 text-sm text-foreground/90">
                <div>Téléphone : +242 0673 11033</div>
                <div>Email : contact@emploiplus.group</div>
                <div>Whatsapp : <a href="https://chat.whatsapp.com/JxHlaMwrzBA6gUopLg7C5s" target="_blank" rel="noreferrer" className="text-brand hover:underline">Rejoindre</a></div>
              </div>
            </div>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-8 shadow-soft">
            <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Location</div>
            <p className="mt-4 text-foreground/90 leading-relaxed">Pointe-Noire, République du Congo</p>
            <a href="https://goo.gl/maps/" target="_blank" rel="noreferrer" className="inline-flex mt-6 items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
              Voir sur la carte
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}

export function AuthPage() {
  return (
    <div className="container-page py-20 md:py-28">
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <h1 className="font-display text-3xl font-bold text-foreground">Espace administrateur</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Cette interface est réservée aux administrateurs. La connexion sera bientôt rétablie pour la version SPA.
        </p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="container-page py-20 md:py-28">
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">Page introuvable.</p>
        <Link to="/" className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
