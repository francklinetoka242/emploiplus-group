import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { clearAuthStorage } from "@/features/authentication/utils/authStorage";

function assertEmailConfirmed(user: User | null | undefined) {
  if (user?.email_confirmed_at) {
    return;
  }

  throw Object.assign(new Error("EMAIL_NOT_CONFIRMED"), {
    code: "EMAIL_NOT_CONFIRMED",
    userEmail: user?.email ?? null,
  });
}

const getStringValue = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
};

export function parseAuthErrorMessage(error: unknown): string {
  if (error == null) {
    return "Une erreur est survenue";
  }

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed || "Une erreur est survenue";
  }

  if (error instanceof Error) {
    const errorMessage = error.message?.trim();
    if (errorMessage && errorMessage !== "{}" && errorMessage !== "[]") {
      return errorMessage;
    }
  }

  const errorRecord = error as Record<string, unknown>;
  const candidates = [
    errorRecord.message,
    errorRecord.error_description,
    errorRecord.code,
    errorRecord.error,
    errorRecord.name,
    errorRecord.details,
    errorRecord.hint,
    typeof errorRecord.status === "number" ? `Erreur ${errorRecord.status}` : null,
    (errorRecord.body as { error?: unknown } | undefined)?.error,
    (errorRecord.body as { message?: unknown } | undefined)?.message,
    (errorRecord.data as { message?: unknown } | undefined)?.message,
    (errorRecord.data as { error?: unknown } | undefined)?.error,
    (errorRecord.response as { data?: { message?: unknown; error?: unknown } } | undefined)?.data
      ?.message,
    (errorRecord.response as { data?: { message?: unknown; error?: unknown } } | undefined)?.data
      ?.error,
  ];

  for (const candidate of candidates) {
    const value = getStringValue(candidate);
    if (value) {
      return value;
    }
  }

  if (typeof error === "object" && error !== null) {
    const errorWithToJson = error as { toJSON?: () => unknown };
    if (typeof errorWithToJson.toJSON === "function") {
      try {
        const jsonData = errorWithToJson.toJSON();
        if (jsonData && typeof jsonData === "object") {
          const parsedKeys = Object.entries(jsonData)
            .map(([key, value]) => {
              const stringValue = getStringValue(value);
              return stringValue ? `${key}: ${stringValue}` : null;
            })
            .filter(Boolean);
          if (parsedKeys.length > 0) {
            return parsedKeys.join(", ");
          }
        }
      } catch {
        // ignored
      }
    }

    try {
      const json = JSON.stringify(error);
      if (json && json !== "{}" && json !== "[]") {
        return json;
      }
    } catch {
      // ignored
    }

    const props = Object.getOwnPropertyNames(error)
      .map((key) => {
        const value = (error as Record<string, unknown>)[key];
        const stringValue = getStringValue(value);
        return stringValue ? `${key}: ${stringValue}` : null;
      })
      .filter(Boolean);

    if (props.length > 0) {
      return props.join(", ");
    }
  }

  return "Une erreur est survenue";
}

export async function loginCandidate(email: string, password: string) {
  clearAuthStorage();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const user = data.user || data.session?.user;
  try {
    assertEmailConfirmed(user);
  } catch (error) {
    if (data.session) {
      await supabase.auth.signOut();
    }
    throw error;
  }

  return data;
}

export async function signupCandidate(email: string, password: string, options?: { redirectTo?: string; data?: Record<string, unknown> }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: options?.redirectTo,
      data: options?.data,
    },
  });

  if (error) throw error;
  return data;
}

export async function logoutCandidate() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function getCandidateSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data.session ?? null;
    if (!session) {
      clearAuthStorage();
      return null;
    }

    const user = session.user;
    if (!user.email_confirmed_at) {
      await supabase.auth.signOut();
      clearAuthStorage();
      return null;
    }

    return session;
  } catch (error) {
    clearAuthStorage();
    throw error;
  }
}

export async function resendConfirmationEmail(email: string) {
  const response = await fetch("/api/resend-confirmation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw body?.error ? new Error(body.error) : new Error("Impossible de renvoyer l'email de confirmation.");
  }

  return true;
}

export async function requestPasswordReset(email: string) {
  const response = await fetch("/api/password-reset-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw body?.error ? new Error(body.error) : new Error("Impossible d'envoyer le lien de réinitialisation.");
  }

  return true;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return true;
}

export { getCandidateSession as getSession };
export const changeCandidatePassword = updatePassword;
