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

export type NotificationInsert = Omit<NotificationRecord, "id" | "created_at"> & {
  link?: string | null;
};
export type NotificationUpdate = Partial<Omit<NotificationRecord, "id" | "created_at">> & {
  link?: string | null;
};

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

const NOTIFICATION_LIST_SELECT = "id, user_id, type, title, body, is_read, status, created_at, link, read_at";

function buildInsertPayload(payload: NotificationInsert): NotificationInsertPayload {
  return {
    title: payload.title,
    body: payload.content ?? null,
    type: payload.type,
    user_id: payload.user_id,
    status: payload.status,
    is_read: payload.is_read,
    link: payload.link ?? null,
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
    link: payload.link ?? null,
  };
}

export async function getNotificationsForUser(userId: string): Promise<NotificationListResult> {
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_LIST_SELECT)
    .eq("status", "active")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: (data ?? []).map((row) => normalizeNotification(row as Record<string, unknown>)),
    error: error ?? null,
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function createUniqueNotification(payload: NotificationInsert) {
  if (!payload.user_id) {
    return createNotification(payload);
  }

  const { data: existing, error: existingError } = await supabase
    .from("notifications")
    .select("id, title, body, link")
    .eq("user_id", payload.user_id)
    .eq("status", payload.status)
    .eq("type", payload.type)
    .order("created_at", { ascending: false })
    .limit(50);

  if (existingError) {
    return { data: null, error: existingError };
  }

  const sameNotification = (existing ?? []).some((notification) => {
    const sameTitle = notification.title === payload.title;
    const sameBody = notification.body === (payload.content ?? null);
    const sameLink = notification.link === payload.link;
    return sameTitle && sameBody && sameLink;
  });

  if (sameNotification) {
    return { data: null, error: null };
  }

  return createNotification(payload);
}

export async function fetchNotifications(): Promise<NotificationListResult> {
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_LIST_SELECT)
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
    if (payload.user_id === null) {
      const { data: candidates, error: candidatesError } = await supabase
        .from("candidates")
        .select("user_id")
        .not("user_id", "is", null);

      if (candidatesError) {
        return { data: null, error: candidatesError };
      }

      const recipients = Array.from(
        new Set((candidates ?? []).map((candidate) => candidate.user_id).filter(Boolean) as string[]),
      );

      if (recipients.length === 0) {
        return { data: null, error: null };
      }

      const rows = recipients.map((userId) => ({
        ...primaryPayload,
        user_id: userId,
        status: payload.status,
        is_read: false,
      }));

      const { data, error } = await supabase
        .from("notifications")
        .insert(rows)
        .select(NOTIFICATION_LIST_SELECT);

      if (error) {
        if (isSchemaError(error)) {
          const fallbackRows = recipients.map((userId) => ({
            title: payload.title,
            body: payload.content ?? "",
            type: payload.type,
            link: payload.link ?? null,
            user_id: userId,
          }));
          const fallback = await supabase
            .from("notifications")
            .insert(fallbackRows)
            .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at");
          return {
            data:
              fallback.data && fallback.data.length > 0
                ? normalizeNotification(fallback.data[0] as Record<string, unknown>)
                : null,
            error: fallback.error,
          };
        }
        return { data: null, error };
      }

      return {
        data: data && data.length > 0 ? normalizeNotification(data[0] as Record<string, unknown>) : null,
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert([primaryPayload])
      .select(NOTIFICATION_LIST_SELECT)
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
      .select(NOTIFICATION_LIST_SELECT)
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
  userId?: string,
): Promise<NotificationSingleResult> {
  const primaryPayload = buildUpdatePayload(payload);

  const legacyPayload = {
    title: payload.title,
    body: payload.content,
    type: payload.type,
    link: null,
  };

  try {
    let query = supabase
      .from("notifications")
      .update(primaryPayload)
      .eq("id", id);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at")
      .single();

    if (error) {
      if (isSchemaError(error)) {
        let fallbackQuery = supabase
          .from("notifications")
          .update(legacyPayload)
          .eq("id", id);

        if (userId) {
          fallbackQuery = fallbackQuery.eq("user_id", userId);
        }

        const fallback = await fallbackQuery
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
    let fallbackQuery = supabase
      .from("notifications")
      .update(legacyPayload)
      .eq("id", id);

    if (userId) {
      fallbackQuery = fallbackQuery.eq("user_id", userId);
    }

    const fallback = await fallbackQuery.select(NOTIFICATION_LIST_SELECT).single();
    return {
      data: fallback.data ? normalizeNotification(fallback.data as Record<string, unknown>) : null,
      error: fallback.error,
    };
  }
}

export async function toggleNotificationVisibility(
  id: string,
  status: NotificationStatus,
  userId?: string,
): Promise<NotificationSingleResult> {
  try {
    let query = supabase
      .from("notifications")
      .update({ status })
      .eq("id", id);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .select("id, user_id, type, title, body, is_read, status, created_at, link, read_at")
      .single();

    if (error) {
      if (isSchemaError(error)) {
        let fallbackQuery = supabase
          .from("notifications")
          .update({ title: "" })
          .eq("id", id);

        if (userId) {
          fallbackQuery = fallbackQuery.eq("user_id", userId);
        }

        const fallback = await fallbackQuery
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

export async function deleteNotification(id: string, userId?: string) {
  const query = supabase.from("notifications").delete().eq("id", id);
  if (userId) {
    return query.eq("user_id", userId);
  }
  return query;
}
