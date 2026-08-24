import { supabase } from "@/integrations/supabase/client";
import { buildGroqAnalysisPrompt } from "@/services/groqAnalysisPrompt";
import { parseYears } from "@/services/matchScoreUtils";

/**
 * Version du système de prompt Groq.
 * Incrémenter cette version lors de changements majeurs du prompt ou de la logique RH.
 * Cela force l'invalidation du cache pour toutes les analyses existantes.
 */
export const PROMPT_VERSION = "v2.2_2026-07-27";

export interface AiAnalysisResult {
  match_score: number;
  score?: number;
  experienceVerified?: string;
  strengths: string[];
  improvements: string[];
  gaps: string[];
  summary?: string;
  cover_letter_draft: string;
}

interface AiAnalysisCacheRow {
  id: string;
  candidate_id: string;
  job_id: string;
  match_score: number;
  strengths: string[];
  improvements: string[];
  cover_letter_draft: string;
  prompt_version: string;
  created_at: string;
}

function getGroqApiKey(): string | undefined {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
    (typeof import.meta !== "undefined" && import.meta.env?.GROQ_API_KEY) ||
    (typeof process !== "undefined" ? process.env.GROQ_API_KEY : undefined)
  );
}

/**
 * Extrait, nettoie et parse le JSON d'une chaîne brute qui pourrait contenir:
 * - Des balises Markdown (```json ... ```)
 * - Des préambules ou suffixes textuels parasites
 * - Des caractères invisibles ou espaces Unicode
 * 
 * Isole le premier bloc JSON valide { ... } et le parse directement.
 * En cas d'erreur, logue le contenu brut pour faciliter le débogage.
 */
function extractAndCleanJson(rawContent: string): Record<string, unknown> {
  if (!rawContent || typeof rawContent !== "string") {
    console.error("[JSON Extraction] Contenu brut invalide:", rawContent);
    throw new Error("Contenu brut invalide pour extraction JSON.");
  }

  // Étape 1 : normaliser les caractères invisibles et espaces Unicode
  let cleaned = rawContent
    .replace(/\u200b/g, "") // zero-width space
    .replace(/\u200c/g, "") // zero-width non-joiner
    .replace(/\u200d/g, "") // zero-width joiner
    .replace(/\u202c/g, "") // pop directional formatting
    .trim();

  // Étape 2 : supprimer les balises Markdown (```json ... ``` ou ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  // Étape 3 : isoler le premier bloc JSON valide { ... }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/m);
  if (!jsonMatch) {
    console.error("[JSON Extraction] Aucun bloc JSON trouvé. Contenu brut:", rawContent);
    throw new Error("Aucun bloc JSON valide trouvé dans la réponse.");
  }

  const jsonString = jsonMatch[0].trim();

  // Étape 4 : parser le JSON et lancer une erreur explicite en cas d'échec
  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch (parseError) {
    console.error(
      "[JSON Parse Error] Impossible de parser le JSON nettoyé.",
      "Erreur:",
      parseError instanceof Error ? parseError.message : String(parseError),
      "Contenu brut (raw):",
      rawContent,
      "Contenu nettoyé (cleaned):",
      jsonString
    );
    throw new Error("La réponse IA n'était pas au format JSON valide après nettoyage.");
  }
}

function sanitizeAnalysisPayload(payload: unknown): AiAnalysisResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Réponse IA invalide.");
  }

  const candidate = payload as Partial<AiAnalysisResult> & Record<string, unknown>;
  
  // Valider et normaliser score et match_score (0-100, défaut 0)
  const rawScore =
    (candidate as any).score ??
    (candidate as any).match_score ??
    (candidate as any).matchScore ??
    (candidate as any).score ??
    0;
  const score = Number(rawScore);
  const normalizedScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;

  // Valider et normaliser strengths (tableau de chaînes, défaut [])
  const strengths = Array.isArray(candidate.strengths)
    ? candidate.strengths.filter((item) => item != null && typeof item === "string").map((s) => String(s).trim()).filter(Boolean)
    : [];

  // Valider et normaliser improvements / gaps (tableau de chaînes, défaut [])
  const rawImprovements = Array.isArray(candidate.improvements)
    ? candidate.improvements.filter((item) => item != null && typeof item === "string").map((i) => String(i).trim()).filter(Boolean)
    : [];
  const rawGaps = Array.isArray(candidate.gaps)
    ? candidate.gaps.filter((item) => item != null && typeof item === "string").map((g) => String(g).trim()).filter(Boolean)
    : [];

  const improvements = rawImprovements.length > 0 ? rawImprovements : rawGaps;
  const gaps = rawGaps.length > 0 ? rawGaps : rawImprovements;

  // Valider et normaliser experienceVerified et summary
  const experienceVerified = typeof candidate.experienceVerified === "string"
    ? candidate.experienceVerified.trim()
    : "";
  const summary = typeof candidate.summary === "string"
    ? candidate.summary.trim()
    : "";

  // Valider et normaliser cover_letter_draft (chaîne, défaut "" au lieu de undefined/null)
  let coverLetterDraft = "";
  if (typeof candidate.cover_letter_draft === "string") {
    coverLetterDraft = candidate.cover_letter_draft.trim();
  } else if (typeof candidate.cover_letter === "string") {
    coverLetterDraft = candidate.cover_letter.trim();
  }

  return {
    match_score: normalizedScore,
    score: normalizedScore,
    experienceVerified,
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    gaps: gaps.slice(0, 5),
    summary,
    cover_letter_draft: coverLetterDraft,
  };
}

async function fetchCachedAnalysis(candidateId: string, jobId: string): Promise<AiAnalysisResult | null> {
  try {
    const { data, error } = await supabase
      .from("ai_analysis_cache")
      .select("match_score, strengths, improvements, cover_letter_draft, prompt_version")
      .eq("candidate_id", candidateId)
      .eq("job_id", jobId)
      .maybeSingle<AiAnalysisCacheRow>();

    if (error) {
      // Si erreur 400 c'est probablement que prompt_version n'existe pas
      if (error.code === "PGRST100" || error.message?.includes("prompt_version")) {
        console.debug(
          "[Cache] Schema mismatch detected - prompt_version column missing. Forcing new analysis."
        );
        return null;
      }
      console.warn("Unable to read AI analysis cache", error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    // Invalider le cache si la version du prompt ne correspond pas
    // Si prompt_version est undefined ou absent, traiter comme cache invalide
    const cachedVersion = data.prompt_version ?? "v1.0";
    if (cachedVersion !== PROMPT_VERSION) {
      console.debug(
        `[Cache Invalidation] Prompt version mismatch: cached=${cachedVersion}, current=${PROMPT_VERSION}. Forcing new analysis.`
      );
      return null;
    }

    return {
      match_score: data.match_score,
      strengths: data.strengths ?? [],
      improvements: data.improvements ?? [],
      gaps: [],
      cover_letter_draft: data.cover_letter_draft ?? "",
    };
  } catch (error) {
    // En cas d'erreur inattenduelle, logger et continuer sans cache
    console.warn(
      "[Cache] Unexpected error fetching cached analysis:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

async function persistAnalysis(candidateId: string, jobId: string, payload: AiAnalysisResult): Promise<void> {
  try {
    const { error } = await supabase.from("ai_analysis_cache").upsert(
      {
        candidate_id: candidateId,
        job_id: jobId,
        match_score: payload.match_score,
        strengths: payload.strengths,
        improvements: payload.improvements,
        cover_letter_draft: payload.cover_letter_draft,
        prompt_version: PROMPT_VERSION,
      },
      { onConflict: "candidate_id,job_id" },
    );

    if (error) {
      // Si erreur 400 c'est probablement que prompt_version n'existe pas en production
      if (error.code === "PGRST100" || error.message?.includes("prompt_version")) {
        console.warn(
          "[Cache] Cannot persist analysis - schema mismatch. prompt_version column may be missing. Continuing without cache persistence.",
          error.message
        );
        // Continue sans crash - l'analyse est complète, juste pas cachée
        return;
      }
      // Autres erreurs
      throw new Error(`[Cache] Failed to persist analysis: ${error.message}`);
    }
  } catch (error) {
    // Log l'erreur mais ne crash pas - l'analyse est déjà complète
    console.warn(
      "[Cache] Failed to persist analysis (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    // Continuer sans interruption - l'utilisateur a son analyse
  }
}

export async function analyzeCandidateForJob(candidateId: string, jobId: string): Promise<AiAnalysisResult> {
  const cached = await fetchCachedAnalysis(candidateId, jobId);
  if (cached) {
    return cached;
  }

  const [candidateResponse, jobResponse] = await Promise.all([
    supabase.from("candidates").select("cv_text").eq("id", candidateId).maybeSingle<{ cv_text?: string | null }>(),
    supabase.from("job_offers").select("title, company, description, requirements").eq("id", jobId).maybeSingle<{
      title?: string | null;
      company?: string | null;
      description?: string | null;
      requirements?: string | null;
    }>(),
  ]);

  if (candidateResponse.error) {
    throw new Error(candidateResponse.error.message);
  }

  if (jobResponse.error) {
    throw new Error(jobResponse.error.message);
  }

  let candidateCvText = candidateResponse.data?.cv_text ?? "";
  const job = jobResponse.data;

  if (!candidateCvText.trim()) {
    throw new Error("Le candidat n’a pas encore de CV analysable pour cette offre.");
  }

  if (!job) {
    throw new Error("L’offre sélectionnée est introuvable.");
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("La clé Groq n’est pas configurée. Ajoutez VITE_GROQ_API_KEY ou GROQ_API_KEY.");
  }

  // Générer le prompt complet (système + utilisateur) via la fonction centralisée
  const detectedExperienceYears = parseYears(candidateCvText);
  const prompt = buildGroqAnalysisPrompt(candidateCvText, job, jobId, detectedExperienceYears);

  // Créer un AbortController pour gérer le timeout (30 secondes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const statusCode = response.status;
    
    if (statusCode === 429) {
      throw new Error("L'analyseur est actuellement très sollicité. Veuillez réessayer dans quelques secondes.");
    }
    
    if (statusCode >= 500) {
      let errorMessage = "Le service Groq rencontre des problèmes. Veuillez réessayer ultérieurement.";
      try {
        const errorData = await response.json() as Record<string, unknown>;
        if (errorData && typeof errorData === "object" && "error" in errorData) {
          const errorObj = errorData.error as Record<string, unknown>;
          if (typeof errorObj === "object" && "message" in errorObj && typeof errorObj.message === "string") {
            errorMessage = errorObj.message;
          }
        }
      } catch {
        // Ignorer les erreurs de parsing
      }
      throw new Error(errorMessage);
    }
    
    let errorMessage = `Le service Groq a retourné une erreur ${statusCode}. Veuillez réessayer.`;
    try {
      const errorData = await response.json() as Record<string, unknown>;
      const errorObject = errorData.error as Record<string, unknown> | undefined;
      if (typeof errorObject?.message === "string" && errorObject.message.trim()) {
        errorMessage = errorObject.message;
      }
    } catch {
      // Conserver le message générique si Groq ne renvoie pas de JSON.
    }
    throw new Error(errorMessage);
  }

  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = result?.choices?.[0]?.message?.content;

  if (process.env.NODE_ENV !== "production") {
    console.debug("[groqAnalysis] groq result", result);
    console.debug("[groqAnalysis] content", content);
  }

  if (!content) {
    throw new Error("Le service Groq n’a renvoyé aucune réponse exploitable.");
  }

  // Extraire, nettoyer et parser le JSON en une seule opération
  // (logging des erreurs intégré dans extractAndCleanJson)
  const payload = extractAndCleanJson(content);
  const analysis = sanitizeAnalysisPayload(payload);
  await persistAnalysis(candidateId, jobId, analysis);
  return analysis;
}
