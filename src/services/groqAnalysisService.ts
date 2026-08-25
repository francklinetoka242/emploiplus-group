import { supabase } from "@/integrations/supabase/client";

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

export async function analyzeCandidateForJob(
  _candidateId: string,
  jobId: string,
): Promise<AiAnalysisResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/groq-analysis", {
    method: "POST",
    headers,
    body: JSON.stringify({ job_id: jobId }),
  });
  const body = (await response.json().catch(() => null)) as
    (AiAnalysisResult & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(body?.error || "Le service d'analyse est momentanément indisponible.");
  }
  if (!body || typeof body.match_score !== "number") {
    throw new Error("La réponse du service d'analyse est invalide.");
  }
  return body;
}
