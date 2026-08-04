import React from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import hubCvImage from "@/assets/services/conception-cv-professionnel-axee-concept-recrutement-developpement-carriere_981640-71397.jpg";
import coachingImage from "@/assets/services/entraineur-affaires-noir-donnant-presentation-.jpg";
import trainingImage from "@/assets/services/reconnaitre-contributions-impactantes-individus-noi.jpg";
import { Search, Star, FileText, Send } from "lucide-react";

const canonical = `${BASE_URL}/services/hub-candidat-intelligent`;

export default function HubCandidatPage() {
  return (
    <>
      <SEO
        title="Hub Candidat Intelligent"
        description="Un parcours candidat intelligent, de la recherche à l'embauche, avec des outils digitaux pour connecter les talents aux meilleures opportunités."
        canonical={canonical}
        robots="index,follow"
      />

      <main className="container-page pb-16 md:pb-20">
        <div className="mx-auto max-w-4xl space-y-10">
          <section className="relative left-1/2 w-screen -ml-[50vw] bg-white p-10 sm:p-14 overflow-hidden">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary slide-in-left slide-delay-1">
                ✨ Hub Candidat Intelligent
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 slide-in-right slide-delay-2">Un parcours candidat intelligent, de la recherche à l'embauche</h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-700 slide-in-up slide-delay-3">
                  Une expérience digitale conçue pour connecter les talents aux meilleures opportunités grâce à des outils intelligents.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="rounded-[24px] border border-border/80 bg-background p-6 shadow-sm slide-in-left slide-delay-2">
                <h2 className="flex items-center text-2xl font-semibold text-foreground">
                  <Search className="mr-3 h-6 w-6 text-secondary" aria-hidden />
                  Matching intelligent
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Votre profil est analysé pour identifier les offres qui correspondent réellement à vos compétences, expériences et objectifs professionnels.
                </p>
              </article>
              <article className="rounded-[24px] border border-border/80 bg-background p-6 shadow-sm slide-in-right slide-delay-2">
                <h2 className="flex items-center text-2xl font-semibold text-foreground">
                  <Star className="mr-3 h-6 w-6 text-secondary" aria-hidden />
                  Offres recommandées
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Découvrez automatiquement les opportunités les plus pertinentes grâce à une analyse intelligente de votre CV et des besoins des entreprises.
                </p>
              </article>
              <article className="rounded-[24px] border border-border/80 bg-background p-6 shadow-sm slide-in-up slide-delay-3">
                <h2 className="flex items-center text-2xl font-semibold text-foreground">
                  <FileText className="mr-3 h-6 w-6 text-secondary" aria-hidden />
                  Lettre de motivation personnalisée
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Créez rapidement une lettre adaptée à chaque poste grâce à une génération basée sur votre profil et l'offre ciblée.
                </p>
              </article>
              <article className="rounded-[24px] border border-border/80 bg-background p-6 shadow-sm slide-in-up slide-delay-4">
                <h2 className="flex items-center text-2xl font-semibold text-foreground">
                  <Send className="mr-3 h-6 w-6 text-secondary" aria-hidden />
                  Candidature express
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Postulez directement depuis la plateforme en quelques clics et réduisez le temps nécessaire pour saisir une opportunité.
                </p>
              </article>
            </div>
          </section>

          <section className="relative left-1/2 w-screen -ml-[50vw] bg-card p-10 shadow-soft overflow-hidden">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-foreground slide-in-left slide-delay-1">Un parcours humain, étape par étape</h2>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground slide-in-up slide-delay-2">
                Préparer, optimiser, se perfectionner et réussir avec un accompagnement concret à chaque étape.
              </p>
            </div>

            <div className="mt-10 space-y-8">
              <article className="grid gap-6 lg:grid-cols-[1fr_320px] items-center rounded-[28px] border border-border/80 bg-background p-6 shadow-sm slide-in-up slide-delay-2 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-border/100">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Préparer</p>
                  <h3 className="mt-4 text-2xl font-semibold text-foreground">Conception & Refonte CV / Lettre de Motivation</h3>
                </div>
                <img
                  src={hubCvImage}
                  alt="Conception CV professionnel"
                  className="h-64 w-full rounded-3xl object-cover"
                />
              </article>

              <article className="grid gap-6 lg:grid-cols-[1fr_320px] items-center rounded-[28px] border border-border/80 bg-background p-6 shadow-sm slide-in-up slide-delay-3 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-border/100">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Optimiser</p>
                  <h3 className="mt-4 text-2xl font-semibold text-foreground">Orientation Professionnelle & Coaching</h3>
                </div>
                <img
                  src={coachingImage}
                  alt="Orientation professionnelle et coaching"
                  className="h-64 w-full rounded-3xl object-cover"
                />
              </article>

              <article className="grid gap-6 lg:grid-cols-[1fr_320px] items-center rounded-[28px] border border-border/80 bg-background p-6 shadow-sm slide-in-up slide-delay-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-border/100">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Se perfectionner</p>
                  <h3 className="mt-4 text-2xl font-semibold text-foreground">Formations & Renforcement de Compétences</h3>
                </div>
                <img
                  src={trainingImage}
                  alt="Formations et renforcement de compétences"
                  className="h-64 w-full rounded-3xl object-cover"
                />
              </article>

              <article className="rounded-[28px] border border-border/80 bg-background p-6 shadow-sm slide-in-up slide-delay-5 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-border/100">
                <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Réussir</p>
                <h3 className="mt-4 text-2xl font-semibold text-foreground">Décrocher votre prochain emploi</h3>
                <p className="mt-3 text-muted-foreground leading-8">
                  Un accompagnement complet pour transformer vos efforts en une offre acceptée.
                </p>
              </article>
            </div>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between slide-in-up slide-delay-4">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10"
            >
              Retour aux services
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
            >
              Consulter les offres
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
