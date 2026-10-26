export interface ServiceOverview {
  id: string;
  name: string;
  route: string;
  promise: string;
  audience: string;
  prestations: readonly string[];
  modalities?: string;
  contactSubjects: readonly string[];
}

export const SERVICES_DATA: readonly ServiceOverview[] = [
  {
    id: "interim",
    name: "Mise à disposition & intérim",
    route: "/services/mise-disposition-rh",
    promise:
      "Sélectionner des collaborateurs et organiser leur mise à disposition, leur gestion administrative et leur intégration.",
    audience: "Entreprises, des TPE et startups aux grands comptes.",
    prestations: [
      "Analyse du besoin et sélection de profils adaptés.",
      "Gestion des contrats et des dossiers du personnel.",
      "Gestion de la paie et des déclarations sociales.",
      "Accompagnement de l’intégration et suivi des collaborateurs.",
    ],
    modalities: "Missions ponctuelles, saisonnières ou durables.",
    contactSubjects: ["Besoin de mise à disposition - Intérim"],
  },
  {
    id: "recrutement",
    name: "Recrutement & chasse de têtes",
    route: "/services/recrutement",
    promise:
      "Rechercher, évaluer et présenter des profils en fonction des besoins de votre entreprise.",
    audience: "Entreprises à la recherche de profils adaptés à leurs postes.",
    prestations: [
      "Analyse des compétences et des exigences du poste.",
      "Recherche, tri des candidatures et présélection.",
      "Entretiens, évaluations et vérification des références.",
      "Présentation des profils et suivi après recrutement.",
    ],
    contactSubjects: ["Demande de recrutement", "Demande de chasse de tête"],
  },
  {
    id: "externalisation",
    name: "Externalisation administrative et RH",
    route: "/services/externalisation",
    promise:
      "Confier la gestion de processus RH, administratifs et d’assistance technique à une équipe dédiée.",
    audience: "Entreprises locales et étrangères.",
    prestations: [
      "Gestion des dossiers du personnel, contrats et absences.",
      "Gestion de la paie et des déclarations sociales.",
      "Gestion documentaire, saisie et secrétariat.",
      "Facturation, paiements et suivi des créances.",
      "Assistance technique, coordination et suivi des activités.",
    ],
    contactSubjects: ["Demande d'externalisation administrative"],
  },
  {
    id: "conseil-formation",
    name: "Conseil & formation RH",
    route: "/services/conseil-formation",
    promise:
      "Adapter le conseil et la formation RH aux objectifs et à la culture de votre entreprise.",
    audience: "PME et grandes entreprises.",
    prestations: [
      "Évaluation des compétences, développement des talents et de la performance.",
      "Gestion des carrières, des mobilités internes et de la succession.",
      "Conseil en rémunération et avantages sociaux.",
      "Relations sociales, dialogue, médiation et conduite du changement.",
      "Plans de formation, coaching et accompagnement RH.",
      "Audit des pratiques et accompagnement de la conformité RH.",
    ],
    modalities: "Consultations ponctuelles ou missions longues, sur site ou à distance.",
    contactSubjects: ["Demande de conseil et formation RH"],
  },
];

export const SERVICES_INQUIRY_SUBJECT = "Demande d'information - Services RH";
