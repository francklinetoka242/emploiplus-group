import React from "react";
import AnimatedHeading from "@/components/AnimatedHeading";
import { Circle } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations/animations";

const STEPS = [
  {
    id: "need",
    tag: "Vous avez un besoin",
    title: "Externalisation de Processus Métier (BPO - Business Process Outsourcing)",
    lead: "Libérez vos équipes : confiez-nous l'exécution de vos processus opérationnels.",
    details:
      "Prise en charge intégrale de vos tâches récurrentes ou sous-traitées (service client, prospection, saisie de données, modération, archivage et gestion administrative).",
  },
  {
    id: "analyse",
    tag: "Nous analysons",
    title: "Délégation de Personnel & Mise à Disposition",
    lead: "Renforcez vos effectifs sur mesure sans alourdir votre masse salariale.",
    details:
      "Mise à disposition rapide de personnel qualifié (hôtes d'accueil, agents administratifs, techniciens, commerciaux terrain). EmploiPlus gère le contrat et l'administratif RH.",
  },
  {
    id: "deploy",
    tag: "Nous déployons",
    title: "Gestion de Projets & Équipes Déléguées",
    lead: "Une exécution clé en main pour vos projets stratégiques.",
    details:
      "Déploiement et supervision directe d'équipes opérationnelles dédiées pour réaliser vos projets spécifiques sur le terrain ou à distance.",
  },
  {
    id: "pilot",
    tag: "Nous pilotons",
    title: "Suivi opérationnel et amélioration continue",
    lead: "Un accompagnement permanent pour optimiser vos flux et garantir la performance de chaque mission.",
    details:
      "Chaque action est mesurée, ajustée et restituée dans un pilotage transparent, pour des décisions rapides et un impact mesurable.",
  },
  {
    id: "result",
    tag: "Vous gagnez du temps",
    title: "Une organisation plus légère, plus sûre, plus réactive",
    lead: "Vos équipes peuvent se concentrer sur l’essentiel pendant qu’EmploiPlus coordonne les opérations.",
    details: "Le résultat : des cycles raccourcis, des coûts contenus et une exécution fluide, sans surcharge interne.",
  },
];

export default function EnterpriseSection() {
  return (
    <section className="relative overflow-hidden bg-[#020618] py-20">
      <div className="container-page">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">SOLUTIONS ENTREPRISES / BPO</motion.span>
          <AnimatedHeading>Un processus métier clair, puissant et parfaitement orchestré.</AnimatedHeading>

          <motion.p variants={staggerItem} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-4 text-muted-foreground max-w-2xl">
            Vos besoins sont traduits en un workflow précis, avec des points de contrôle, des connexions visuelles et une promesse de résultat opérationnel.
          </motion.p>
        </motion.div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="container-page mt-12 relative px-0 py-10 md:px-0">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 md:left-12" />

        <div className="space-y-10">
          {STEPS.map((s, idx) => (
            <motion.div key={s.id} variants={staggerItem} className="relative md:pl-20">
              <div className="absolute left-0 top-2 flex h-full w-12 items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary text-secondary">
                  <Circle className="h-5 w-5" />
                </div>
                <div className="ml-3 mt-4 h-2 w-2 rounded-full bg-secondary/30" />
              </div>

              <article className={`p-8 pl-12 border border-border shadow-soft ${idx % 2 === 0 ? "bg-[#0f172b]" : "bg-[#020618]"}`}>
                <div className="text-sm text-secondary font-medium tracking-wider">{s.tag}</div>
                <h3 className="mt-3 text-xl font-semibold leading-snug">{s.title}</h3>
                <p className="mt-3 text-muted-foreground">{s.lead}</p>
                <p className="mt-3 text-muted-foreground">{s.details}</p>
              </article>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
