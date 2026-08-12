import { supabase } from "@/integrations/supabase/client";
import type { CandidateProfile } from "@/features/candidates/types";
import { buildCandidateProfileUpdatePayload } from "./profileUpdateUtils";

const ALLOWED_PROFILE_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "avatar_url",
  "bio",
  "headline",
  "location_city",
  "location_country",
  "date_of_birth",
  "status",
] as const;

function isIgnorableProfileError(error: { code?: string; status?: number; message?: string } | null | undefined) {
  if (!error) return true;
  if (error.code === "PGRST116") return true;
  if (error.status === 400 || error.status === 404 || error.status === 406) return true;
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("no rows") || message.includes("not found") || message.includes("row level security") || message.includes("permission");
}

export async function getCandidateProfile(candidateId: string): Promise<CandidateProfile | null> {
  const { data, error } = await supabase
    .from("candidates")
    .select(
      "id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at",
    )
    .eq("id", candidateId)
    .maybeSingle();

  if (error) {
    if (isIgnorableProfileError(error)) {
      return null;
    }
    throw error;
  }

  return data as CandidateProfile | null;
}

export async function getCandidateProfileByUserId(userId: string): Promise<CandidateProfile | null> {
  try {
    const fetchPromise = supabase
      .from("candidates")
      .select(
        "id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at",
      )
      .eq("user_id", userId)
      .maybeSingle();

    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 2000),
    );

    const result = (await Promise.race([fetchPromise, timeoutPromise])) as any;

    // Si timeout, utiliser un fallback minimal basé sur user_metadata
    if (result?.timeout) {
      try {
        const userRes = await supabase.auth.getUser();
        const user = userRes?.data?.user;
        if (user) {
          const name = (user.user_metadata && (user.user_metadata.name || user.user_metadata.full_name)) || null;
          const firstName = (user.user_metadata && (user.user_metadata.first_name || (typeof name === 'string' ? name.split(' ')[0] : null))) || null;
          const lastName = (user.user_metadata && (user.user_metadata.last_name || (typeof name === 'string' ? name.split(' ').slice(1).join(' ') : null))) || null;
          const now = new Date().toISOString();
          return {
            id: `fallback-${user.id ?? userId}`,
            user_id: user.id ?? userId,
            first_name: firstName,
            last_name: lastName,
            email: user.email ?? "",
            phone: null,
            avatar_url: (user.user_metadata && (user.user_metadata.avatar_url || user.user_metadata.picture)) || null,
            bio: null,
            headline: null,
            location_city: null,
            location_country: null,
            date_of_birth: null,
            status: "unknown",
            created_at: now,
            updated_at: now,
          } as CandidateProfile;
        }
      } catch (err) {
        return null;
      }
    }

    const { data, error } = result;

    if (error) {
      if (isIgnorableProfileError(error)) {
        return null;
      }
      throw error;
    }

    return data as CandidateProfile | null;
  } catch (err) {
    // En cas d'erreur, tenter un fallback minimum
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user;
      if (user) {
        const name = (user.user_metadata && (user.user_metadata.name || user.user_metadata.full_name)) || null;
        const firstName = (user.user_metadata && (user.user_metadata.first_name || (typeof name === 'string' ? name.split(' ')[0] : null))) || null;
        const lastName = (user.user_metadata && (user.user_metadata.last_name || (typeof name === 'string' ? name.split(' ').slice(1).join(' ') : null))) || null;
        const now = new Date().toISOString();
        return {
          id: `fallback-${user.id ?? userId}`,
          user_id: user.id ?? userId,
          first_name: firstName,
          last_name: lastName,
          email: user.email ?? "",
          phone: null,
          avatar_url: (user.user_metadata && (user.user_metadata.avatar_url || user.user_metadata.picture)) || null,
          bio: null,
          headline: null,
          location_city: null,
          location_country: null,
          date_of_birth: null,
          status: "unknown",
          created_at: now,
          updated_at: now,
        } as CandidateProfile;
      }
    } catch (e) {
      // ignore
    }

    // Si on ne peut pas fournir de fallback, repropager l'erreur
    throw err;
  }
}

export async function createCandidateProfile(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    location_city?: string | null;
    location_country?: string | null;
    date_of_birth?: string | null;
  },
): Promise<CandidateProfile> {
  const { data: profile, error } = await supabase
    .from("candidates")
    .insert([
      {
        user_id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        location_city: data.location_city ?? null,
        location_country: data.location_country ?? null,
        date_of_birth: data.date_of_birth ?? null,
        status: "active",
      },
    ])
    .select(
      "id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return profile as CandidateProfile;
}

export async function updateCandidateProfile(
  candidateId: string,
  updates: Partial<CandidateProfile>,
): Promise<CandidateProfile> {
  const safeUpdates: Record<string, unknown> = {};

  Object.entries(updates || {}).forEach(([key, value]) => {
    if (!ALLOWED_PROFILE_FIELDS.includes(key as (typeof ALLOWED_PROFILE_FIELDS)[number])) {
      return;
    }

    if (value === undefined) {
      return;
    }

    safeUpdates[key] = value;
  });

  const currentProfile = await getCandidateProfile(candidateId);
  const payload = buildCandidateProfileUpdatePayload(safeUpdates, currentProfile);

  const { data, error } = await supabase
    .from("candidates")
    .update(payload)
    .eq("id", candidateId)
    .select(
      "id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateProfile;
}

export async function deleteCandidateProfile(candidateId: string): Promise<boolean> {
  const { error } = await supabase.from("candidates").delete().eq("id", candidateId);
  if (error) throw error;
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // ignore sign out errors but still consider profile deleted
  }
  return true;
}
