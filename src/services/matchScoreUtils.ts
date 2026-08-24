export interface MatchScoreDetails {
  skillsScore: number;
  experienceScore: number;
  titleScore: number;
  educationScore: number;
  semanticScore: number;
  overlap: number;
  cvYears: number;
  reqYears: number;
  hardSkillsOverlap: number;
  dealBreakerApplied: boolean;
}

export interface CandidateMatchingProfile {
  title?: string | null;
  summary?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  cvText?: string | null;
  skills: Array<{ name: string; level?: string | null }>;
  experiences: Array<{ title?: string | null; description?: string | null; startDate?: string | null; endDate?: string | null; isCurrent?: boolean }>;
  education: Array<{ degree?: string | null; field?: string | null }>;
  languages: Array<{ name: string; level?: string | null }>;
  preferences?: { contractTypes?: string[]; workTypes?: string[]; salaryMin?: number | null; salaryMax?: number | null; mobilityModes?: string[]; locations?: string[] } | null;
}

export interface ExplainableMatchDetails extends MatchScoreDetails {
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  locationScore: number;
  preferencesScore: number;
  languageScore: number;
  domainScore: number;
}

export interface ExplainableMatchResult {
  score: number;
  details: ExplainableMatchDetails;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[./_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TOKEN_ALIASES: Record<string, string> = {
  javascript: "javascript", "java script": "javascript", "react js": "react", "reactjs": "react",
  "node js": "node", nodejs: "node", typescript: "typescript", "type script": "typescript",
  sql: "sql", "gestion de projet": "gestion projet",
};

function canonicalToken(value: string): string {
  const normalized = normalizeText(value);
  return TOKEN_ALIASES[normalized] ?? normalized.replace(/s$/, "");
}

function tokenSet(value: string): Set<string> {
  const stopWords = new Set(["avec", "pour", "dans", "sur", "une", "des", "les", "ans", "year", "years", "and", "the", "of", "de", "du", "en"]);
  return new Set((normalizeText(value).match(/[a-z0-9]+/g) ?? [])
    .map(canonicalToken)
    .filter((token) => token.length > 2 && !stopWords.has(token) && !/^\d+$/.test(token)));
}

function ratio(matched: number, total: number, unknown = false): number {
  return unknown || total === 0 ? -1 : matched / total;
}

function extractSalaryRange(value: string | null | undefined): { min: number | null; max: number | null } {
  const values = (value ?? "").replace(/\s/g, "").match(/\d+(?:[.,]\d+)?/g)?.map((item) => Number(item.replace(",", "."))) ?? [];
  if (!values.length) return { min: null, max: null };
  const multiplier = /k|keur|millier/i.test(value ?? "") ? 1000 : 1;
  const scaled = values.map((item) => item * multiplier);
  return { min: Math.min(...scaled), max: Math.max(...scaled) };
}

function yearsFromExperiences(experiences: CandidateMatchingProfile["experiences"]): number {
  const intervals = experiences.map((experience) => {
    const start = experience.startDate ? new Date(experience.startDate).getTime() : NaN;
    const end = experience.isCurrent || !experience.endDate ? Date.now() : new Date(experience.endDate).getTime();
    return Number.isFinite(start) && Number.isFinite(end) && end > start ? [start, end] as const : null;
  }).filter((interval): interval is readonly [number, number] => Boolean(interval));
  return intervals.reduce((total, [start, end]) => total + (end - start) / (365.25 * 24 * 60 * 60 * 1000), 0);
}

function experienceYearsFromText(text: string): number {
  return parseYears(text);
}

export function computeStructuredMatchScore(
  profile: CandidateMatchingProfile,
  jobOffer: { title?: string | null; description?: string | null; requirements?: string | null; company?: string | null; location_city?: string | null; location_country?: string | null; contract_type?: string | null; salary?: string | null; tags?: string[] | null },
  semanticScore = 0,
): ExplainableMatchResult {
  const offerText = [jobOffer.title, jobOffer.description, jobOffer.requirements, jobOffer.tags?.join(" ")].filter(Boolean).join(" ");
  const requiredTokens = tokenSet([jobOffer.title, jobOffer.requirements].filter(Boolean).join(" "));
  const candidateSkillTokens = new Set(profile.skills.flatMap((skill) => [...tokenSet(skill.name)]));
  const cvTokens = tokenSet([profile.title, profile.summary, profile.cvText].filter(Boolean).join(" "));
  const matchedSkills = [...requiredTokens].filter((skill) => candidateSkillTokens.has(skill));
  const partialSkills = [...requiredTokens].filter((skill) =>
    !matchedSkills.includes(skill) && [...candidateSkillTokens].some((candidateSkill) =>
      candidateSkill.length > 3 && (candidateSkill.includes(skill) || skill.includes(candidateSkill)),
    ),
  );
  const cvOnlySkills = [...requiredTokens].filter((skill) =>
    !matchedSkills.includes(skill) && !partialSkills.includes(skill) && cvTokens.has(skill),
  );
  const missingSkills = [...requiredTokens].filter((skill) => !matchedSkills.includes(skill) && !partialSkills.includes(skill) && !cvOnlySkills.includes(skill));
  const skillsScore = requiredTokens.size ? (matchedSkills.length + partialSkills.length * 0.5 + cvOnlySkills.length * 0.25) / requiredTokens.size : -1;

  const experienceText = profile.experiences.map((experience) => [experience.title, experience.description].filter(Boolean).join(" ")).join(" ");
  const requiredYears = experienceYearsFromText(offerText);
  const candidateYears = Math.max(yearsFromExperiences(profile.experiences), experienceYearsFromText(profile.cvText ?? ""));
  const experienceOverlap = tokenSet(experienceText).size && [...tokenSet(experienceText)].filter((token) => tokenSet(jobOffer.title ?? "").has(token) || tokenSet(jobOffer.requirements ?? "").has(token)).length > 0;
  const experienceScore = requiredYears > 0 ? Math.min(1, candidateYears / requiredYears) : (experienceText ? (experienceOverlap ? 1 : 0.5) : -1);

  const educationText = profile.education.map((item) => [item.degree, item.field].filter(Boolean).join(" ")).join(" ");
  const educationTokens = tokenSet(educationText);
  const educationRequirements = tokenSet(jobOffer.requirements ?? "");
  const educationMatches = [...educationRequirements].filter((token) => educationTokens.has(token) && ["master", "licence", "bachelor", "doctorat", "certificat", "diplome"].some((word) => token.includes(word))).length;
  const educationScore = educationText ? (educationMatches > 0 ? 1 : 0.5) : -1;

  const locationText = normalizeText([profile.locationCity, profile.locationCountry, ...(profile.preferences?.locations ?? [])].filter(Boolean).join(" "));
  const offerLocation = normalizeText([jobOffer.location_city, jobOffer.location_country].filter(Boolean).join(" "));
  const remote = /remote|teletravail|hybride/.test(normalizeText(offerText));
  const locationScore = !offerLocation || remote ? -1 : locationText.includes(offerLocation) || offerLocation.includes(locationText) ? 1 : 0;

  const preferences = profile.preferences;
  const contractScore = preferences?.contractTypes?.length && jobOffer.contract_type ? preferences.contractTypes.some((item) => canonicalToken(item) === canonicalToken(jobOffer.contract_type ?? "")) ? 1 : 0 : -1;
  const offerSalary = extractSalaryRange(jobOffer.salary);
  const salaryScore = preferences?.salaryMin != null && offerSalary.max != null ? (offerSalary.max >= preferences.salaryMin ? 1 : 0) : -1;
  const preferencesScore = [contractScore, salaryScore].filter((score) => score >= 0).length ? [contractScore, salaryScore].filter((score) => score >= 0).reduce((sum, score) => sum + score, 0) / [contractScore, salaryScore].filter((score) => score >= 0).length : -1;

  const languageTokens = new Set(profile.languages.flatMap((language) => [...tokenSet(language.name)]));
  const languageRequirements = [...tokenSet(offerText)].filter((token) => ["anglais", "english", "francais", "french", "espagnol", "spanish", "allemand", "german"].includes(token));
  const languageScore = languageRequirements.length ? languageRequirements.filter((language) => languageTokens.has(language)).length / languageRequirements.length : -1;
  const domainTokens = tokenSet(jobOffer.title ?? "");
  const textDomainScore = domainTokens.size ? [...domainTokens].filter((token) => cvTokens.has(token) || tokenSet(experienceText).has(token)).length / domainTokens.size : -1;
  const domainScore = textDomainScore < 0 ? (semanticScore > 0 ? semanticScore : -1) : semanticScore > 0 ? textDomainScore * 0.8 + semanticScore * 0.2 : textDomainScore;
  const signals = [skillsScore, experienceScore, domainScore, locationScore, educationScore, preferencesScore, languageScore];
  const weights = [35, 25, 15, 10, 5, 5, 5];
  const available = signals.reduce((sum, signal, index) => sum + (signal >= 0 ? weights[index] : 0), 0);
  const weighted = signals.reduce((sum, signal, index) => sum + (signal >= 0 ? signal * weights[index] : 0), 0);
  const score = available ? Math.round((weighted / available) * 100) : 0;
  const strengths = [...(matchedSkills.length ? [`${matchedSkills.length} compétence(s) correspondante(s)`] : []), ...(experienceScore > 0.7 ? ["Expérience pertinente"] : []), ...(locationScore === 1 || remote ? ["Localisation compatible"] : [])];
  const gaps = [...(missingSkills.length ? [`${missingSkills.length} compétence(s) demandée(s) manquante(s)`] : []), ...(experienceScore === 0 ? ["Expérience requise insuffisante"] : [])];
  return { score: Math.max(0, Math.min(100, score)), details: { skillsScore: Math.round(Math.max(0, skillsScore) * 35), experienceScore: Math.round(Math.max(0, experienceScore) * 25), titleScore: Math.round(Math.max(0, domainScore) * 15), educationScore: Math.round(Math.max(0, educationScore) * 5), semanticScore: Math.round(Math.max(0, semanticScore) * 5), overlap: matchedSkills.length, cvYears: candidateYears, reqYears: requiredYears, hardSkillsOverlap: matchedSkills.length, dealBreakerApplied: false, matchedSkills, partialSkills, missingSkills, strengths, gaps, locationScore: Math.round(Math.max(0, locationScore) * 10), preferencesScore: Math.round(Math.max(0, preferencesScore) * 5), languageScore: Math.round(Math.max(0, languageScore) * 5), domainScore: Math.round(Math.max(0, domainScore) * 15) } };
}

export function parseYears(text: string): number {
  const m = text.match(/(\d{1,2})\s*(?:ans|years)/i);
  if (m) return Number(m[1]);
  const y = text.match(/(19|20)\d{2}/g);
  if (y && y.length >= 2) {
    const nums = y.map(Number);
    return Math.max(0, Math.abs(nums[nums.length - 1] - nums[0]));
  }
  return 0;
}

