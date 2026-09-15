import { Link } from "react-router-dom";
import {
  Check,
  ClipboardCheck,
  FileSearch,
  MessageSquareText,
  Search,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/features/seo";
import backgroundPage from "@/assets/backgroun-page-services/208is.jpg";
import recruitmentImage from "@/assets/home/home-recruitment-image.webp";

const heroVisual = {
  src: recruitmentImage,
  alt: "Échange professionnel entre recruteur et candidat",
};

const advantages = [
  {
    title: "Nos équipes de recruteurs experts",
    description:
      "Nos recruteurs spécialisés veillent à comprendre vos attentes avec précision, à maintenir une communication transparente avec vous et les candidats, et à orchestrer avec expertise chaque étape du processus de recrutement et de négociation jusqu'à sa conclusion réussie.",
    icon: Users,
  },
  {
    title: "Nos normes de qualité",
    description:
      "Pour attirer et fidéliser les meilleurs professionnels, nous nous engageons à fournir des informations claires, détaillées et structurées sur les opportunités de carrière, les perspectives d'évolution, les attentes liées aux postes et les parcours de développement.",
    icon: Check,
  },
  {
    title: "Nos méthodes structurées et rigoureuses",
    description:
      "Grâce à une analyse approfondie et objective de votre organisation, de vos concurrents et de votre marché, nous développons une compréhension précise de vos besoins et exigences afin de proposer des solutions adaptées.",
    icon: Target,
  },
];

const engagements = [
  {
    title: "Rapidité",
    description: "Un processus optimisé pour répondre à vos besoins dans les délais impartis.",
  },
  {
    title: "Qualité",
    description:
      "Une présélection rigoureuse pour garantir l'adéquation entre le candidat et le poste.",
  },
  {
    title: "Confidentialité",
    description: "Respect total des informations sensibles liées au poste ou à votre entreprise.",
  },
];

const processSteps = [
  {
    title: "Analyse des besoins",
    description:
      "Nous commençons par une consultation approfondie avec votre entreprise pour comprendre vos attentes.",
    details: [
      "Définition des compétences et qualifications recherchées.",
      "Précision des exigences liées au poste : missions, durée, localisation, etc.",
      "Identification de vos valeurs et de votre culture d'entreprise pour assurer une bonne intégration des candidats.",
    ],
    icon: MessageSquareText,
  },
  {
    title: "Recherche et sélection des candidats",
    description: "Une fois vos besoins identifiés, nous lançons le processus de recherche.",
    details: [
      "Vivier interne : consultation de notre base de talents existants pour trouver des profils immédiatement disponibles.",
      "Diffusion d'annonces : publication ciblée sur les plateformes d'emploi si nécessaire.",
      "Tri des candidatures : analyse rigoureuse des CV et présélection des profils pertinents.",
    ],
    icon: Search,
  },
  {
    title: "Évaluation et validation des candidats",
    description:
      "Nous évaluons les candidats présélectionnés afin de garantir leur adéquation avec vos attentes.",
    details: [
      "Entretiens individuels : analyse des compétences, de l'expérience et des aptitudes comportementales.",
      "Tests éventuels : évaluations spécifiques, techniques ou linguistiques, selon le poste.",
      "Vérification des références : confirmation de la fiabilité et des qualifications des candidats.",
    ],
    icon: ClipboardCheck,
  },
  {
    title: "Présentation et intégration",
    description: "Nous vous présentons les meilleurs profils et assurons un suivi attentif.",
    details: [
      "Envoi de rapports détaillés sur les candidats sélectionnés.",
      "Organisation d'entretiens finaux, si vous le souhaitez.",
      "Mise à disposition rapide des candidats validés.",
      "Suivi post-recrutement : nous restons disponibles pour garantir une intégration réussie et ajuster nos services si nécessaire.",
    ],
    icon: ShieldCheck,
  },
];

const questions = [
  "Quels types de postes recrutez-vous ?",
  "Quels sont les avantages de passer par un service de recrutement ?",
  "Quels outils et méthodes utilisez-vous pour recruter ?",
  "Comment sont calculés vos frais de recrutement ?",
  "Devons-nous signer un contrat avant de commencer le recrutement ?",
  "Comment communiquez-vous l'avancée du recrutement ?",
];

export default function RecrutementChasseurDeTetePage() {
  return (
    <>
      <SEO
        title="Recrutement / Chasseur de tête"
        description="EmploiPlus Group accompagne les entreprises dans la constitution d'équipes performantes et la recherche de talents adaptés à leurs enjeux."
        canonical={`${BASE_URL}/services/recrutement`}
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
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
                  Besoin d'une nouvelle ressource ?
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                  Nous accompagnons les entreprises dans la constitution d'équipes performantes dans
                  des environnements de plus en plus concurrentiels et exigeants.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 rounded-xl bg-white text-slate-950 hover:bg-slate-100"
                >
                  <Link to="/contact?subject=Demande%20de%20recrutement">
                    Parler de votre recrutement
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
              <div className="max-w-2xl">
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                  Découvrez nos trois principaux avantages
                </h2>
              </div>
              <div className="mt-10 grid gap-3 md:grid-cols-3">
                {advantages.map(({ title, description }, index) => (
                  <article
                    key={title}
                    className={`min-h-[310px] rounded-[26px] p-6 md:p-7 ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : index === 1
                          ? "bg-[#231f20] text-white"
                          : "bg-slate-100 text-slate-950"
                    }`}
                  >
                    <span className="text-5xl font-light leading-none tracking-tight">0{index + 1}.</span>
                    <h3 className="mt-8 max-w-[15rem] text-xl font-bold leading-tight">{title}</h3>
                    <p
                      className={`mt-7 text-sm leading-6 ${
                        index === 2 ? "text-slate-700" : "text-white/85"
                      }`}
                    >
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 overflow-hidden border-b border-border bg-[#eaf6ff] py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1fr)] lg:gap-16">
                <div className="max-w-xl">
                  <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                    Aider votre entreprise à réussir
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">
                    Une large gamme de solutions de recrutement et de conseil associées à un objectif
                    commun : aider votre entreprise à réussir.
                  </p>
                  <div className="mt-10 space-y-7">
                    {engagements.map(({ title, description }) => (
                      <article key={title} className="border-l-2 border-primary/30 pl-5">
                        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-primary/10">
                  <img
                    src={recruitmentImage}
                    alt="Équipe EmploiPlus accompagnant une entreprise"
                    className="h-64 w-full object-cover md:h-80"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 py-14 md:py-20">
            <div className="mx-auto max-w-5xl px-6 md:px-10">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  Quatre étapes pour avancer avec précision
                </h2>
                <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">
                  Une méthode structurée pour identifier les bons profils et accompagner leur
                  intégration avec efficacité.
                </p>
              </div>

              <div className="relative mt-14 space-y-10 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-brand/20 md:space-y-14 md:before:left-1/2 md:before:-translate-x-1/2">
                {processSteps.map(({ title, description, details, icon: Icon }, index) => (
                  <article
                    key={title}
                    className={`relative pl-16 md:flex md:pl-0 ${
                      index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                    }`}
                  >
                    <div className="absolute left-0 top-0 z-10 flex flex-col items-center gap-2 md:left-1/2 md:-translate-x-1/2">
                      <span className="flex size-10 items-center justify-center rounded-full border border-brand/20 bg-background text-[0.65rem] font-bold tracking-[0.12em] text-brand shadow-sm">
                        0{index + 1}
                      </span>
                      <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-lg shadow-brand/20">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div
                      className={`w-full rounded-2xl border border-border bg-card p-6 shadow-sm md:w-[calc(50%-4rem)] ${
                        index % 2 === 0 ? "md:text-right" : "md:text-left"
                      }`}
                    >
                      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                      <ul
                        className={`mt-4 space-y-2 text-sm leading-6 text-muted-foreground ${
                          index % 2 === 0 ? "md:border-r md:pr-4" : "md:border-l md:pl-4"
                        } border-brand/30`}
                      >
                        {details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 py-14 md:py-20">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 md:px-10">
              <div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Questions les plus fréquentes
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  Voici quelques questions fréquentes sur notre entreprise et nos services de
                  recrutement.
                </p>
              </div>
              <Accordion
                type="single"
                collapsible
                className="divide-y divide-border"
              >
                {questions.map((question, index) => (
                  <AccordionItem key={question} value={`question-${index}`} className="border-0">
                    <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:text-brand hover:no-underline">
                      {question}
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/40 px-4 py-4 text-sm leading-7 text-muted-foreground">
                      Réponse à compléter avec les informations validées par EmploiPlus Group.
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <section className="mx-6 max-w-6xl rounded-[1.5rem] bg-brand px-5 py-7 text-center text-brand-foreground md:mx-auto md:px-8 md:py-9">
            <h2 className="mx-auto max-w-4xl font-display text-xl font-bold tracking-tight md:text-3xl">
              À la recherche de profils rares ou stratégiques pour faire la différence ?
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-brand-foreground/80 md:text-base">
              Notre service de chasse de tête identifie, approche et vous présente les meilleurs
              talents du marché, y compris les profils les plus discrets.
            </p>
            <p className="mx-auto mt-2 max-w-3xl text-sm leading-7 text-brand-foreground/80 md:text-base">
              Confiez-nous vos recrutements critiques et accédez à un vivier de compétences ciblées,
              sélectionnées avec exigence et discrétion.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-5 rounded-xl bg-white text-brand hover:bg-white/90"
            >
              <Link to="/contact?subject=Demande%20de%20chasse%20de%20t%C3%AAte">
                Contactez-nous dès aujourd'hui
              </Link>
            </Button>
          </section>

        </div>
      </main>
    </>
  );
}
