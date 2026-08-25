import { supabase } from "@/integrations/supabase/client";
import type { MaeliseApiResponse } from "./types";

export const maelisePermissionColumns = [
  "identity_contact",
  "cv",
  "career_profile",
  "preferences",
  "applications",
  "saved_offers_searches",
  "alerts",
] as const;

export type MaelisePermissionColumn = (typeof maelisePermissionColumns)[number];
export type MaelisePermissions = Record<MaelisePermissionColumn, boolean> & {
  candidate_id: string;
  updated_at: string;
};

/** Sends an authenticated read or partial update to the permissions endpoint. */
async function permissionsRequest(
  method: "GET" | "PATCH",
  updates?: Partial<Record<MaelisePermissionColumn, boolean>>,
): Promise<MaelisePermissions> {
  const { data } = await supabase.auth.getSession();
  const headers: HeadersInit = {};
  if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
  if (updates) headers["Content-Type"] = "application/json";
  const response = await fetch("/api/maelise-permissions", {
    method,
    headers,
    body: updates ? JSON.stringify(updates) : undefined,
  });
  const body = (await response.json().catch(() => null)) as
    (Partial<MaelisePermissions> & { error?: string }) | null;
  if (!response.ok)
    throw new Error(body?.error || "Impossible de charger les permissions Maélise.");
  return body as MaelisePermissions;
}

/** Loads the current persisted permissions for the signed-in candidate. */
export function getMaelisePermissions() {
  return permissionsRequest("GET");
}

export function updateMaelisePermissions(
  /** Persists one or more explicit boolean permission changes. */
  updates: Partial<Record<MaelisePermissionColumn, boolean>>,
) {
  return permissionsRequest("PATCH", updates);
}

/** Archives the active server conversation without creating its replacement. */
export async function resetMaeliseConversation(conversationId: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
  const response = await fetch("/api/maelise-conversation", {
    method: "POST",
    headers,
    body: JSON.stringify({ conversation_id: conversationId }),
  });
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new Error(body?.error || "Impossible de réinitialiser la conversation.");
}

export async function sendMaeliseMessage(
  message: string,
  conversationId: string | null,
  anonymousSessionId: string,
): Promise<MaeliseApiResponse> {
  const { data } = await supabase.auth.getSession();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (data.session?.access_token) {
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  const response = await fetch("/api/maelise", {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      anonymous_session_id: anonymousSessionId,
    }),
  });

  const body = (await response.json().catch(() => null)) as
    (Partial<MaeliseApiResponse> & { error?: string }) | null;
  if (!response.ok) {
    const error = new Error(body?.error || "Maélise est momentanément indisponible.");
    Object.assign(error, { status: response.status });
    throw error;
  }
  if (body?.conversation_id === undefined || !body.assistant) {
    throw new Error("La réponse de Maélise est invalide.");
  }
  return body as MaeliseApiResponse;
}
