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

function getUserIds(req: VercelRequest): string[] {
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  if (!body || !Array.isArray(body.userIds)) return [];
  return body.userIds.filter((userId: unknown): userId is string => typeof userId === "string");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseServer();
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Authentification requise." });

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const currentUser: User | null = authData.user;
    if (authError || !currentUser) return res.status(401).json({ error: "Authentification requise." });

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .eq("is_active", true);
    if (rolesError) return res.status(500).json({ error: "Impossible de vérifier les droits." });

    const isAdmin = (roles ?? []).some((row) => row.role === "admin" || row.role === "super_admin");
    if (!isAdmin) return res.status(403).json({ error: "Accès administrateur requis." });

    const userIds = getUserIds(req).slice(0, 100);
    const emailConfirmedByUserId: Record<string, boolean> = {};

    for (const userId of userIds) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (!userError && userData.user) {
        emailConfirmedByUserId[userId] = Boolean(userData.user.email_confirmed_at);
      }
    }

    return res.status(200).json({ emailConfirmedByUserId });
  } catch (error) {
    console.error("[admin-candidate-email-status] request failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return res.status(500).json({ error: "Impossible de charger la confirmation des emails." });
  }
}