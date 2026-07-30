import { Briefcase, FileText, GraduationCap, UserCheck } from "lucide-react";

export const CANDIDATE_SERVICES = [
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

export const B2B_SERVICES = [
  {
    title: "Externalisation de Processus Métier (BPO)",
    tagline: "Libérez vos équipes : confiez-nous l'exécution de vos processus opérationnels.",
    details:
      "Prise en charge intégrale de vos tâches récurrentes ou sous-traitées (Service client, prospection, saisie de données, modération, archivage et gestion administrative).",
  },
  {
    title: "Délégation de Personnel & Mise à Disposition",
    tagline: "Renforcez vos effectifs sur mesure sans alourdir votre masse salariale.",
    details:
      "Mise à disposition rapide de personnel qualifié (hôtes d'accueil, agents administratifs, techniciens, commerciaux terrain). EmploiPlus gère le contrat et l'administratif RH.",
  },
  {
    title: "Gestion de Projets & Équipes Déléguées",
    tagline: "Une exécution clé en main pour vos projets stratégiques.",
    details:
      "Déploiement et supervision directe d'équipes opérationnelles dédiées pour réaliser vos projets spécifiques sur le terrain ou à distance.",
  },
];

export default {};
