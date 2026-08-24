import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { computeStructuredMatchScore, type CandidateMatchingProfile } from "@/services/matchScoreUtils";
import { getCandidateCvAnalysisState, hasAnalyzableCandidateCv } from "@/features/candidates/api/cvApi";
import { maskNotificationsForUser } from "@/integrations/supabase/notifications";

type CandidateRow = Database["public"]["Tables"]["candidates"]["Row"];
type JobOfferRow = Database["public"]["Tables"]["job_offers"]["Row"];

export interface JobOfferEmbeddingSource {
  title: string;
  company?: string | null;
  description?: string | null;
  requirements?: string | null;
  location_city?: string | null;
  contract_type?: string | null;
}

export function generateJobEmbeddingVector(job: JobOfferEmbeddingSource): string {
  const text = [
    job.title,
    job.company,
    job.location_city,
    job.contract_type,
    job.description,
    job.requirements,
  ]
    .filter((part): part is string => Boolean(part))
    .join("\n");

  return createEmbeddingVectorString(text);
}

export interface RecommendedJob extends JobOfferRow {
  score: number;
}

const VECTOR_DIMENSIONS = 768;

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function hashToken(token: string): number {
  let hash = 0;
  for (let index = 0; index < token.length; index += 1) {
    hash = (hash << 5) - hash + token.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

export function createEmbeddingVectorString(text: string): string {
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

async function ensureJobOfferEmbeddings(): Promise<void> {
  const { data, error } = await supabase
    .from("job_offers")
    .select("id, title, company, description, requirements, location_city, contract_type")
    .is("embedding_vector", null)
    .limit(25);

  if (error) {
    throw error;
  }

  const offers = data ?? [];

  for (const offer of offers) {
    const embeddingVector = generateJobEmbeddingVector({
      title: offer.title,
      company: offer.company,
      description: offer.description,
      requirements: offer.requirements,
      location_city: offer.location_city,
      contract_type: offer.contract_type,
    });

    const { error: updateError } = await supabase
      .from("job_offers")
      .update({ embedding_vector: embeddingVector })
      .eq("id", offer.id);

    if (updateError) {
      console.warn("Unable to seed job offer embedding:", updateError.message);
    }
  }
}

/**
 * Extract text from a PDF File object using pdfjs-dist when available.
 */
export async function extractTextFromPdfData(arrayBuffer: ArrayBuffer): Promise<string> {
  type PdfJsLibrary = {
    getDocument: (options: { data: ArrayBuffer }) => {
      promise: Promise<{
        numPages: number;
        getPage: (pageNumber: number) => Promise<{
          getTextContent: () => Promise<{ items: Array<{ str?: string | null }> }>;
        }>;
      }>;
    };
    GlobalWorkerOptions: { workerSrc: string };
  };

  let pdfjsLib: PdfJsLibrary;

  try {
    const [{ default: workerSrc }, pdfModule] = await Promise.all([
      import("pdfjs-dist/build/pdf.worker.min.js?url"),
      import("pdfjs-dist/legacy/build/pdf") as Promise<PdfJsLibrary>,
    ]);

    pdfjsLib = pdfModule;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  } catch (error) {
    console.warn("pdfjs-dist is not available or failed to initialize; falling back to empty CV text.", error);
    throw new Error("pdfjs-dist is required to extract text from PDFs. Install it in your project and ensure the worker is bundled correctly.");
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textChunks: string[] = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str ?? "");
    textChunks.push(strings.join(" "));
  }

  return textChunks.join("\n\n").trim();
}

export async function extractTextFromPdf(file: File): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are supported for CV extraction.");
  }

  const arrayBuffer = await file.arrayBuffer();
  return extractTextFromPdfData(arrayBuffer);
}

/**
 * Update candidate.cv_text and a lightweight embedding vector in Supabase.
 */
export async function updateCandidateCvText(candidateId: string, cvText: string, cvUrl?: string): Promise<CandidateRow | null> {
  const normalizedText = cvText?.trim() ?? "";

  const { data: candidateMeta, error: candidateMetaError } = await supabase
    .from("candidates")
    .select("user_id, cv_url, cv_last_updated_at")
    .eq("id", candidateId)
    .maybeSingle();

  if (candidateMetaError && candidateMetaError.code !== "PGRST116") {
    console.warn("Unable to resolve candidate user_id for CV notification cleanup:", candidateMetaError.message);
  }

  const payload: Partial<CandidateRow> = {
    cv_text: normalizedText || null,
    embedding_vector: normalizedText ? createEmbeddingVectorString(normalizedText) : null,
    cv_last_updated_at: normalizedText ? new Date().toISOString() : null,
  };

  if (typeof cvUrl === "string") {
    (payload as any).cv_url = cvUrl || null;
  } else if (candidateMeta?.cv_url) {
    (payload as any).cv_url = candidateMeta.cv_url;
  }

  const { data, error } = await supabase
    .from("candidates")
    .update(payload)
    .eq("id", candidateId)
    .select()
    .single();

  if (candidateMeta?.user_id) {
    try {
      await maskNotificationsForUser(candidateMeta.user_id, "offre", "Votre CV est ancien.");
    } catch (notificationError) {
      console.warn("Unable to suppress stale CV reminder after CV update:", notificationError);
    }
  }

  if (error) {
    console.error("Failed to update candidate cv_text:", error.message);
    throw error;
  }

  return data as CandidateRow;
}

/**
 * Parse a CV PDF, persist its text and lightweight embedding, then seed offer embeddings if needed.
 */
export async function processCandidateCvUpload(candidateId: string, file: File, cvUrl?: string): Promise<{ cvText: string; candidate: CandidateRow | null }> {
  const cvText = await extractTextFromPdf(file);
  const candidate = await updateCandidateCvText(candidateId, cvText, cvUrl);
  // Invalidate cached AI analyses for this candidate so scores are recomputed
  try {
    const { data: deleted, error: delError } = await supabase
      .from("ai_analysis_cache")
      .delete()
      .eq("candidate_id", candidateId);

    if (delError) {
      console.warn("Failed to invalidate ai_analysis_cache for candidate", candidateId, delError.message);
    } else {
      const count = Array.isArray(deleted) ? deleted.length : 0;
      console.log(`Invalidated ai_analysis_cache entries for candidate ${candidateId}: ${count} rows removed`);
    }
  } catch (err) {
    console.warn("Error while invalidating ai_analysis_cache for candidate", candidateId, err);
  }

  return { cvText, candidate };
}

export async function clearCandidateCvText(candidateId: string): Promise<CandidateRow | null> {
  return updateCandidateCvText(candidateId, "");
}

export type RecommendedJobsStatus = "no_cv" | "cv_processing" | "cv_analysis_failed" | "success" | "no_results" | "error";

export interface RecommendedJobsResult {
  status: RecommendedJobsStatus;
  jobs: RecommendedJob[];
  error?: string;
}

export async function getRecommendedJobsWithStatus(
  candidateId: string,
  matchThreshold = 0.0,
  matchCount = 10,
  matchOffset = 0,
): Promise<RecommendedJobsResult> {
  const { data: candidateData, error: candidateError } = await supabase
    .from("candidates")
    .select("cv_url, cv_text, embedding_vector, cv_last_updated_at")
    .eq("id", candidateId)
    .maybeSingle();

  if (candidateError) {
    return { status: "error", jobs: [], error: candidateError.message };
  }

  const cvState = getCandidateCvAnalysisState(candidateData ?? null);
  if (cvState.status === "no_cv") {
    return { status: "no_cv", jobs: [] };
  }

  if (cvState.status === "cv_processing") {
    return { status: "cv_processing", jobs: [] };
  }

  if (cvState.status === "cv_analysis_failed") {
    return { status: "cv_analysis_failed", jobs: [] };
  }

  try {
    const jobs = await getRecommendedJobs(candidateId, matchThreshold, matchCount, matchOffset);
    return jobs.length > 0 ? { status: "success", jobs } : { status: "no_results", jobs: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "error", jobs: [], error: message };
  }
}

/**
 * Call the RPC that returns recommended job offers for a candidate.
 */
export async function getRecommendedJobs(
  candidateId: string,
  matchThreshold = 0.0,
  matchCount = 10,
  matchOffset = 0,
): Promise<RecommendedJob[]> {
  // The RPC signature in Supabase is:
  //   match_job_offers_for_candidate(candidate_id UUID, match_threshold FLOAT, match_count INT, match_offset INT)
  const params = {
    candidate_id: candidateId,
    match_threshold: matchThreshold,
    match_count: matchCount,
    match_offset: matchOffset,
  } as const;

  console.debug("[getRecommendedJobs] candidateId=", candidateId, "params=", params);

  const now = new Date().toISOString();
  const [{ data: rpcData, error: rpcError }, { data: eligibleOffers, error: eligibleOffersError }] = await Promise.all([
    supabase.rpc("match_job_offers_for_candidate", { ...params, match_count: 1000, match_offset: 0 }),
    supabase
      .from("job_offers")
      .select("*")
      .eq("status", "published")
      .or(`publish_at.is.null,publish_at.lte.${now}`)
      .or(`deadline.is.null,deadline.gte.${now}`)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order("publish_at", { ascending: false })
      .limit(1000),
  ]);
  if (eligibleOffersError) throw eligibleOffersError;
  if (rpcError) {
    console.error("RPC matching failed:", rpcError.message, { candidateId });
    throw rpcError;
  }

  const rpcOffers = (rpcData ?? []) as RecommendedJob[];
  const rpcScoreById = new Map(rpcOffers.map((offer) => [offer.id, Number((offer as any).score)]));
  // SQL performs eligibility filtering only; the hash vector cannot exclude an offer.
  const offers = ((eligibleOffers ?? []) as JobOfferRow[]).map((offer) => ({
    ...offer,
    score: rpcScoreById.get(offer.id) ?? 0,
  })) as RecommendedJob[];
  console.debug("[getRecommendedJobs] Eligible offers evaluated structurally", offers.length, "for candidate", candidateId);

  const [
    { data: candidateData, error: candidateError },
    { data: skills, error: skillsError },
    { data: experiences, error: experiencesError },
    { data: education, error: educationError },
    { data: languages, error: languagesError },
    { data: preferences, error: preferencesError },
  ] = await Promise.all([
    supabase.from("candidates").select("headline, bio, location_city, location_country, cv_url, cv_text, embedding_vector").eq("id", candidateId).single(),
    supabase.from("candidate_skills").select("skill_name, proficiency_level").eq("candidate_id", candidateId),
    supabase.from("candidate_experience").select("job_title, description, start_date, end_date, is_current").eq("candidate_id", candidateId),
    supabase.from("candidate_education").select("degree, field_of_study").eq("candidate_id", candidateId),
    supabase.from("candidate_languages").select("language_name, proficiency_level").eq("candidate_id", candidateId),
    supabase.from("candidate_preferences").select("contract_types, work_types, salary_min, salary_max, mobility_modes").eq("candidate_id", candidateId).maybeSingle(),
  ]);
  if (candidateError) throw candidateError;
  if (skillsError) throw skillsError;
  if (experiencesError) throw experiencesError;
  if (educationError) throw educationError;
  if (languagesError) throw languagesError;
  if (preferencesError) throw preferencesError;
  if (!hasAnalyzableCandidateCv(candidateData)) {
    throw new Error("Candidate CV is no longer analyzable; reload the profile before matching.");
  }

  const profile: CandidateMatchingProfile = {
    title: candidateData.headline,
    summary: candidateData.bio,
    locationCity: candidateData.location_city,
    locationCountry: candidateData.location_country,
    cvText: candidateData.cv_text,
    skills: (skills ?? []).map((item) => ({ name: item.skill_name, level: item.proficiency_level })),
    experiences: (experiences ?? []).map((item) => ({ title: item.job_title, description: item.description, startDate: item.start_date, endDate: item.end_date, isCurrent: item.is_current })),
    education: (education ?? []).map((item) => ({ degree: item.degree, field: item.field_of_study })),
    languages: (languages ?? []).map((item) => ({ name: item.language_name, level: item.proficiency_level })),
    preferences: preferences ? { contractTypes: preferences.contract_types, workTypes: preferences.work_types, salaryMin: preferences.salary_min, salaryMax: preferences.salary_max, mobilityModes: preferences.mobility_modes } : null,
  };

  const uniqueOffers = new Map<string, RecommendedJob>();
  for (const offer of offers) {
    const fullOffer = offer as JobOfferRow;
    const rpcScore = Number((offer as any).score);
    const result = computeStructuredMatchScore(profile, fullOffer, Number.isFinite(rpcScore) ? rpcScore / 100 : 0);
    uniqueOffers.set(offer.id, { ...offer, ...fullOffer, score: result.score });
  }

  return [...uniqueOffers.values()]
    .sort((left, right) => right.score - left.score)
    .slice(Math.max(0, matchOffset), Math.max(0, matchOffset) + matchCount);
}

/**
 * Compute a lightweight fallback match score between CV text and a job offer.
 * Returns a score 0-100 and details for debugging.
 */
export function computeMatchScore(
  cvText: string,
  jobOffer: JobOfferRow,
  profile?: CandidateMatchingProfile,
): { score: number; details: Record<string, any> } {
  const result = profile
    ? computeStructuredMatchScore(profile, jobOffer)
    : computeStructuredMatchScore({ cvText, skills: [], experiences: [], education: [], languages: [] }, jobOffer);

  return {
    score: result.score,
    details: result.details,
  };
}
