import React from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/features/seo";
import { Search, Star, FileText, Send, BriefcaseBusiness, Compass, GraduationCap, Trophy } from "lucide-react";

const canonical = `${BASE_URL}/services/hub-candidat-intelligent`;

const featureHighlights = [
  {
    icon: Search,
    title: "Matching intelligent",
    description:
      "Votre profil est analysé pour identifier les offres qui correspondent réellement à vos compétences, expériences et objectifs professionnels.",
  },
  {
    icon: Star,
    title: "Offres recommandées",
    description:
      "Découvrez automatiquement les opportunités les plus pertinentes grâce à une analyse intelligente de votre CV et des besoins des entreprises.",
  },
  {
    icon: FileText,
    title: "Lettre de motivation personnalisée",
    description:
      "Créez rapidement une lettre adaptée à chaque poste grâce à une génération basée sur votre profil et l'offre ciblée.",
  },
  {
    icon: Send,
    title: "Candidature express",
    description:
      "Postulez directement depuis la plateforme en quelques clics et réduisez le temps nécessaire pour saisir une opportunité.",
  },
];

const journeySteps = [
  {
    label: "Préparer",
    title: "Conception & Refonte CV / Lettre de Motivation",
    intro: "On met en avant ce que vous avez de plus fort.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Optimiser",
    title: "Orientation Professionnelle & Coaching",
    intro: "On clarifie votre positionnement et vos priorités professionnelles.",
    icon: Compass,
  },
  {
    label: "Se perfectionner",
    title: "Formations & Renforcement de Compétences",
    intro: "On complète vos compétences pour mieux répondre aux métiers ciblés.",
    icon: GraduationCap,
  },
  {
    label: "Réussir",
    title: "Décrocher votre prochain emploi",
    intro: "On transforme les efforts en candidatures concrètes et crédibles.",
    icon: Trophy,
  },
];

export default function HubCandidatPage() {
  return (
    <>
      <SEO
        title="Hub Candidat Intelligent"
        description="Un parcours candidat intelligent, de la recherche à l'embauche, avec des outils digitaux pour connecter les talents aux meilleures opportunités."
        canonical={canonical}
        robots="index,follow"
      />

      <main className="container-page overflow-x-hidden pb-16 md:pb-20">
        <div className="w-full space-y-10 overflow-x-hidden">
          <section className="ambient-glow relative w-full overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-12" style={{ borderRadius: 0, marginLeft: 0, marginRight: 0 }}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,158,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(232,169,0,0.08),transparent_28%)] float-soft" />
            <div className="relative mx-auto max-w-6xl">
              <div className="max-w-3xl space-y-6">
                <span className="inline-flex items-center rounded-full border border-brand/15 bg-brand/5 px-4 py-2 text-sm font-semibold text-brand slide-in-left slide-delay-1 soft-pulse">
                  ✨ Hub Candidat Intelligent
                </span>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-950 slide-in-right slide-delay-2 md:text-5xl">
                    Un parcours candidat intelligent, de la recherche à l'embauche
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-700 slide-in-up slide-delay-3">
                    Une expérience digitale conçue pour connecter les talents aux meilleures opportunités grâce à des outils intelligents.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {featureHighlights.map(({ icon: Icon, title, description }, index) => (
                  <article
                    key={title}
                    className="card-lift shimmer-line flex items-start gap-4 border-t border-border pt-5 slide-in-up"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="float-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full bg-card px-4 py-8 sm:px-6 lg:px-8 lg:py-12" style={{ borderRadius: 0, marginLeft: 0, marginRight: 0 }}>
            <div className="mx-auto max-w-6xl">
              <div className="max-w-3xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand slide-in-left slide-delay-1">
                  Parcours candidat
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground slide-in-left slide-delay-2 md:text-4xl">
                  Un parcours humain, étape par étape
                </h2>
                <p className="text-base leading-8 text-muted-foreground slide-in-up slide-delay-3">
                  Préparer, optimiser, se perfectionner et réussir avec un accompagnement concret à chaque étape.
                </p>
              </div>

              <div className="mt-10 space-y-0 border-t border-border">
                {journeySteps.map(({ label, title, intro, icon: Icon }, index) => (
                  <article
                    key={title}
                    className="card-lift grid gap-5 border-b border-border py-6 md:grid-cols-[160px_1fr] md:items-start slide-in-up"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="flex items-center gap-3 md:block">
                      <div className="soft-pulse flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand md:h-12 md:w-12">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand md:mt-3">{label}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
                      <p className="text-base leading-7 text-muted-foreground">{intro}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 border-y border-border py-8 slide-in-up slide-delay-6 sm:py-10">
            <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-12">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Étape suivante</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Prêt à passer à l'étape suivante ?
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                  Rejoignez notre hub candidat et accédez à des offres qualifiées, un accompagnement personnalisé et une visibilité renforcée.
                </p>

                <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
                  <Button asChild size="lg" variant="default">
                    <Link to="/candidate/signup">Je crée mon compte</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/candidate/login">Connexion</Link>
                  </Button>
                </div>
              </div>

              <aside className="border-l-2 border-emerald-300 pl-6 lg:pl-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">WhatsApp</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Partage Multical</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Recevez gratuitement les dernières offres d'emploi partagées en temps réel.
                </p>
                <a
                  href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631"
                  target="_blank"
                  rel="noreferrer"
                  className="link link-animated mt-5 inline-flex items-center text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
                >
                  S'abonner à la chaîne
                </a>
              </aside>
            </div>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between slide-in-up slide-delay-4">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              Retour aux services
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition duration-300 hover:-translate-y-0.5 hover:bg-brand/90"
            >
              Consulter les offres
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
