import { supabase } from "@/integrations/supabase/client";

export type NotificationType = "candidature" | "admin" | "evenement" | "offre" | "contact" | "job" | "blog";
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
export type NotificationUpdate = Partial<Omit<NotificationInsert, "is_read">>;

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
  return message.toLowerCase().includes("does not exist") || message.toLowerCase().includes("column") || message.toLowerCase().includes("permission denied");
}

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    data: (data ?? []).map((row) => normalizeNotification(row as Record<string, unknown>)),
    error,
  };
}

export async function createNotification(payload: NotificationInsert) {
  const primaryPayload = {
    title: payload.title,
    content: payload.content ?? "",
    type: payload.type,
    user_id: payload.user_id,
    status: payload.status,
    is_read: payload.is_read,
  };

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
      .select("*")
      .single();

    if (error) {
      if (isSchemaError(error)) {
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
      return { data: null, error };
    }

    return { data: data ? normalizeNotification(data as Record<string, unknown>) : null, error: null };
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

export async function updateNotification(id: string, payload: NotificationUpdate) {
  const primaryPayload = {
    title: payload.title,
    content: payload.content,
    type: payload.type,
    user_id: payload.user_id,
    status: payload.status,
    is_read: payload.is_read,
  };

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
      .select("*")
      .single();

    if (error) {
      if (isSchemaError(error)) {
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
      return { data: null, error };
    }

    return { data: data ? normalizeNotification(data as Record<string, unknown>) : null, error: null };
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

export async function toggleNotificationVisibility(id: string, status: NotificationStatus) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (isSchemaError(error)) {
        const fallback = await supabase
          .from("notifications")
          .update({ title: "" })
          .eq("id", id)
          .select("*")
          .single();
        return {
          data: fallback.data ? normalizeNotification(fallback.data as Record<string, unknown>) : null,
          error: fallback.error,
        };
      }
      return { data: null, error };
    }

    return { data: data ? normalizeNotification(data as Record<string, unknown>) : null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteNotification(id: string) {
  return supabase.from("notifications").delete().eq("id", id);
}
