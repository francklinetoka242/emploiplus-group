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

export interface MatchScoreResult {
  score: number;
  details: MatchScoreDetails;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function createEmbeddingVectorString(text: string): string {
  const VECTOR_DIMENSIONS = 768;
  const hashToken = (token: string): number => {
    let hash = 0;
    for (let index = 0; index < token.length; index += 1) {
      hash = (hash << 5) - hash + token.charCodeAt(index);
      hash |= 0;
    }
    return hash;
  };

  const rawTokens = normalizeText(text).match(/[a-z0-9]+/g) ?? [];
  const vector = new Array<number>(VECTOR_DIMENSIONS).fill(0);

  if (rawTokens.length > 0) {
    rawTokens.forEach((token, index) => {
      const slot = Math.abs(hashToken(token)) % VECTOR_DIMENSIONS;
      vector[slot] += 1 + (index % 7) / 10;
    });

    const magnitude = Math.hypot(...vector);
    if (magnitude > 0) {
      for (let index = 0; index < vector.length; index += 1) {
        vector[index] = vector[index] / magnitude;
      }
    }
  }

  return `[${vector.map((value) => value.toFixed(6)).join(",")}]`;
}

function extractTokens(text: string): Set<string> {
  return new Set((text.match(/[a-z0-9]+/g) ?? []).filter(Boolean));
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

function extractTechnicalKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const keywords = [
    "comptabil",
    "comptable",
    "finance",
    "fiscal",
    "audit",
    "gestion de paie",
    "paie",
    "facturation",
    "reporting",
    "clôture",
    "cloture",
    "budget",
    "droit",
    "santé",
    "médical",
    "medical",
    "juridique",
    "marketing",
    "design",
    "chef de projet",
    "projet",
    "gestion de projet",
  ];

  return keywords.filter((keyword) => normalized.includes(keyword));
}

export function computeMatchScoreFromText(cvText: string, jobOffer: { title?: string | null; description?: string | null; requirements?: string | null }): MatchScoreResult {
  const safe = (value?: string | null) => (value ?? "").toString();
  const cv = normalizeText(cvText || "");
  const title = normalizeText(safe(jobOffer.title));
  const description = normalizeText(safe(jobOffer.description));
  const requirements = normalizeText(safe(jobOffer.requirements));

  const cvTokens = extractTokens(cv);
  const reqTokens = extractTokens([title, description, requirements].join(" "));

  let overlap = 0;
  for (const token of reqTokens) if (cvTokens.has(token)) overlap += 1;
  const skillsScore = reqTokens.size > 0 ? Math.min(40, Math.round((overlap / reqTokens.size) * 40)) : 0;

  const cvYears = parseYears(cvText);
  const reqYears = parseYears([title, description, requirements].join(" "));
  let experienceScore = 0;
  if (reqYears > 0) {
    experienceScore = Math.max(0, Math.min(25, Math.round((Math.min(cvYears, reqYears) / reqYears) * 25)));
  } else {
    experienceScore = cvYears > 0 ? Math.min(15, Math.round((cvYears / 10) * 15)) : 0;
  }

  const titleTokens = extractTokens(title);
  let titleOverlap = 0;
  for (const token of titleTokens) if (cvTokens.has(token)) titleOverlap += 1;
  const titleScore = titleTokens.size > 0 ? Math.min(10, Math.round((titleOverlap / titleTokens.size) * 10)) : 0;

  const educationKeywords = ["diplome", "master", "licence", "bachelor", "pmp", "aws", "certif"];
  let educationMatch = 0;
  for (const keyword of educationKeywords) if (cv.includes(keyword)) educationMatch += 1;
  const educationScore = Math.min(10, Math.round((educationMatch / educationKeywords.length) * 10));

  const vecCvStr = createEmbeddingVectorString(cvText);
  const vecJobStr = createEmbeddingVectorString([title, description, requirements].join(" "));
  const toNumbers = (s: string) => JSON.parse(s) as number[];
  let semanticScore = 0;
  try {
    const v1 = toNumbers(vecCvStr);
    const v2 = toNumbers(vecJobStr);
    let dot = 0;
    for (let index = 0; index < Math.min(v1.length, v2.length); index += 1) dot += v1[index] * v2[index];
    semanticScore = Math.round(((dot + 1) / 2) * 15);
  } catch {
    semanticScore = 0;
  }

  const technicalKeywords = extractTechnicalKeywords([title, description, requirements].join(" "));
  const hardSkillsOverlap = technicalKeywords.length > 0
    ? technicalKeywords.filter((keyword) => cv.includes(keyword)).length
    : 0;
  const dealBreakerApplied = technicalKeywords.length > 0 && hardSkillsOverlap === 0;

  const raw = skillsScore + experienceScore + titleScore + educationScore + semanticScore;
  const score = dealBreakerApplied ? 25 : Math.max(0, Math.min(100, Math.round(raw)));

  return {
    score,
    details: {
      skillsScore,
      experienceScore,
      titleScore,
      educationScore,
      semanticScore,
      overlap,
      cvYears,
      reqYears,
      hardSkillsOverlap,
      dealBreakerApplied,
    },
  };
}
