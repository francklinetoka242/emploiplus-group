import { Link } from "react-router-dom";
import {
  Building2,
  Check,
  ClipboardList,
  FileCheck2,
  FileText,
  Globe2,
  LockKeyhole,
  Settings2,
  Users,
  Zap,
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
import pricingImage from "@/assets/backgroun-page-services/img-ext-p.webp";
import teamImage from "@/assets/services/enterprise-team-02.webp";

const heroVisual = {
  src: teamImage,
  alt: "Équipe professionnelle en coordination",
};

const areas = [
  {
    title: "Externalisation RH",
    intro:
      "Optimisation de la gestion des ressources humaines, en déléguant tout ou partie des fonctions RH à un prestataire spécialisé.",
    detail:
      "Elle permet aux entreprises de se recentrer sur leur cœur de métier tout en assurant une gestion efficace, conforme et professionnelle des obligations administratives, sociales et légales.",
    items: [
      "Gestion administrative du personnel : contrats, dossiers salariés, absences, etc.",
      "Gestion de la paie et des déclarations sociales.",
      "Recrutement et intégration des collaborateurs.",
      "Formation et développement des compétences.",
      "Conformité réglementaire et veille juridique.",
      "Conseil en gestion des ressources humaines.",
    ],
    icon: Users,
  },
  {
    title: "Externalisation administrative",
    intro:
      "Allègement des tâches administratives en confiant la gestion quotidienne des opérations administratives à un prestataire externe.",
    detail:
      "Elle permet de gagner en efficacité, en réactivité et en conformité, tout en libérant du temps pour se concentrer sur les activités stratégiques de l'entreprise.",
    items: [
      "Gestion des documents et archivage.",
      "Saisie et traitement des données.",
      "Support administratif et secrétariat.",
      "Gestion de la facturation et des paiements.",
      "Suivi et relance des créances.",
      "Gestion des appels et courriers.",
      "Assistance à la gestion des contrats et des formalités légales.",
    ],
    icon: FileText,
  },
  {
    title: "Assistance technique",
    intro:
      "Soutien opérationnel sur le terrain pour accompagner les projets ou renforcer les équipes en place.",
    detail:
      "Elle permet de répondre rapidement à des besoins ponctuels ou durables en expertise, tout en garantissant la continuité et la qualité des opérations.",
    items: [
      "Support administratif et logistique pour les entreprises étrangères.",
      "Gestion des formalités légales et réglementaires.",
      "Mise à disposition de personnel local qualifié.",
      "Coordination des opérations sur le terrain.",
      "Interface avec les administrations et partenaires locaux.",
      "Suivi et reporting des activités.",
    ],
    icon: Settings2,
  },
];

const advantages = [
  [
    "Expertise locale",
    "Une connaissance approfondie des réalités administratives, culturelles et commerciales du Congo.",
    Globe2,
  ],
  [
    "Fiabilité et transparence",
    "Des services sur mesure, accompagnés de rapports détaillés pour assurer un suivi optimal.",
    Check,
  ],
  [
    "Réseau local étendu",
    "Des relations solides avec les institutions, fournisseurs et partenaires locaux pour faciliter et accélérer vos démarches.",
    Building2,
  ],
  [
    "Engagement qualité",
    "Une équipe professionnelle dédiée à la réussite de vos activités locales.",
    Users,
  ],
  [
    "Confidentialité et sécurité des données",
    "Une gestion confidentielle et sécurisée de vos données administratives, grâce à des outils fiables et à des mesures adaptées.",
    LockKeyhole,
  ],
  [
    "Temps de réponse rapide",
    "Une assistance réactive pour limiter les interruptions de service.",
    Zap,
  ],
] as const;

const steps = [
  [
    "Analyse des besoins",
    "Évaluation de vos processus administratifs et des tâches à externaliser.",
    ClipboardList,
  ],
  [
    "Proposition personnalisée",
    "Élaboration d'un plan d'action adapté à vos besoins et à votre budget.",
    FileCheck2,
  ],
  [
    "Mise en place",
    "Intégration de nos services dans votre organisation, en coordination avec vos équipes.",
    Building2,
  ],
  [
    "Suivi et optimisation",
    "Contrôle régulier de la qualité des services fournis et ajustements si nécessaire.",
    Settings2,
  ],
] as const;

const faqs = [
  [
    "Comment puis-je obtenir un devis pour l'accueil de mes invités et la gestion de leurs voyages ?",
    "Réponse à compléter avec les informations validées par EmploiPlus Group.",
  ],
  [
    "Quels services sont inclus dans la représentation locale ?",
    "Nos services incluent la gestion des formalités administratives locales, la représentation commerciale, la coordination de projets techniques et la supervision des opérations quotidiennes sur place. Nous gérons également les aspects logistiques, comme les déplacements et l'hébergement pour vos collaborateurs.",
  ],
  [
    "Puis-je utiliser ce service pour gérer des projets locaux ?",
    "Réponse à compléter avec les informations validées par EmploiPlus Group.",
  ],
  [
    "Quels sont les avantages de la domiciliation d'entreprise ?",
    "Réponse à compléter avec les informations validées par EmploiPlus Group. Cette question concerne un périmètre de service à préciser.",
  ],
  [
    "Est-ce que la domiciliation inclut la gestion du courrier ?",
    "Réponse à compléter avec les informations validées par EmploiPlus Group. Cette question concerne un périmètre de service à préciser.",
  ],
  [
    "Est-ce que je peux utiliser l'adresse de domiciliation pour y tenir des réunions ?",
    "Réponse à compléter avec les informations validées par EmploiPlus Group. Cette question concerne un périmètre de service à préciser.",
  ],
];

export default function SolutionsEntreprisePage() {
  return (
    <>
      <SEO
        title="Externalisation administrative"
        description="EmploiPlus Group accompagne les entreprises dans l'externalisation RH, administrative et l'assistance technique au Congo."
        canonical={`${BASE_URL}/services/externalisation`}
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
                  Externalisez vos processus
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                  Nous vous proposons une solution complète et personnalisée vous garantissant un gain
                  de temps, une réduction des coûts et une optimisation de vos opérations.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 rounded-xl bg-white text-slate-950 hover:bg-slate-100"
                >
                  <Link to="/contact?subject=Demande%20d'externalisation%20administrative">
                    Présenter votre besoin
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
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Une gestion fiable au service de vos opérations
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  Vous avez toutes les raisons d'opter pour l'externalisation administrative. Nous
                  vous assurons un travail de haute qualité, effectué avec fiabilité et
                  professionnalisme.
                </p>
              </div>
              <div className="relative mt-10 rounded-[2rem] bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] bg-[length:18px_18px] p-3 md:p-6">
                <div className="grid items-stretch gap-6 md:grid-cols-3">
                  {areas.map(({ title, intro, detail, items, icon: Icon }, index) => (
                    <article
                      key={title}
                      className="group flex min-h-[38rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="p-6 pb-5 md:p-7 md:pb-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="size-5" aria-hidden="true" />
                          </div>
                        </div>
                        <h3 className="mt-7 text-2xl font-bold leading-tight tracking-tight text-slate-950">
                          {title}
                        </h3>
                        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{intro}</p>
                      </div>
                      <div className="mx-6 border-t border-slate-200 md:mx-7" />
                      <div className="flex flex-1 flex-col p-6 pt-5 md:p-7 md:pt-5">
                        <p className="text-sm leading-7 text-slate-600">{detail}</p>
                        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-slate-950">
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
                        to="/contact?subject=Demande%20d'externalisation%20administrative"
                        className={`flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                          index === 1
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Parler à un expert
                        <span aria-hidden="true">→</span>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="externalisation-full-bleed relative border-b border-brand-deep bg-brand py-14 text-brand-foreground md:py-20">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 md:px-8">
              <div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Des outils essentiels pour votre réussite.
                </h2>
              </div>
              <div className="grid border-t border-white/20 sm:grid-cols-2">
                {advantages.map(([title, description, Icon]) => (
                  <article
                    key={title}
                    className="border-b border-white/20 py-6 sm:px-6 sm:nth-[2n]:border-l sm:nth-[2n+1]:pl-0 sm:nth-[2n]:pr-0"
                  >
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

          <section className="scroll-mt-20 border-b border-border py-14 md:py-20">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-16 md:px-10">
              <div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Une tarification adaptée à vos besoins
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  Nos tarifs sont adaptés à vos besoins spécifiques. Nous proposons des forfaits
                  mensuels pour des services récurrents et des prestations à la carte pour des
                  besoins ponctuels.
                </p>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  Nous offrons également une première consultation gratuite pour analyser vos
                  besoins et vous proposer un devis personnalisé.
                </p>
                <Button
                  asChild
                  className="mt-7 rounded-xl bg-secondary text-white hover:bg-secondary/90"
                >
                  <Link to="/contact?subject=Demande%20de%20devis%20-%20Externalisation">
                    Demander un devis
                  </Link>
                </Button>
              </div>
              <div className="overflow-hidden border-l-4 border-brand bg-slate-100">
                <img
                  src={pricingImage}
                  alt="Illustration de tarification et externalisation"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 border-b border-border bg-slate-50 py-14 md:py-20">
            <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Notre méthodologie
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                Notre méthodologie repose sur une approche structurée et personnalisée, garantissant
                des solutions adaptées aux besoins spécifiques de chaque client.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-6xl gap-10 px-6 sm:grid-cols-2 md:grid-cols-4 md:gap-5 md:px-10">
              {steps.map(([title, description, Icon], index) => (
                <article
                  key={title}
                  className="relative min-h-[15rem] rounded-[1.35rem] border-2 border-primary bg-white p-5 shadow-[0_14px_30px_-25px_rgba(15,23,42,0.35)]"
                >
                  <span
                    className={`absolute -top-9 text-2xl font-bold text-primary ${index % 2 === 1 ? "md:top-auto md:-bottom-9" : ""}`}
                  >
                    0{index + 1}
                  </span>
                  <div
                    className={`absolute h-8 w-14 border-t-2 border-dashed border-primary ${index % 2 === 1 ? "-bottom-4 right-5" : "-top-4 right-5"}`}
                  />
                  <div className="relative z-10 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="relative z-10 mt-5 text-base font-bold leading-tight text-slate-950">
                    {title}
                  </h3>
                  <p className="relative z-10 mt-3 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="scroll-mt-20 py-14 md:py-20">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 md:px-10">
              <div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Questions les plus fréquentes
                </h2>
              </div>
              <Accordion
                type="single"
                collapsible
                className="divide-y divide-border border-t border-border"
              >
                {faqs.map(([question, answer], index) => (
                  <AccordionItem key={question} value={`faq-${index}`} className="border-0">
                    <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:text-brand hover:no-underline">
                      {question}
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/40 px-4 py-4 text-sm leading-7 text-muted-foreground">
                      {answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <section className="mx-6 max-w-6xl rounded-[1.5rem] bg-brand px-5 py-7 text-center text-brand-foreground md:mx-auto md:px-8 md:py-9">
            <h2 className="mx-auto max-w-4xl font-display text-xl font-bold tracking-tight md:text-3xl">
              Gagnez du temps sur votre gestion administrative
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-brand-foreground/80 md:text-base">
              Confiez-nous la gestion administrative de votre personnel et concentrez-vous sur
              l'essentiel : votre cœur de métier. Contrats, paie, déclarations sociales, suivi RH…
              Nous prenons en charge les prestations convenues avec rigueur et confidentialité.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-5 rounded-xl bg-white text-brand hover:bg-white/90"
            >
              <Link to="/contact?subject=Demande%20d'externalisation%20administrative">
                Contactez-nous dès aujourd'hui
              </Link>
            </Button>
          </section>
        </div>
      </main>
    </>
  );
}
