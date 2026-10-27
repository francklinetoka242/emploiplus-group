import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const CONTRACT_TYPES = [
  "cdi",
  "cdd",
  "stage",
  "freelance",
  "prestation_de_services",
  "consultance",
  "temps_partiel",
  "interim",
] as const;

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

const SYSTEM_PROMPT = `Tu lis l'image d'une offre d'emploi (affiche, capture d'écran, photo) et tu en extrais les informations pour remplir le formulaire d'une plateforme d'emploi en Afrique centrale.

RÈGLES
- N'invente rien. Si une information n'apparaît pas clairement sur l'image, mets null (ou [] pour une liste).
- Corrige l'orthographe et la ponctuation, mais ne change pas le sens et n'ajoute aucun fait.
- Texte brut uniquement dans description et requirements : pas de Markdown (pas de **, #, tableaux). Pour une liste, une ligne par élément commençant par "- ". Sépare les blocs par une ligne vide.
- "description" : présentation du poste, missions et conditions. "requirements" : profil recherché (diplômes, expérience, compétences). Ne répète pas le même contenu dans les deux.
- Si l'offre explique comment postuler (dossier à fournir, adresse de dépôt, etc.), termine "description" par un bloc « Comment postuler : ... ». Un numéro de téléphone qui n'est pas explicitement WhatsApp va dans ce bloc, pas dans application_whatsapp.
- "contract_type" : une seule valeur parmi ${CONTRACT_TYPES.join(", ")}, sinon null.
- "deadline" : date limite au format AAAA-MM-JJ. Si l'année est absente, déduis-la à partir de la date du jour fournie (prochaine occurrence de cette date). Sinon null.
- "tags" : 3 à 6 mots-clés courts (métier, secteur, compétence clé).
- "seo_description" : 155 caractères maximum, une phrase qui résume l'offre.
- "a_verifier" : liste courte (en français) de tout ce qui est flou, illisible, coupé ou incertain sur l'image (ex. « date limite peu lisible », « nom de l'entreprise absent »).

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de cette forme :
{
  "title": string|null,
  "company": string|null,
  "location_city": string|null,
  "location_country": string|null,
  "contract_type": string|null,
  "salary": string|null,
  "application_email": string|null,
  "application_whatsapp": string|null,
  "external_link": string|null,
  "deadline": string|null,
  "description": string|null,
  "requirements": string|null,
  "tags": string[],
  "seo_description": string|null,
  "a_verifier": string[]
}`;

type SanitizedOffer = {
  title: string | null;
  company: string | null;
  location_city: string | null;
  location_country: string | null;
  contract_type: (typeof CONTRACT_TYPES)[number] | null;
  salary: string | null;
  application_email: string | null;
  application_whatsapp: string | null;
  external_link: string | null;
  deadline: string | null;
  description: string | null;
  requirements: string | null;
  tags: string[];
  seo_description: string | null;
  a_verifier: string[];
};

const str = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function sanitize(raw: unknown): SanitizedOffer {
  const source = isRecord(raw) ? raw : {};
  const email = str(source.application_email);
  const link = str(source.external_link);
  const deadline = str(source.deadline);
  const contract = str(source.contract_type)?.toLowerCase() ?? null;

  return {
    title: str(source.title),
    company: str(source.company),
    location_city: str(source.location_city),
    location_country: str(source.location_country),
    contract_type:
      contract && (CONTRACT_TYPES as readonly string[]).includes(contract)
        ? (contract as (typeof CONTRACT_TYPES)[number])
        : null,
    salary: str(source.salary),
    application_email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    application_whatsapp: str(source.application_whatsapp),
    external_link: link && /^https?:\/\//i.test(link) ? link : null,
    deadline: isValidDate(deadline) ? deadline : null,
    description: str(source.description),
    requirements: str(source.requirements),
    tags: Array.isArray(source.tags)
      ? source.tags
          .map(str)
          .filter((tag): tag is string => tag !== null)
          .slice(0, 8)
      : [],
    seo_description: str(source.seo_description)?.slice(0, 160) ?? null,
    a_verifier: Array.isArray(source.a_verifier)
      ? source.a_verifier
          .map(str)
          .filter((item): item is string => item !== null)
          .slice(0, 10)
      : [],
  };
}

function parseRequestBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body);
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return isRecord(body) ? body : null;
}

function extractText(response: unknown): string {
  if (!isRecord(response) || !Array.isArray(response.candidates)) return "";
  const candidate = response.candidates[0];
  if (!isRecord(candidate) || !isRecord(candidate.content)) return "";
  const parts = candidate.content.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .filter(isRecord)
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("");
}

function getGeminiErrorDetails(body: unknown) {
  if (!isRecord(body) || !isRecord(body.error)) return {};

  const error = body.error;
  const detail = Array.isArray(error.details)
    ? error.details.find((item) => isRecord(item) && typeof item.reason === "string")
    : undefined;

  return {
    status: typeof error.status === "string" ? error.status : undefined,
    reason: isRecord(detail) && typeof detail.reason === "string" ? detail.reason : undefined,
    message: typeof error.message === "string" ? error.message : undefined,
  };
}

export function explainGeminiError(status: number, body: unknown): string {
  const details = getGeminiErrorDetails(body);
  const message = details.message?.toLowerCase() ?? "";

  if (details.reason === "API_KEY_INVALID" || message.includes("api key not valid")) {
    return "La clé GEMINI_API_KEY a été refusée par Google. Vérifiez la clé Google AI Studio configurée dans .env.local.";
  }
  if (status === 403) {
    return "Google refuse l'accès à Gemini pour cette clé ou ce projet (HTTP 403). Vérifiez les autorisations et restrictions de la clé.";
  }
  if (status === 404) {
    return "Le modèle Gemini demandé est introuvable (HTTP 404). Vérifiez GEMINI_MODEL ou retirez cette variable pour utiliser le modèle par défaut.";
  }
  if (status === 429) {
    return "Quota ou limite de requêtes Gemini atteint. Réessayez plus tard.";
  }
  if (status >= 500) {
    return `Le service Gemini rencontre un problème temporaire (HTTP ${status}). Réessayez plus tard.`;
  }

  return `Gemini a refusé la requête (HTTP ${status}). Vérifiez la configuration et réessayez.`;
}

export async function fetchGeminiWithRetry(
  url: string,
  options: RequestInit,
  fetchRequest: typeof fetch = fetch,
  wait: (milliseconds: number) => Promise<void> = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
): Promise<Response> {
  const retryableStatuses = new Set([500, 502, 503, 504]);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetchRequest(url, options);
      if (!retryableStatuses.has(response.status) || attempt === 2) return response;
    } catch (error) {
      if (attempt === 2) throw error;
    }

    await wait(500 * 2 ** attempt);
  }

  throw new Error("Gemini request retries exhausted.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const authorization = req.headers.authorization;
  const token = (Array.isArray(authorization) ? authorization[0] : authorization)
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) return res.status(401).json({ error: "Non connecté." });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!supabaseUrl || !serviceRoleKey || !geminiApiKey) {
    console.error("extract-job-offer: server configuration is incomplete");
    return res.status(500).json({ error: "Configuration serveur incomplète." });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ error: "Session invalide." });
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("is_active", true);

    if (rolesError) {
      console.error("extract-job-offer: role lookup failed", rolesError.message);
      return res.status(500).json({ error: "Vérification du rôle impossible." });
    }

    const isAdmin = roles?.some((role) => ["admin", "super_admin"].includes(role.role)) ?? false;
    if (!isAdmin) {
      return res.status(403).json({ error: "Accès réservé aux administrateurs." });
    }

    const body = parseRequestBody(req.body);
    const imageBase64 = body?.imageBase64;
    const mediaType = body?.mediaType;
    if (
      typeof imageBase64 !== "string" ||
      imageBase64.length === 0 ||
      typeof mediaType !== "string" ||
      !MEDIA_TYPES.includes(mediaType as MediaType) ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)
    ) {
      return res.status(400).json({ error: "Image manquante ou format non supporté." });
    }
    if (imageBase64.length > 6_000_000) {
      return res.status(413).json({ error: "Image trop lourde." });
    }

    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const today = new Date().toISOString().slice(0, 10);
    const aiResponse = await fetchGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType: mediaType, data: imageBase64 } },
                { text: `Date du jour : ${today}. Extrais l'offre d'emploi de cette image.` },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (!aiResponse.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await aiResponse.json();
      } catch {
        // The provider may return a non-JSON error body.
      }
      const details = getGeminiErrorDetails(errorBody);
      console.error("extract-job-offer: Gemini request failed", {
        httpStatus: aiResponse.status,
        providerStatus: details.status,
        reason: details.reason,
      });
      return res.status(aiResponse.status === 429 ? 429 : 502).json({
        error: explainGeminiError(aiResponse.status, errorBody),
      });
    }

    const responseData: unknown = await aiResponse.json();
    const text = extractText(responseData);
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return res.status(502).json({ error: "Réponse illisible, réessaie." });
    }

    const offer = sanitize(JSON.parse(text.slice(start, end + 1)));
    return res.status(200).json(offer);
  } catch (error) {
    console.error("extract-job-offer:", error);
    return res.status(500).json({ error: "Échec de la lecture de l'offre." });
  }
}
