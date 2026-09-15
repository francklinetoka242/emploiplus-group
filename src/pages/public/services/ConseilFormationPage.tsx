import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import backgroundPage from "@/assets/backgroun-page-services/208is.jpg";
import heroImage from "@/assets/services/enterprise-team-02.webp";
import modalityImage from "@/assets/services/enterprise-team-01.webp";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  ShieldCheck,
  Lightbulb,
  Clock3,
} from "lucide-react";

const heroVisual = {
  src: heroImage,
  alt: "Consultants RH en réunion",
};

const serviceGroups = [
  [
    "Gestion & développement des talents",
    [
      "Évaluation des compétences et du potentiel : Mise en place de processus d’évaluation permettant d’identifier les forces et les axes d’amélioration de vos collaborateurs.",
      "Plan de formation : Élaboration de plans de développement des compétences adaptés aux besoins de vos équipes, avec des solutions de formation personnalisées.",
      "Gestion de la performance : Mise en place de dispositifs d’évaluation, de feedback régulier et de coaching pour renforcer la motivation et l’engagement des collaborateurs.",
    ],
  ],
  [
    "Gestion des carrières & mobilités internes",
    [
      "Accompagnement des parcours professionnels : Mise en place de stratégies de gestion des carrières pour fidéliser vos talents et anticiper les évolutions de postes.",
      "Mobilité interne et gestion des talents : Élaboration de plans de mobilité interne favorisant les évolutions professionnelles au sein de votre organisation.",
      "Gestion de la succession : Préparation des futurs leaders de l’entreprise grâce à des dispositifs d’accompagnement et de formation ciblée.",
    ],
  ],
  [
    "Rémunération & politique salariale",
    [
      "Audit de la politique salariale : Analyse de votre grille salariale et de vos pratiques de rémunération afin de vous aider à attirer et fidéliser vos talents.",
      "Conseil sur la rémunération variable : Élaboration de systèmes de rémunération variable et d’incitations adaptés : primes, bonus, stock-options, etc.",
      "Conformité et gestion des avantages sociaux : Optimisation de vos avantages sociaux dans le respect des législations en vigueur.",
    ],
  ],
  [
    "Gestion des relations sociales & dialogue social",
    [
      "Accompagnement dans les relations avec les syndicats : Mise en place d’une stratégie de dialogue social proactive et accompagnement lors des négociations.",
      "Préparation et gestion des élections professionnelles : Conseil et accompagnement dans l’organisation des élections des représentants du personnel.",
      "Gestion des conflits et médiation : Mise en place de processus de médiation et de gestion des conflits pour préserver un bon climat de travail.",
    ],
  ],
  [
    "Transformation RH & conduite du changement",
    [
      "Accompagnement des transformations organisationnelles : Soutien dans la gestion des changements internes, notamment lors de réorganisations, de fusions ou de l’adoption de nouvelles technologies.",
      "Communication du changement : Élaboration de stratégies de communication interne pour faciliter les transitions et impliquer les collaborateurs.",
      "Soutien et coaching individuel : Accompagnement des collaborateurs pendant les périodes de transformation grâce à des séances de coaching et de soutien favorisant leur adaptation.",
    ],
  ],
  [
    "Gestion de la conformité & risques RH",
    [
      "Audit et conformité légale RH : Vérification de la conformité de vos pratiques RH avec la législation en vigueur : droit du travail, égalité professionnelle, risques psychosociaux, etc.",
      "Préparation aux contrôles sociaux : Accompagnement lors des audits et inspections des autorités compétentes.",
      "Mise en place d’une politique de gestion des risques : Élaboration de stratégies permettant de prévenir et de gérer les risques liés à la santé, à la sécurité et au bien-être au travail.",
    ],
  ],
] as const;

const advantages = [
  [
    "Expertise personnalisée",
    "Nos consultants RH disposent d’expériences variées dans différents secteurs. Ils s’adaptent à vos besoins spécifiques et vous proposent des solutions sur mesure.",
    Users,
  ],
  [
    "Formation adaptée à vos besoins",
    "Nous concevons des actions de formation adaptées aux compétences à développer et aux objectifs de votre organisation.",
    GraduationCap,
  ],
  [
    "Accompagnement tout au long du processus",
    "Du diagnostic initial à la mise en œuvre des solutions, nous vous accompagnons à chaque étape de vos projets RH.",
    Check,
  ],
  [
    "Gestion proactive des défis RH",
    "Nous anticipons les évolutions et les défis RH, notamment les changements législatifs et organisationnels, afin de vous proposer des solutions adaptées.",
    Clock3,
  ],
  [
    "Confidentialité & éthique",
    "Nous assurons la confidentialité de vos données ainsi que le respect des normes légales et déontologiques. Votre entreprise peut compter sur notre discrétion et notre éthique professionnelle.",
    ShieldCheck,
  ],
  [
    "Innovation & outils modernes",
    "Nous intégrons des technologies innovantes et des outils RH modernes afin d’optimiser vos processus et de vous proposer des solutions efficaces.",
    Lightbulb,
  ],
] as const;

const modalities = [
  "Consultation ponctuelle ou mission longue durée : Nous intervenons à la demande ou dans le cadre de projets à long terme, selon vos besoins.",
  "Formation ou accompagnement sur site et à distance : Nos consultants peuvent intervenir auprès de vos équipes dans vos locaux ou à distance, selon les modalités convenues.",
  "Tarification flexible : Nos tarifs sont adaptés à vos besoins et à la taille de votre entreprise. Nous proposons des prestations sur mesure, avec des forfaits ou des interventions à la carte.",
];
export default function ConseilFormationPage() {
  const serviceGroupsRef = useRef<HTMLDivElement>(null);

  const scrollServiceGroups = (direction: number) => {
    serviceGroupsRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  return (
    <>
      <SEO
        title="Conseil & Formation RH"
        description="Des prestations de conseil et de formation RH adaptées aux objectifs, aux besoins et à la culture de votre entreprise."
        canonical={`${BASE_URL}/services/conseil-formation`}
        robots="index,follow"
      />
      <main className="page-image-hover service-page-no-horizontal-rules pb-20 pt-0 md:pb-24 md:pt-0">
        <div className="mx-auto max-w-none">
          <section
            className="relative overflow-hidden px-6 py-8 text-white md:px-10 md:py-12"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.68) 42%, rgba(15, 23, 42, 0.35) 100%), url(${backgroundPage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)] lg:items-center lg:gap-16">
              <div className="max-w-3xl">
                <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
                  Choisissez notre expertise RH
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
                  Que vous soyez une PME ou une grande entreprise, notre équipe de consultants RH
                  expérimentés vous accompagne dans le développement de solutions adaptées à vos
                  objectifs, à vos besoins et à votre culture d’entreprise.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 rounded-xl bg-white text-slate-950 hover:bg-slate-100"
                >
                  <Link to="/contact?subject=Demande%20de%20conseil%20et%20formation%20RH">
                    Parler à un consultant
                  </Link>
                </Button>
              </div>
              <div className="relative overflow-hidden bg-slate-100/10 backdrop-blur-[2px]">
                <img
                  src={heroVisual.src}
                  alt={heroVisual.alt}
                  className="h-72 w-full object-cover lg:h-96"
                />
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 border-b border-border py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
              <div className="max-w-3xl">
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Nos services de conseil & formation RH
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  Nous vous accompagnons dans la gestion et le développement de vos ressources
                  humaines grâce à des prestations de conseil et de formation adaptées à votre
                  organisation et à vos enjeux.
                </p>
              </div>
              <div className="relative mt-10 rounded-[2rem] bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] bg-[length:18px_18px] p-3 md:p-6">
                <div ref={serviceGroupsRef} className="service-groups-marquee overflow-x-auto overflow-y-hidden">
                  <div className="flex w-full gap-5 py-5">
                    {serviceGroups.map(([title, items], index) => (
                      <article
                        key={title}
                        className="group flex min-h-[32rem] w-[min(82vw,22rem)] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-1 lg:w-auto lg:flex-[0_0_calc((100%_-_2.5rem)/3)]"
                      >
                        <div className="p-6 pb-5 md:p-7 md:pb-5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <span className="text-sm font-bold">0{index + 1}</span>
                            </span>
                          </div>
                          <h3 className="mt-7 text-xl font-bold leading-tight tracking-tight text-slate-950">
                            {title}
                          </h3>
                        </div>
                        <div className="mx-6 border-t border-slate-200 md:mx-7" />
                        <div className="flex flex-1 flex-col p-6 pt-5 md:p-7 md:pt-5">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950">
                            Inclus
                          </p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            {items.map((item) => (
                              <li key={item} className="flex gap-3">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <Check className="size-3.5" aria-hidden="true" />
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link
                          to="/contact?subject=Demande%20de%20conseil%20et%20formation%20RH"
                          className="flex items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Parler à un expert
                          <span aria-hidden="true">→</span>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Faire défiler les services vers la gauche"
                  onClick={() => scrollServiceGroups(-1)}
                  className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Faire défiler les services vers la droite"
                  onClick={() => scrollServiceGroups(1)}
                  className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 externalisation-full-bleed bg-brand py-14 text-brand-foreground md:py-20">
            <div className="mx-auto max-w-6xl px-5 md:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Pourquoi choisir notre service de conseil & formation RH ?
                </h2>
                <p className="mt-5 text-base leading-8 text-white/80">
                  En faisant appel à notre expertise, vous bénéficiez de conseils personnalisés et
                  de formations adaptées pour répondre aux défis actuels de votre organisation.
                </p>
              </div>
              <div className="mt-10 grid sm:grid-cols-2">
                {advantages.map(([title, description, Icon]) => (
                  <article key={title} className="py-6 sm:px-6 sm:nth-[2n+1]:pl-0 sm:nth-[2n]:pr-0">
                    <h3 className="mt-3 flex items-start gap-3 text-lg font-semibold text-white">
                      <Icon className="mt-1 size-4 shrink-0 text-cyan-300" aria-hidden="true" />
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/75">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 bg-slate-50 py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src={modalityImage}
                    alt="Consultants en réunion de travail"
                    className="h-80 w-full rounded-[1.5rem] object-cover lg:h-[27rem]"
                  />
                </div>
                <div>
                  <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                    Nos modalités d’intervention
                  </h2>
                  <p className="mt-5 text-base leading-8 text-muted-foreground">
                    Nous sommes là pour vous conseiller, développer les compétences de vos équipes,
                    optimiser vos processus RH et vous aider à atteindre vos objectifs stratégiques.
                  </p>
                  <div className="mt-8 divide-y divide-border border-y border-border">
                    {modalities.map((item) => {
                      const [title, description] = item.split(": ");

                      return (
                        <div key={item} className="flex gap-4 py-5">
                          <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                            <Check className="size-5" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{title}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="mt-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link to="/contact?subject=Demande%20de%20conseil%20et%20formation%20RH">
                      Contactez-nous
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
