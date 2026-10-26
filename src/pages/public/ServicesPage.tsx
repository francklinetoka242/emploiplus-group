import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import enterpriseIllustration from "@/assets/services/candidate-journey/success-management.webp";

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Nos solutions RH | EmploiPlus Group"
        description="Nous accompagnons les talents et les entreprises grâce à des solutions RH modernes, digitales et performantes."
        canonical={`${BASE_URL}/services`}
        robots="index,follow"
      />

      <main className="bg-background pb-20 pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            <section className="grid items-center gap-10 border-t border-border pt-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-20">
              <div className="relative overflow-hidden slide-in-left slide-delay-1">
                <img
                  src={enterpriseIllustration}
                  alt="Équipe en réunion autour de solutions de gestion et de performance"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>

              <div className="space-y-7 slide-in-right slide-delay-1">
                <div className="max-w-3xl space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Des solutions RH pour chaque étape de votre organisation
                  </h2>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    Du renfort immédiat au conseil de long terme, nous mobilisons les bonnes
                    compétences et prenons en charge les opérations qui permettent à vos équipes
                    d’avancer.
                  </p>
                </div>

                <div className="divide-y divide-border border-y border-border">
                  {[
                    {
                      number: "01",
                      title: "Mise à disposition & intérim",
                      description:
                        "Des collaborateurs sélectionnés pour un remplacement, un besoin ponctuel ou un renfort durable, avec gestion administrative et suivi RH.",
                      to: "/services/mise-disposition-rh",
                      link: "Découvrir l’intérim",
                    },
                    {
                      number: "02",
                      title: "Recrutement & chasse de tête",
                      description:
                        "Une recherche structurée, de la définition du poste à l’évaluation des profils, jusqu’à leur présentation et leur intégration.",
                      to: "/services/recrutement",
                      link: "Explorer le recrutement",
                    },
                    {
                      number: "03",
                      title: "Externalisation administrative et RH",
                      description:
                        "La gestion de la paie, des dossiers du personnel et des opérations administratives ou techniques, adaptée à votre activité.",
                      to: "/services/externalisation",
                      link: "Voir l’externalisation",
                    },
                    {
                      number: "04",
                      title: "Conseil & formation RH",
                      description:
                        "Des expertises en développement des compétences, carrières, rémunération, relations sociales et transformation RH.",
                      to: "/services/conseil-formation",
                      link: "Découvrir le conseil RH",
                    },
                  ].map(({ number, title, description, to, link }) => (
                    <article
                      key={title}
                      className="grid gap-x-4 gap-y-2 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-y-1"
                    >
                      <span className="row-span-2 pt-0.5 text-xs tabular-nums text-muted-foreground">
                        {number}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {description}
                        </p>
                      </div>
                      <Link
                        to={to}
                        className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:col-start-2"
                      >
                        {link} <span aria-hidden="true">→</span>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default ServicesPage;
