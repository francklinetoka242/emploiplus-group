import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase, FileText, GraduationCap, Users, UserCheck } from "lucide-react";

const CANDIDATE_SERVICES = [
  {
    title: "Publication & Recherche d'Emploi",
    description:
      "Accès prioritaire aux opportunités du marché, mise en relation directe avec les recruteurs et alertes personnalisées.",
    icon: UserCheck,
  },
  {
    title: "Conception & Refonte de CV / Lettre de Motivation",
    description:
      "Optimisation professionnelle de vos outils de candidature pour captiver l'attention des recruteurs et réussir le passage des logiciels ATS.",
    icon: FileText,
  },
  {
    title: "Orientation Professionnelle & Coaching",
    description:
      "Bilans de compétences, préparation ciblée aux entretiens d'embauche et conseils de carrière personnalisés.",
    icon: GraduationCap,
  },
  {
    title: "Formations & Renforcement de Compétences",
    description:
      "Modules de formation pratiques pour développer les compétences métiers les plus recherchées sur le marché.",
    icon: Briefcase,
  },
];

const B2B_SERVICES = [
  {
    title: "Externalisation de Processus Métier (BPO - Business Process Outsourcing)",
    tagline: "Libérez vos équipes : confiez-nous l'exécution de vos processus opérationnels.",
    details:
      "Prise en charge intégrale de vos tâches récurrentes ou sous-traitées (Service client, prospection, saisie de données, modération, archivage et gestion administrative).",
    icon: Building2,
  },
  {
    title: "Délégation de Personnel & Mise à Disposition",
    tagline: "Renforcez vos effectifs sur mesure sans alourdir votre masse salariale.",
    details:
      "Mise à disposition rapide de personnel qualifié (hôtes d'accueil, agents administratifs, techniciens, commerciaux terrain). EmploiPlus gère le contrat et l'administratif RH.",
    icon: Users,
  },
  {
    title: "Gestion de Projets & Équipes Déléguées",
    tagline: "Une exécution clé en main pour vos projets stratégiques.",
    details:
      "Déploiement et supervision directe d'équipes opérationnelles dédiées pour réaliser vos projets spécifiques sur le terrain ou à distance.",
    icon: Briefcase,
  },
];

const CANDIDATE_STEP_LABELS = ["Trouver", "Préparer", "Se perfectionner", "Décrocher"];
const CANDIDATE_STEP_HEADERS = [
  "Un premier regard sur les opportunités",
  "Un dossier aligné avec vos ambitions",
  "La montée en compétences qui fait la différence",
  "Un passage à l'action maîtrisé",
];

const ENTERPRISE_FLOW = [
  {
    phase: "Vous avez un besoin",
    title: B2B_SERVICES[0].title,
    description: B2B_SERVICES[0].tagline,
    details: B2B_SERVICES[0].details,
    icon: B2B_SERVICES[0].icon,
  },
  {
    phase: "Nous analysons",
    title: B2B_SERVICES[1].title,
    description: B2B_SERVICES[1].tagline,
    details: B2B_SERVICES[1].details,
    icon: B2B_SERVICES[1].icon,
  },
  {
    phase: "Nous déployons",
    title: B2B_SERVICES[2].title,
    description: B2B_SERVICES[2].tagline,
    details: B2B_SERVICES[2].details,
    icon: B2B_SERVICES[2].icon,
  },
  {
    phase: "Nous pilotons",
    title: "Suivi opérationnel et amélioration continue",
    description:
      "Un accompagnement permanent pour optimiser vos flux et garantir la performance de chaque mission.",
    details:
      "Chaque action est mesurée, ajustée et restituée dans un pilotage transparent, pour des décisions rapides et un impact mesurable.",
    icon: Building2,
  },
  {
    phase: "Vous gagnez du temps",
    title: "Une organisation plus légère, plus sûre, plus réactive",
    description:
      "Vos équipes peuvent se concentrer sur l’essentiel pendant qu’EmploiPlus coordonne les opérations.",
    details:
      "Le résultat : des cycles raccourcis, des coûts contenus et une exécution fluide, sans surcharge interne.",
    icon: Users,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

interface JourneyStepCardProps {
  index: number;
  label: string;
  title: string;
  description: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

function JourneyStepCard({ index, label, title, description, detail, icon: Icon }: JourneyStepCardProps) {
  const layoutStyles = [
    "lg:ml-0 lg:max-w-[680px]",
    "lg:-ml-8 lg:max-w-[560px]",
    "lg:ml-auto lg:max-w-[620px]",
    "lg:-ml-4 lg:max-w-[660px]",
  ];

  const variantStyles = [
    "bg-slate-50 border-slate-200",
    "bg-secondary/10 border-secondary/20",
    "bg-white border-slate-200",
    "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white border-transparent",
  ];

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className={`relative overflow-hidden rounded-[36px] border p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.18)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl ${layoutStyles[index]} ${variantStyles[index]}`}
      whileHover={{ y: -6 }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-slate-500 opacity-20" />
      <div className="relative space-y-5">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] shadow-sm shadow-brand/5 ${
            index === 3 ? "text-white border-white/10" : "text-foreground"
          }`}
        >
          {label}
        </span>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary/10 text-foreground transition duration-300">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h3 className={`text-2xl font-semibold ${index === 3 ? "text-white" : "text-foreground"}`}>
              {title}
            </h3>
          </div>
        </div>
        <p className={`text-sm leading-7 ${index === 3 ? "text-slate-200" : "text-muted-foreground"}`}>
          {description}
        </p>
        <div className={`rounded-3xl p-5 ${index === 3 ? "bg-white/5 text-slate-100" : "bg-white/90 text-slate-900"}`}>
          <p className="text-sm leading-7">{detail}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-brand transition duration-300 hover:text-brand/80">
          <span>Voir le parcours</span>
          <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </motion.article>
  );
}

function CandidateJourney() {
  return (
    <div className="relative px-8 py-10 sm:px-10 sm:py-12 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInLeft}
          className="space-y-4"
        >
          <span className="inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Hub Candidats & Emploi
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Un parcours professionnel qui se ressent dès le premier pas.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Chaque étape est pensée comme une avancée concrète : découverte, préparation,
            montée en compétences et réussite. Le candidat se déplace dans un environnement
            qui respire, qui rassure et qui inspire.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInRight}
            className="space-y-8"
          >
            <div className="rounded-[36px] border border-border/70 bg-slate-950/95 p-8 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.22)]">
              <p className="text-sm uppercase tracking-[0.35em] text-secondary/80">Une expérience humaine</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight">Le récit de la transition professionnelle</h3>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Ce n’est pas une simple liste de services : c’est un chemin narratif qui place
                le candidat au cœur de sa transformation.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[32px] border border-border/70 bg-white p-6 shadow-sm">
                <p className="text-3xl font-semibold text-foreground">2K+</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  des candidats trouvent leur mission avec un accompagnement personnalisé.
                </p>
              </div>
              <div className="rounded-[32px] border border-border/70 bg-white p-6 shadow-sm">
                <p className="text-3xl font-semibold text-foreground">95%</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  de satisfaction des parcours
                </p>
              </div>
              <div className="rounded-[32px] border border-border/70 bg-white p-6 shadow-sm sm:col-span-2">
                <p className="text-3xl font-semibold text-foreground">1.8 mois</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  pour structurer une trajectoire gagnante.
                </p>
              </div>
            </div>
            <div className="rounded-[36px] border border-secondary/20 bg-secondary/10 p-8 shadow-[0_24px_80px_-40px_rgba(232,169,0,0.18)]">
              <p className="text-sm uppercase tracking-[0.35em] text-secondary">Témoignage</p>
              <blockquote className="mt-4 text-xl leading-9 text-foreground">
                « J’ai enfin senti que mon projet était compris. Chaque étape était claire, proche
                et utile. »
              </blockquote>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">Le parcours EmploiPlus rendu humain.</p>
            </div>
            <div className="space-y-3 rounded-[36px] border border-border/70 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.35em] text-secondary">Action</p>
              <h4 className="text-2xl font-semibold text-foreground">Prêt à vivre la suite du parcours ?</h4>
              <Button
                asChild
                size="default"
                className="bg-brand text-brand-foreground shadow-lg shadow-brand/10 transition hover:bg-brand/90"
              >
                <Link to="/contact?subject=Service%20Candidat">Démarrer l’accompagnement</Link>
              </Button>
            </div>
          </motion.div>

          <div className="relative overflow-hidden rounded-[36px] bg-slate-100/95 px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute -left-20 top-12 h-52 w-52 rounded-full bg-brand/10 blur-3xl" />
            <div className="absolute right-6 bottom-10 h-36 w-36 rounded-full bg-slate-900/5 blur-3xl" />
            <div className="relative space-y-10">
              {CANDIDATE_SERVICES.map((service, index) => (
                <JourneyStepCard
                  key={service.title}
                  index={index}
                  label={CANDIDATE_STEP_LABELS[index]}
                  title={service.title}
                  description={service.description}
                  detail={CANDIDATE_STEP_HEADERS[index]}
                  icon={service.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkflowStepProps {
  step: typeof ENTERPRISE_FLOW[number];
  index: number;
}

function WorkflowStep({ step, index }: WorkflowStepProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className={`group relative overflow-hidden rounded-[32px] border p-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:shadow-2xl ${
        index % 2 === 0 ? "bg-slate-900 border-white/10" : "bg-slate-950 border-white/5"
      }`}
    >
      <div className="absolute left-4 top-8 h-12 w-12 rounded-full border border-secondary/20 bg-secondary/10 text-secondary shadow-sm shadow-secondary/10">
        <step.icon className="m-3 h-6 w-6" />
      </div>
      <div className="ml-16 space-y-4">
        <p className="text-sm uppercase tracking-[0.35em] text-secondary/80">{step.phase}</p>
        <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
        <p className="text-sm leading-7 text-slate-300">{step.description}</p>
        <p className="text-sm leading-7 text-slate-400">{step.details}</p>
      </div>
      <div className="pointer-events-none absolute left-8 top-20 h-8 w-8 rounded-full border border-white/10 bg-slate-950/80" />
    </motion.div>
  );
}

function EnterpriseWorkflow() {
  return (
    <div className="px-8 py-12 sm:px-10 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInLeft}
          className="space-y-4"
        >
          <span className="inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-secondary/80">
            Solutions Entreprises / BPO
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Un processus métier clair, puissant et parfaitement orchestré.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Vos besoins sont traduits en un workflow précis, avec des points de contrôle,
            des connexions visuelles et une promesse de résultat opérationnel.
          </p>
        </motion.div>

        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/95 p-8 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.45)]">
          <div className="absolute left-10 top-0 h-full w-px bg-white/10" />
          <div className="absolute left-8 top-20 h-8 w-8 rounded-full bg-brand shadow-brand/20 blur-sm" />
          <div className="space-y-8">
            {ENTERPRISE_FLOW.map((step, index) => (
              <WorkflowStep key={step.phase} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const { t } = useI18n();

  return (
    <>
      <SEO
        title={t("services.title")}
        description={t("services.subtitle")}
        keywords="services, EmploiPlus Group, candidats, BPO, RH, accompagnement, externalisation"
        canonical={`${BASE_URL}/services`}
        robots="index,follow"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("services.title"), url: `${BASE_URL}/services` },
        ]}
      />

      <section className="container-page pt-10 pb-16 md:pt-14 md:pb-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-background via-card to-brand/5 px-6 py-10 sm:px-10 sm:py-14">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] border border-secondary/20 bg-secondary/10 px-3 py-1 inline-flex rounded-full text-secondary">
                  Nos Pôles d'Expertise
                </p>
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Des solutions pensées pour avancer, avec élégance et impact.
                </h1>
                <p className="max-w-2xl text-lg leading-9 text-muted-foreground sm:text-xl">
                  Deux parcours complémentaires, conçus pour accompagner les candidats et renforcer
                  les entreprises avec des services premium, fluides et engagés.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="default"
                    className="bg-brand text-brand-foreground shadow-lg shadow-brand/10 transition hover:-translate-y-0.5 hover:bg-brand/90"
                  >
                    <Link to="/contact?subject=Service%20Candidat">Demander un service</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="default"
                    className="border-secondary/30 bg-white/90 text-secondary transition hover:-translate-y-0.5 hover:bg-secondary/10"
                  >
                    <a
                      href="https://wa.me/229XXXXXXXXX?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20les%20services%20candidats"
                      target="_blank"
                      rel="noreferrer"
                    >
                      En savoir plus
                    </a>
                  </Button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-gradient-to-br from-brand/10 via-white to-white/90 p-8 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.18)]">
                <div className="absolute right-0 top-6 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
                <div className="absolute left-4 bottom-6 h-28 w-28 rounded-full bg-slate-900/5 blur-3xl" />
                <div className="space-y-4">
                  <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-700 shadow-sm shadow-brand/5">
                    Une expérience sur-mesure
                  </span>
                  <p className="text-sm leading-7 text-muted-foreground">
                    EmploiPlus Group crée un parcours qui fait sens, où chaque étape rapproche le
                    candidat de la prochaine opportunité.
                  </p>
                </div>
                <div className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
                  <div className="rounded-[28px] border border-border/60 bg-white/90 p-5 shadow-sm">
                    <p className="text-2xl font-semibold text-foreground">2K+</p>
                    <p className="mt-2 text-muted-foreground">Candidats engagés chaque année</p>
                  </div>
                  <div className="rounded-[28px] border border-border/60 bg-white/90 p-5 shadow-sm">
                    <p className="text-2xl font-semibold text-foreground">95%</p>
                    <p className="mt-2 text-muted-foreground">de satisfaction des parcours</p>
                  </div>
                  <div className="rounded-[28px] border border-border/60 bg-white/90 p-5 shadow-sm sm:col-span-2">
                    <p className="text-2xl font-semibold text-foreground">1.8 mois</p>
                    <p className="mt-2 text-muted-foreground">pour structurer une trajectoire gagnante</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden w-screen max-w-none -ml-[calc(50vw-50%)] -mr-[calc(50vw-50%)] rounded-none bg-white px-6 sm:px-10">
            <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
            <div className="absolute right-20 bottom-8 h-52 w-52 rounded-full bg-slate-900/5 blur-3xl" />
            <CandidateJourney />
          </div>

          <div className="relative overflow-hidden w-screen max-w-none -ml-[calc(50vw-50%)] -mr-[calc(50vw-50%)] rounded-none bg-slate-950 text-white px-6 sm:px-10">
            <div className="absolute -right-20 top-6 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute left-10 bottom-10 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
            <EnterpriseWorkflow />
          </div>
        </div>
      </section>
    </>
  );
}
