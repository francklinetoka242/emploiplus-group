import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type User } from "@supabase/supabase-js";

function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing server Supabase credentials");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

function bodyOf(req: VercelRequest): Record<string, unknown> {
  if (typeof req.body === "object" && req.body && !Array.isArray(req.body))
    return req.body as Record<string, unknown>;
  return {};
}

async function authenticate(
  supabase: ReturnType<typeof getSupabaseServer>,
  req: VercelRequest,
): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error || !data.user ? null : data.user;
}

/** Marks the authenticated user's conversation deleted and clears its session metadata. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const supabase = getSupabaseServer();
  const user = await authenticate(supabase, req);
  if (!user) return res.status(401).json({ error: "Authentification requise." });
  const conversationId = bodyOf(req).conversation_id;
  if (typeof conversationId !== "string" || !conversationId.trim())
    return res.status(400).json({ error: "conversation_id est requis." });

  const { data, error } = await supabase
    .from("maelise_conversations")
    .update({
      status: "deleted",
      summary: null,
      active_intent: null,
      active_domain: null,
      active_filters: {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[maelise-conversation] reset failed", { name: error.name });
    return res.status(500).json({ error: "Impossible de réinitialiser la conversation." });
  }
  if (!data) return res.status(404).json({ error: "Conversation introuvable." });
  return res.status(200).json({ ok: true });
}
