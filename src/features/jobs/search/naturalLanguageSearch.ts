import type { JobOfferFilters } from "@/features/jobs/types";

export interface SearchCriteria extends JobOfferFilters {
  domain?: string;
  salaryMin?: string;
}

export interface SearchInterpretation {
  criteria: SearchCriteria;
  detected: Array<{ label: string; value: string }>;
}

const contractAliases: Array<[string, NonNullable<JobOfferFilters["contractType"]>]> = [
  ["prestation de services", "prestation_de_services"],
  ["temps partiel", "temps_partiel"],
  ["freelance", "freelance"],
  ["consultance", "consultance"],
  ["intérim", "interim"],
  ["interim", "interim"],
  ["stage", "stage"],
  ["cdd", "cdd"],
  ["cdi", "cdi"],
];

const domainAliases: Array<[string, string]> = [
  ["informatique", "informatique"],
  ["it", "informatique"],
  ["numérique", "informatique"],
  ["comptabilité", "comptabilité"],
  ["comptabilite", "comptabilité"],
  ["accounting", "comptabilité"],
  ["marketing", "marketing"],
  ["ressources humaines", "ressources humaines"],
  ["rh", "ressources humaines"],
  ["logistique", "logistique"],
];

const roleAliases: Array<[string, string]> = [
  ["développeur web", "développeur"],
  ["developpeur web", "développeur"],
  ["frontend", "développeur"],
  ["backend", "développeur"],
  ["full-stack", "développeur"],
  ["full stack", "développeur"],
  ["comptable", "comptable"],
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findAlias<T extends string>(input: string, aliases: Array<[string, T]>) {
  const normalized = normalize(input);
  return aliases.find(([alias]) => normalized.includes(normalize(alias)));
}

export function interpretNaturalLanguageSearch(input: string): SearchInterpretation {
  const text = input.trim();
  const normalized = normalize(text);
  const criteria: SearchCriteria = { query: text };
  const detected: SearchInterpretation["detected"] = [];

  const contract = findAlias(text, contractAliases);
  if (contract) {
    criteria.contractType = contract[1];
    detected.push({ label: "Contrat", value: contract[1].toUpperCase().replaceAll("_", " ") });
  }

  const domain = findAlias(text, domainAliases);
  if (domain) {
    criteria.domain = domain[1];
    detected.push({ label: "Domaine", value: domain[1] });
  }

  const role = findAlias(text, roleAliases);
  if (role) {
    criteria.query = role[1];
    detected.push({ label: "Métier", value: role[1] });
  }

  const locationMatch = text.match(
    /\b(?:à|a|sur|dans|vers)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{2,40}?)(?=\s*,|\s+sans\b|\s+avec\b|\s+en\b|\s+pour\b|\s*$)/i,
  );
  if (locationMatch) {
    const location = locationMatch[1].trim();
    if (location && !["distance", "télétravail", "teletravail"].includes(normalize(location))) {
      criteria.location = location;
      detected.push({ label: "Localisation", value: location });
    }
  }

  if (/\b(?:sans expérience|débutant|junior)\b/i.test(normalized)) {
    detected.push({ label: "Expérience", value: "Débutant" });
  } else if (/\b(?:avec expérience|expérimenté|senior)\b/i.test(normalized)) {
    detected.push({ label: "Expérience", value: "Expérimenté" });
  }

  const salaryMatch = text.match(
    /(?:au moins|minimum|min\.?|à partir de)\s*(\d[\d\s.,]*)\s*(?:xaf|fcfa|€|euros?)?/i,
  );
  if (salaryMatch) {
    criteria.salaryMin = salaryMatch[1].replace(/\s/g, "");
    detected.push({ label: "Salaire minimum", value: `${criteria.salaryMin} XAF` });
  }

  return { criteria, detected };
}

export function getSearchSuggestion(query: string) {
  const normalized = normalize(query);
  if (
    normalized.includes("developpeur") ||
    normalized.includes("frontend") ||
    normalized.includes("backend")
  ) {
    return [
      "développeur web",
      "développeur frontend",
      "développeur backend",
      "développeur full-stack",
    ];
  }
  if (
    normalized.includes("comptable") ||
    normalized.includes("comptabilite") ||
    normalized.includes("accounting")
  ) {
    return ["comptable", "comptabilité", "accounting"];
  }
  return [];
}
