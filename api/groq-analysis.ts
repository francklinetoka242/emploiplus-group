import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { buildGroqAnalysisPrompt } from "../src/services/groqAnalysisPrompt.js";
import { parseYears } from "../src/services/matchScoreUtils.js";

const PROMPT_VERSION = "v2.2_2026-07-27";
const MAX_CV_LENGTH = 120_000;
const MAX_JOB_FIELD_LENGTH = 40_000;

interface AnalysisResult {
  match_score: number;
  score: number;
  experienceVerified: string;
  strengths: string[];
  improvements: string[];
  gaps: string[];
  summary: string;
  cover_letter_draft: string;
}

interface RecordValue {
  [key: string]: unknown;
}

function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing server Supabase credentials");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function bearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  return header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() || null : null;
}

function readJobField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > MAX_JOB_FIELD_LENGTH ? cleaned.slice(0, MAX_JOB_FIELD_LENGTH) : cleaned;
}

function sanitizeResult(value: unknown): AnalysisResult {
  const record = value && typeof value === "object" ? (value as RecordValue) : {};
  const rawScore = Number(record.score ?? record.match_score ?? record.matchScore ?? 0);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0;
  const strings = (key: string) =>
    Array.isArray(record[key])
      ? record[key]
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];
  const improvements = strings("improvements");
  const gaps = strings("gaps");
  return {
    match_score: score,
    score,
    experienceVerified:
      typeof record.experienceVerified === "string" ? record.experienceVerified.trim() : "",
    strengths: strings("strengths"),
    improvements: improvements.length ? improvements : gaps,
    gaps: gaps.length ? gaps : improvements,
    summary: typeof record.summary === "string" ? record.summary.trim() : "",
    cover_letter_draft:
      typeof record.cover_letter_draft === "string"
        ? record.cover_letter_draft.trim()
        : typeof record.cover_letter === "string"
          ? record.cover_letter.trim()
          : "",
  };
}

function parseModelResponse(content: string): AnalysisResult {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid Groq response");
  return sanitizeResult(JSON.parse(match[0]));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Connexion requise pour analyser une offre." });

  const body = (req.body && typeof req.body === "object" ? req.body : {}) as RecordValue;
  const jobId = typeof body.job_id === "string" ? body.job_id.trim() : "";
  if (!jobId || jobId.length > 100) return res.status(400).json({ error: "Offre invalide." });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey)
    return res.status(503).json({ error: "Le service d'analyse est momentanément indisponible." });

  try {
    const supabase = getSupabaseServer();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user)
      return res.status(401).json({ error: "Session invalide ou expirée." });

    const [{ data: candidate }, { data: job }] = await Promise.all([
      supabase
        .from("candidates")
        .select("id,cv_text")
        .eq("user_id", authData.user.id)
        .maybeSingle(),
      supabase
        .from("job_offers")
        .select("id,title,company,description,requirements,status,publish_at,deadline,expires_at")
        .eq("id", jobId)
        .maybeSingle(),
    ]);

    const now = new Date().toISOString();
    const offerIsAvailable = Boolean(
      job &&
      job.status === "published" &&
      (!job.publish_at || job.publish_at <= now) &&
      (!job.deadline || job.deadline >= now) &&
      (!job.expires_at || job.expires_at >= now),
    );
    if (!job || !offerIsAvailable)
      return res.status(404).json({ error: "Cette offre n'est plus disponible." });
    if (!candidate?.id) return res.status(404).json({ error: "Profil candidat introuvable." });

    const cvText = typeof candidate.cv_text === "string" ? candidate.cv_text.trim() : "";
    if (!cvText)
      return res
        .status(400)
        .json({ error: "Le candidat n’a pas encore de CV analysable pour cette offre." });
    if (cvText.length > MAX_CV_LENGTH)
      return res.status(400).json({ error: "Le CV est trop volumineux pour être analysé." });

    const { data: cached } = await supabase
      .from("ai_analysis_cache")
      .select("match_score,strengths,improvements,cover_letter_draft,prompt_version")
      .eq("candidate_id", candidate.id)
      .eq("job_id", job.id)
      .maybeSingle();
    if (cached?.prompt_version === PROMPT_VERSION) {
      return res.status(200).json(sanitizeResult(cached));
    }

    const prompt = buildGroqAnalysisPrompt(
      cvText,
      {
        title: readJobField(job.title),
        company: readJobField(job.company),
        description: readJobField(job.description),
        requirements: readJobField(job.requirements),
      },
      job.id,
      parseYears(cvText),
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let groqResponse: Response;
    try {
      groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (groqResponse.status === 429)
      return res
        .status(429)
        .json({ error: "L'analyseur est très sollicité. Réessayez dans quelques secondes." });
    if (!groqResponse.ok)
      return res
        .status(groqResponse.status >= 500 ? 503 : 502)
        .json({ error: "Le service d'analyse est momentanément indisponible." });
    const groqBody = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = groqBody.choices?.[0]?.message?.content;
    if (!content)
      return res
        .status(502)
        .json({ error: "Le service d'analyse n'a pas fourni de réponse exploitable." });

    const analysis = parseModelResponse(content);
    await supabase.from("ai_analysis_cache").upsert(
      {
        candidate_id: candidate.id,
        job_id: job.id,
        match_score: analysis.match_score,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        cover_letter_draft: analysis.cover_letter_draft,
        prompt_version: PROMPT_VERSION,
      },
      { onConflict: "candidate_id,job_id" },
    );
    return res.status(200).json(analysis);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      return res.status(504).json({ error: "Le délai d'analyse est dépassé. Réessayez." });
    console.error("[groq-analysis] request failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return res.status(503).json({ error: "Le service d'analyse est momentanément indisponible." });
  }
}
