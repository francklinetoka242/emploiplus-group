import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { PostgrestError } from "@supabase/supabase-js";

export type NotificationType =
  "candidature" | "admin" | "evenement" | "offre" | "contact" | "job" | "blog";
export type NotificationStatus = "active" | "masked";

export type NotificationRecord = {
  id: string;
  user_id: string | null;
  type: NotificationType;
  title: string;
  content: string | null;
  is_read: boolean;
  status: NotificationStatus;
  created_at: string;
  body?: string | null;
  link?: string | null;
  read_at?: string | null;
};

export type NotificationInsert = Omit<NotificationRecord, "id" | "created_at">;
export type NotificationUpdate = Partial<Omit<NotificationRecord, "id" | "created_at">>;

type NotificationInsertPayload = Database["public"]["Tables"]["notifications"]["Insert"];
type NotificationUpdatePayload = Database["public"]["Tables"]["notifications"]["Update"];
type NotificationListResult = { data: NotificationRecord[] | null; error: PostgrestError | null };
type NotificationSingleResult = { data: NotificationRecord | null; error: PostgrestError | null };

function normalizeNotification(row: Record<string, unknown>): NotificationRecord {
  return {
    id: String(row.id ?? ""),
    user_id: (row.user_id as string | null) ?? null,
    type: (row.type as NotificationType) ?? "admin",
    title: String(row.title ?? "Notification"),
    content: (row.content as string | null) ?? (row.body as string | null) ?? null,
    is_read: Boolean(row.is_read ?? (row.read_at ? true : false)),
    status: (row.status as NotificationStatus) ?? "active",
    created_at: String(row.created_at ?? new Date().toISOString()),
    body: (row.body as string | null) ?? null,
    link: (row.link as string | null) ?? null,
    read_at: (row.read_at as string | null) ?? null,
  };
}

function isSchemaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.toLowerCase().includes("does not exist") ||
    message.toLowerCase().includes("column") ||
    message.toLowerCase().includes("permission denied")
  );
}

function toPostgrestError(error: unknown): PostgrestError | null {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: "",
      hint: "",
      code: "",
      name: "PostgrestError",
      toJSON: () => ({
        name: "PostgrestError",
        message: error.message,
        details: "",
        hint: "",
        code: "",
      }),
    };
  }

  return null;
}

function buildInsertPayload(payload: NotificationInsert): NotificationInsertPayload {
  return {
    title: payload.title,
    body: payload.content ?? null,
    type: payload.type,
    user_id: payload.user_id,
    status: payload.status,
    is_read: payload.is_read,
  };
}

function buildUpdatePayload(payload: NotificationUpdate): NotificationUpdatePayload {
  return {
    title: payload.title,
    body: payload.content ?? null,
    type: payload.type,
    user_id: payload.user_id,
    status: payload.status,
    is_read: payload.is_read,
  };
}

export async function fetchNotifications(): Promise<NotificationListResult> {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, user_id, type, title, body, is_read, status, created_at, link, read_at",
    )
    .order("created_at", { ascending: false });

  return {
    data: (data ?? []).map((row) => normalizeNotification(row as Record<string, unknown>)),
    error: error ?? null,
  };
}

export async function createNotification(
  payload: NotificationInsert,
): Promise<NotificationSingleResult> {
  const primaryPayload = buildInsertPayload(payload);

  const legacyPayload = {
    title: payload.title,
    body: payload.content ?? "",
    type: payload.type,
    link: null,
  };

  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([primaryPayload])
      .select(
        "id, user_id, type, title, body, is_read, status, created_at, link, read_at",
      )
      .single();

    if (error) {
      if (isSchemaError(error)) {
        const fallback = await supabase
          .from("notifications")
          .insert([legacyPayload])
          .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at")
          .single();
        return {
          data: fallback.data
            ? normalizeNotification(fallback.data as Record<string, unknown>)
            : null,
          error: fallback.error,
        };
      }
      return { data: null, error };
    }

    return {
      data: data ? normalizeNotification(data as Record<string, unknown>) : null,
      error: null,
    };
  } catch (error) {
    const fallback = await supabase
      .from("notifications")
      .insert([legacyPayload])
      .select("*")
      .single();
    return {
      data: fallback.data ? normalizeNotification(fallback.data as Record<string, unknown>) : null,
      error: fallback.error,
    };
  }
}

export async function updateNotification(
  id: string,
  payload: NotificationUpdate,
): Promise<NotificationSingleResult> {
  const primaryPayload = buildUpdatePayload(payload);

  const legacyPayload = {
    title: payload.title,
    body: payload.content,
    type: payload.type,
    link: null,
  };

  try {
    const { data, error } = await supabase
      .from("notifications")
      .update(primaryPayload)
      .eq("id", id)
      .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at")
      .single();

    if (error) {
      if (isSchemaError(error)) {
        const fallback = await supabase
          .from("notifications")
          .update(legacyPayload)
          .eq("id", id)
          .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at")
          .single();
        return {
          data: fallback.data
            ? normalizeNotification(fallback.data as Record<string, unknown>)
            : null,
          error: fallback.error,
        };
      }
      return { data: null, error };
    }

    return {
      data: data ? normalizeNotification(data as Record<string, unknown>) : null,
      error: null,
    };
  } catch (error) {
    const fallback = await supabase
      .from("notifications")
      .update(legacyPayload)
      .eq("id", id)
      .select("*")
      .single();
    return {
      data: fallback.data ? normalizeNotification(fallback.data as Record<string, unknown>) : null,
      error: fallback.error,
    };
  }
}

export async function toggleNotificationVisibility(
  id: string,
  status: NotificationStatus,
): Promise<NotificationSingleResult> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ status })
      .eq("id", id)
      .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at")
      .single();

    if (error) {
      if (isSchemaError(error)) {
        const fallback = await supabase
          .from("notifications")
          .update({ title: "" })
          .eq("id", id)
          .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at")
          .single();
        return {
          data: fallback.data
            ? normalizeNotification(fallback.data as Record<string, unknown>)
            : null,
          error: fallback.error,
        };
      }
      return { data: null, error };
    }

    return {
      data: data ? normalizeNotification(data as Record<string, unknown>) : null,
      error: null,
    };
  } catch (error) {
    return { data: null, error: toPostgrestError(error) };
  }
}

export async function deleteNotification(id: string) {
  return supabase.from("notifications").delete().eq("id", id);
}
