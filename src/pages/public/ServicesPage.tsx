import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Check, User, Sparkles, Bell, Zap, Eye, MapPin, Users, Layers, TrendingUp } from "lucide-react";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import candidateIllustration from "@/assets/services/conception-cv-professionnel-axee-concept-recrutement-developpement-carriere_981640-71397.jpg";
import enterpriseIllustration from "@/assets/services/directeur-souriant-tenant-document-important-colleg.jpg";

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Nos solutions RH | EmploiPlus Group"
        description="Nous accompagnons les talents et les entreprises grâce à des solutions RH modernes, digitales et performantes."
        canonical={`${BASE_URL}/services`}
        robots="index,follow"
      />

      <main className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="space-y-6 text-center">
          </header>

          <div className="space-y-24">
            <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
              <div className="space-y-8 slide-in-left slide-delay-1">
                <div className="inline-flex items-center rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-brand">
                  Candidat
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Un parcours candidat fluide et efficace
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-slate-600">
                    Explorez les offres, préparez votre profil et postulez en quelques étapes. Tout est pensé pour gagner du temps et vous mettre en valeur.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Sparkles,
                      label: "Matching intelligent adapté à votre profil",
                    },
                    {
                      icon: Bell,
                      label: "Offres recommandées et mises à jour",
                    },
                    {
                      icon: Zap,
                      label: "Candidature express en quelques clics",
                    },
                    {
                      icon: Eye,
                      label: "Outils de visibilité professionnelle",
                    },
                  ].map(({ icon: Icon, label }, index) => (
                    <div
                      key={label}
                      className={
                        `rounded-3xl bg-white px-6 py-5 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md slide-in-up` +
                        ` slide-delay-${index + 2}`
                      }
                    >
                      <div className="flex items-center gap-3 text-brand">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-slate-900">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/services/hub-candidat-intelligent"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-brand-dark slide-in-up slide-delay-4"
                >
                  Découvrir l'espace candidat
                </Link>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] bg-white slide-in-right slide-delay-1">
                <img
                  src={candidateIllustration}
                  alt="Parcours candidat et recrutement"
                  className="h-full w-full object-cover transition duration-500 ease-out hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent" />
              </div>
            </section>

            <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-center">
              <div className="relative overflow-hidden rounded-[2rem] bg-white slide-in-left slide-delay-1">
                <img
                  src={enterpriseIllustration}
                  alt="Solutions entreprise et BPO"
                  className="h-full w-full object-cover transition duration-500 ease-out hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent" />
              </div>

              <div className="space-y-8 slide-in-right slide-delay-1">
                <div className="inline-flex items-center rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-brand">
                  Entreprise
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Une solution RH professionnelle et sur mesure
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-slate-600">
                    Externalisation métier, délégation et pilotage opérationnel pour faire évoluer votre organisation avec sérénité.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: MapPin,
                      label: "Cadrage précis des besoins RH",
                    },
                    {
                      icon: Users,
                      label: "Ressources qualifiées et opérationnelles",
                    },
                    {
                      icon: Layers,
                      label: "Pilotage continu et reporting clair",
                    },
                    {
                      icon: TrendingUp,
                      label: "Valorisation de la performance RH",
                    },
                  ].map(({ icon: Icon, label }, index) => (
                    <div
                      key={label}
                      className={
                        `rounded-3xl bg-white px-6 py-5 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md slide-in-up` +
                        ` slide-delay-${index + 2}`
                      }
                    >
                      <div className="flex items-center gap-3 text-brand">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-slate-900">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/services/solutions-entreprises-bpo"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-brand-dark slide-in-up slide-delay-4"
                >
                  Découvrir nos solutions
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default ServicesPage;
