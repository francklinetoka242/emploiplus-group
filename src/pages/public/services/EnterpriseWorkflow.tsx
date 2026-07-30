import React from "react";
import { motion } from "framer-motion";
import { Building2, Briefcase, Users } from "lucide-react";
import { fadeUp } from "@/lib/animations/animations";

const ENTERPRISE_FLOW = [
  {
    phase: "Vous avez un besoin",
    title: "Externalisation de Processus Métier (BPO - Business Process Outsourcing)",
    description: "Libérez vos équipes : confiez-nous l'exécution de vos processus opérationnels.",
    details:
      "Prise en charge intégrale de vos tâches récurrentes ou sous-traitées (Service client, prospection, saisie de données, modération, archivage et gestion administrative).",
    icon: Building2,
  },
  {
    phase: "Nous analysons",
    title: "Délégation de Personnel & Mise à Disposition",
    description: "Renforcez vos effectifs sur mesure sans alourdir votre masse salariale.",
    details:
      "Mise à disposition rapide de personnel qualifié (hôtes d'accueil, agents administratifs, techniciens, commerciaux terrain). EmploiPlus gère le contrat et l'administratif RH.",
    icon: Users,
  },
  {
    phase: "Nous déployons",
    title: "Gestion de Projets & Équipes Déléguées",
    description: "Une exécution clé en main pour vos projets stratégiques.",
    details:
      "Déploiement et supervision directe d'équipes opérationnelles dédiées pour réaliser vos projets spécifiques sur le terrain ou à distance.",
    icon: Briefcase,
  },
  {
    phase: "Nous pilotons",
    title: "Suivi opérationnel et amélioration continue",
    description: "Un accompagnement permanent pour optimiser vos flux et garantir la performance de chaque mission.",
    details:
      "Chaque action est mesurée, ajustée et restituée dans un pilotage transparent, pour des décisions rapides et un impact mesurable.",
    icon: Building2,
  },
  {
    phase: "Vous gagnez du temps",
    title: "Une organisation plus légère, plus sûre, plus réactive",
    description: "Vos équipes peuvent se concentrer sur l’essentiel pendant qu’EmploiPlus coordonne les opérations.",
    details: "Le résultat : des cycles raccourcis, des coûts contenus et une exécution fluide, sans surcharge interne.",
    icon: Users,
  },
];

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

interface StepProps {
  step: (typeof ENTERPRISE_FLOW)[number];
  index: number;
}

function WorkflowStep({ step, index }: StepProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 p-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:shadow-2xl"
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

export default function EnterpriseWorkflow() {
  return (
    <section className="relative w-full bg-slate-950/95 pt-12 pb-0 sm:pt-14 sm:pb-0 overflow-hidden">
      <div className="mx-auto max-w-7xl px-8 sm:px-10 lg:px-12">
        <div className="relative p-8 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.45)]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInLeft} className="space-y-4 pb-10">
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

          <div className="absolute left-10 top-0 h-full w-px bg-white/10" />
          <div className="absolute left-8 top-20 h-8 w-8 rounded-full bg-brand shadow-brand/20 blur-sm" />
          <div className="space-y-8">
            {ENTERPRISE_FLOW.map((step, index) => (
              <WorkflowStep key={step.phase} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
