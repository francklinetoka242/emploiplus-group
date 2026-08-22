import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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
      await supabase
        .from("notifications")
        .update({ status: "masked" })
        .eq("user_id", candidateMeta.user_id)
        .eq("type", "offre")
        .eq("title", "Votre CV est ancien.");
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

  // Invalidate client-side local cache as well
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const key = `emploiplus-candidate-documents-${candidateId}`;
      localStorage.removeItem(key);
      console.log(`Removed localStorage key ${key}`);
    }
  } catch (err) {
    console.warn("Failed to remove client localStorage cache for candidate", candidateId, err);
  }

  return { cvText, candidate };
}

export async function clearCandidateCvText(candidateId: string): Promise<CandidateRow | null> {
  return updateCandidateCvText(candidateId, "");
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

  const { data, error } = await supabase.rpc("match_job_offers_for_candidate", params);
  console.debug("[getRecommendedJobs] RPC raw response for candidate", candidateId, { data, error });

  if (error) {
    console.error("RPC match_job_offers_for_candidate failed for candidate", candidateId, error.message);
    throw error;
  }

  const offers = (data ?? []) as RecommendedJob[];
  console.debug("[getRecommendedJobs] RPC match_job_offers_for_candidate returned", offers.length, "offers for candidate", candidateId);

  // Fetch candidate cv_text to validate extracted text
  const { data: candidateData, error: candError } = await supabase
    .from("candidates")
    .select("id, cv_text")
    .eq("id", candidateId)
    .single();

  if (candError) {
    console.warn("Unable to fetch candidate cv_text for debug:", candError.message);
  }

  const cvText = (candidateData && (candidateData as CandidateRow).cv_text) ?? "";
  console.debug("[getRecommendedJobs] Texte extrait du CV (length):", typeof cvText === 'string' ? cvText.length : 0);

  if (!cvText || cvText.trim().length === 0) {
    console.warn("[getRecommendedJobs] Aucun texte de CV disponible pour le candidat", candidateId, "- retour des résultats RPC sans fallback local");
  }

  // If RPC returned identical or missing scores, compute a dynamic fallback per-offer
  const scores = offers.map((o) => (o as any).score ?? (o as any).match_score ?? null);
  const allSame = scores.length > 0 && scores.every((s) => s === scores[0] && s !== null);

  if (allSame || scores.some((s) => s === null)) {
    // compute fallback scores locally and attach to offers
    if (!cvText || cvText.trim().length === 0) {
      console.warn("[getRecommendedJobs] Fallback local non exécuté car le CV est manquant pour le candidat", candidateId);
    } else {
      for (const offer of offers) {
        try {
          const jobOffer: JobOfferRow = {
            id: offer.id,
            title: (offer.title as string) ?? "",
            company: (offer.company as string) ?? "",
            description: (offer.description as string) ?? "",
            requirements: (offer.requirements as string) ?? "",
            location_city: (offer.location_city as string) ?? "",
            contract_type: (offer.contract_type as string) ?? "",
            // fill other optional fields with sensible defaults
            created_at: (offer as any).created_at ?? null,
            salary_min: (offer as any).salary_min ?? null,
            salary_max: (offer as any).salary_max ?? null,
            // @ts-ignore - not all fields are required for this local match calculation
          } as unknown as JobOfferRow;

          const { score, details } = computeMatchScore(cvText, jobOffer);
          (offer as any).score = score;
          console.log(`[Matching] Offre: ${jobOffer.title}, Score Final: ${score}, Détails: ${JSON.stringify(details)}`);
        } catch (innerErr) {
          console.warn("Fallback scoring failed for offer", offer.id, innerErr);
        }
      }
    }
  } else {
    // Log existing scores for debugging
    for (const offer of offers) {
      const score = (offer as any).score ?? (offer as any).match_score ?? null;
      console.log(`[Matching] Offre: ${offer.title ?? offer.id}, Score Final: ${score}, Détails: {}`);
    }
  }

  return offers;
}

/**
 * Compute a lightweight fallback match score between CV text and a job offer.
 * Returns a score 0-100 and details for debugging.
 */
import { computeMatchScoreFromText } from "@/services/matchScoreUtils";

export function computeMatchScore(cvText: string, jobOffer: JobOfferRow): { score: number; details: Record<string, any> } {
  const result = computeMatchScoreFromText(cvText, {
    title: jobOffer.title,
    description: jobOffer.description,
    requirements: jobOffer.requirements,
  });

  return {
    score: result.score,
    details: result.details,
  };
}
