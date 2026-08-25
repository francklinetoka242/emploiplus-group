import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type User } from "@supabase/supabase-js";

const permissionColumns = [
  "identity_contact",
  "cv",
  "career_profile",
  "preferences",
  "applications",
  "saved_offers_searches",
  "alerts",
] as const;
type PermissionColumn = (typeof permissionColumns)[number];

/** Creates the privileged server client used only after the user has been authenticated. */
function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing server Supabase credentials");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Extracts the Supabase access token without accepting other authorization schemes. */
function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

/** Normalizes Vercel's parsed or raw request body to a plain object. */
function bodyOf(req: VercelRequest): Record<string, unknown> {
  if (typeof req.body === "object" && req.body && !Array.isArray(req.body))
    return req.body as Record<string, unknown>;
  if (typeof req.body === "string") {
    try {
      const parsed = JSON.parse(req.body) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

/** Resolves the authenticated Supabase user from the request Bearer token. */
async function authenticate(
  supabase: ReturnType<typeof getSupabaseServer>,
  req: VercelRequest,
): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error || !data.user ? null : data.user;
}

/** Finds the candidate profile belonging to the authenticated user. */
async function getCandidateId(
  supabase: ReturnType<typeof getSupabaseServer>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("candidates")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

/** Returns the authenticated candidate's row, creating strict opt-in defaults on first access. */
async function getPermissions(supabase: ReturnType<typeof getSupabaseServer>, candidateId: string) {
  const { data, error } = await supabase
    .from("candidate_ai_permissions")
    .select(
      "candidate_id,identity_contact,cv,career_profile,preferences,applications,saved_offers_searches,alerts,updated_at",
    )
    .eq("candidate_id", candidateId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: createError } = await supabase
    .from("candidate_ai_permissions")
    .insert({ candidate_id: candidateId })
    .select(
      "candidate_id,identity_contact,cv,career_profile,preferences,applications,saved_offers_searches,alerts,updated_at",
    )
    .single();
  if (createError) throw createError;
  return created;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const supabase = getSupabaseServer();
  const user = await authenticate(supabase, req);
  if (!user) return res.status(401).json({ error: "Authentification requise." });
  const candidateId = await getCandidateId(supabase, user.id);
  if (!candidateId) return res.status(404).json({ error: "Profil candidat introuvable." });

  try {
    if (req.method === "GET")
      return res.status(200).json(await getPermissions(supabase, candidateId));
    const body = bodyOf(req);
    const updates: Partial<Record<PermissionColumn, boolean>> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!(permissionColumns as readonly string[]).includes(key) || typeof value !== "boolean")
        return res.status(400).json({ error: "Permissions invalides." });
      updates[key as PermissionColumn] = value;
    }
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "Au moins une permission booléenne est requise." });
    const { data, error } = await supabase
      .from("candidate_ai_permissions")
      .upsert({ candidate_id: candidateId, ...updates }, { onConflict: "candidate_id" })
      .select(
        "candidate_id,identity_contact,cv,career_profile,preferences,applications,saved_offers_searches,alerts,updated_at",
      )
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    console.error("[maelise-permissions] request failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return res.status(500).json({ error: "Impossible de charger les permissions Maélise." });
  }
}
