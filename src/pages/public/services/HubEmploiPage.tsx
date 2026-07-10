import React from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, Database, Search } from "lucide-react";
import hubImage from "@/assets/IMG_Page-Services/2147626421.jpg";

const canonical = `${BASE_URL}/services/hub-emploi-recrutement`;

export default function HubEmploiPage() {
  return (
    <>
      <SEO
        title="Hub Emploi & Recrutement"
        description="Connecter les entreprises aux meilleurs talents et accompagner les chercheurs d’emploi vers la réussite."
        canonical={canonical}
        robots="index,follow"
      />

      <main className="container-page pt-3 pb-8 md:pt-5 md:pb-12">
        <div className="mx-auto max-w-4xl">
          {/* B2C Section first, for candidates */}
          <section className="mt-1 md:mt-2">
            <div className="rounded-3xl border border-brand/10 bg-gradient-to-br from-brand/5 via-background to-white p-8 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-brand/15 bg-white/80 px-4 py-2 text-sm font-semibold text-brand shadow-sm">
                    <span>Accompagnement carrière</span>
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                    Pour les candidats
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                    Des services pensés pour valoriser vos compétences, renforcer votre visibilité
                    et accélérer votre insertion professionnelle.
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <section className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full max-w-[280px] overflow-hidden rounded-2xl border border-border/70 shadow-sm lg:order-2">
                      <img
                        src={hubImage}
                        alt="Optimisation de CV & lettres"
                        className="h-44 w-full object-cover"
                      />
                    </div>
                    <div className="max-w-2xl lg:order-1">
                      <div className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                        Positionnement professionnel
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold text-foreground">
                        Optimisation de CV & lettres
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        Des documents clairs, impactants et adaptés aux attentes des recruteurs.
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link to="/candidate/creation-motivation" className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full border-brand text-brand hover:bg-brand/5">
                            Créer ma lettre de motivation
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                        Accompagnement carrière
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold text-foreground">
                        Évaluation des compétences
                      </h3>
                      <p className="mt-3 text-base leading-7 text-muted-foreground">
                        Des tests concrets et des feedbacks utiles pour valider votre profil et
                        révéler votre potentiel.
                      </p>
                    </div>
                    <div className="w-full max-w-[280px] overflow-hidden rounded-2xl border border-border/70 shadow-sm">
                      <img
                        src={hubImage}
                        alt="Évaluation des compétences"
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                        Conseil personnalisé
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold text-foreground">
                        Accompagnement personnalisé
                      </h3>
                      <p className="mt-3 text-base leading-7 text-muted-foreground">
                        Un suivi humain et structuré pour vous aider à faire les bons choix à chaque
                        étape.
                      </p>
                    </div>
                    <div className="w-full max-w-[280px] overflow-hidden rounded-2xl border border-border/70 shadow-sm">
                      <img
                        src={hubImage}
                        alt="Accompagnement personnalisé"
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full max-w-[280px] overflow-hidden rounded-2xl border border-border/70 shadow-sm lg:order-2">
                      <img
                        src={hubImage}
                        alt="Préparation aux entretiens"
                        className="h-44 w-full object-cover"
                      />
                    </div>
                    <div className="max-w-2xl lg:order-1">
                      <div className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                        Préparation à l'embauche
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold text-foreground">
                        Préparation aux entretiens
                      </h3>
                      <p className="mt-3 text-base leading-7 text-muted-foreground">
                        Des simulations réalistes pour gagner en confiance et faire la différence le
                        jour J.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-12 rounded-3xl border border-border/70 bg-white/80 p-8 text-center shadow-sm">
                <p className="text-lg font-medium text-foreground">
                  Prêt à franchir la prochaine étape ?
                </p>
                <p className="mt-2 text-muted-foreground">
                  Nous vous aidons à transformer votre parcours en opportunités concrètes.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href="/contact?subject=Demande%20de%20coaching%20-%20Candidat"
                    className="inline-block"
                  >
                    <Button size="lg" className="bg-brand text-brand-foreground">
                      Je m'inscris
                    </Button>
                  </a>
                  <Link to="/jobs">
                    <Button variant="outline" size="lg">
                      Consulter les offres
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* B2B Section with distinct visual style */}
          <section className="mt-8 md:mt-10">
            <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-soft">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <Link
                    to="/services"
                    className="font-medium text-foreground transition-colors hover:text-brand"
                  >
                    Services
                  </Link>
                  <span>/</span>
                  <span className="font-medium text-brand">Hub Emploi & Recrutement</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <span aria-hidden="true">←</span>
                  <span>Retour</span>
                </button>
              </div>

              <div className="grid gap-10 lg:grid-cols-[minmax(360px,1fr)_420px] items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-semibold text-brand shadow-sm">
                    <span>Recrutement stratégique</span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                      Pour les entreprises
                    </h2>
                    <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                      Solutions dédiées pour recruter mieux et plus vite — services sur-mesure et
                      opérationnels pour répondre à vos besoins RH.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <section
                      className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
                      style={{ animationDelay: "100ms" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                          <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            Publication & diffusion
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Maximisez la visibilité de vos annonces sur nos canaux stratégiques pour
                            attirer des profils cibles.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section
                      className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
                      style={{ animationDelay: "150ms" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                          <Search className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            Recherche & sélection
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Un sourcing sur-mesure et une pré-sélection rigoureuse pour vous faire
                            gagner un temps précieux.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section
                      className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
                      style={{ animationDelay: "200ms" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            Recrutement complet
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Un accompagnement de A à Z par nos experts pour intégrer le
                            collaborateur idéal.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section
                      className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
                      style={{ animationDelay: "250ms" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            Bases de talents
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Accédez à notre vivier exclusif de profils qualifiés et disponibles
                            immédiatement.
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div
                  className="rounded-3xl overflow-hidden border border-border/70 bg-background shadow-sm fade-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <img
                    src={hubImage}
                    alt="Hub Emploi illustration"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-6 shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand/5 text-brand">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </article>
  );
}

function AlternateBlock({
  title,
  detail,
  img,
  reverse,
}: {
  title: string;
  detail: string;
  img: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid gap-6 items-center sm:grid-cols-2 ${reverse ? "sm:grid-flow-col-dense" : ""}`}
    >
      <div className={`${reverse ? "sm:order-2" : ""}`}>
        <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-sm border border-border">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
      <div className={`${reverse ? "sm:order-1 text-right sm:text-left" : ""}`}>
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="mt-3 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
