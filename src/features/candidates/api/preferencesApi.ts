import { supabase } from "@/integrations/supabase/client";
import type { CandidatePreferences, CandidatePreferencesInsert } from "./types";

const EXTENDED_SELECT =
  "id, candidate_id, contract_types, work_types, mobility_radius_km, mobility_modes, salary_min, salary_max, seniority_level, availability_status, availability_date, job_alerts_enabled, job_alert_frequency, created_at, updated_at";
const LEGACY_SELECT =
  "id, candidate_id, contract_types, work_types, salary_min, salary_max, seniority_level, created_at, updated_at";

function isIgnorablePreferencesError(error: { code?: string; status?: number; message?: string } | null | undefined) {
  if (!error) return true;
  if (error.code === "PGRST116") return true;
  if (error.status === 400 || error.status === 404 || error.status === 406) return true;
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("no rows") || message.includes("not found") || message.includes("row level security") || message.includes("permission");
}

export async function getCandidatePreferences(candidateId: string): Promise<CandidatePreferences | null> {
  const extended = await supabase
    .from("candidate_preferences")
    .select(EXTENDED_SELECT)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (!extended.error) {
    return extended.data as CandidatePreferences | null;
  }

  const legacy = await supabase
    .from("candidate_preferences")
    .select(LEGACY_SELECT)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (legacy.error) {
    if (isIgnorablePreferencesError(legacy.error)) return null;
    throw legacy.error;
  }

  if (!legacy.data) return null;
  return {
    ...legacy.data,
    mobility_radius_km: 50,
    mobility_modes: [],
    availability_status: "immediately",
    availability_date: null,
    job_alerts_enabled: true,
    job_alert_frequency: "weekly",
  } as CandidatePreferences;
}

export async function saveCandidatePreferences(
  candidateId: string,
  preferences: CandidatePreferencesInsert,
): Promise<CandidatePreferences> {
  const existing = await getCandidatePreferences(candidateId);

  const extendedPayload = {
    contract_types: preferences.contract_types,
    work_types: preferences.work_types,
    mobility_radius_km: preferences.mobility_radius_km ?? 50,
    mobility_modes: preferences.mobility_modes ?? [],
    salary_min: preferences.salary_min,
    salary_max: preferences.salary_max,
    seniority_level: preferences.seniority_level,
    availability_status: preferences.availability_status ?? "immediately",
    availability_date: preferences.availability_date ?? null,
    job_alerts_enabled: preferences.job_alerts_enabled ?? true,
    job_alert_frequency: preferences.job_alert_frequency ?? "weekly",
  };
  const legacyPayload = {
    contract_types: preferences.contract_types,
    work_types: preferences.work_types,
    salary_min: preferences.salary_min,
    salary_max: preferences.salary_max,
    seniority_level: preferences.seniority_level,
  };

  if (existing) {
    const extended = await supabase
      .from("candidate_preferences")
      .update(extendedPayload)
      .eq("id", existing.id)
      .select(EXTENDED_SELECT)
      .single();

    if (!extended.error) {
      return extended.data as CandidatePreferences;
    }

    const legacy = await supabase
      .from("candidate_preferences")
      .update(legacyPayload)
      .eq("id", existing.id)
      .select(LEGACY_SELECT)
      .single();
    if (legacy.error) throw legacy.error;
    return {
      ...legacy.data,
      mobility_radius_km: 50,
      mobility_modes: [],
      availability_status: "immediately",
      availability_date: null,
      job_alerts_enabled: true,
      job_alert_frequency: "weekly",
    } as CandidatePreferences;
  }

  const extended = await supabase
    .from("candidate_preferences")
    .insert([{ candidate_id: candidateId, ...extendedPayload }])
    .select(EXTENDED_SELECT)
    .single();

  if (!extended.error) {
    return extended.data as CandidatePreferences;
  }

  const legacy = await supabase
    .from("candidate_preferences")
    .insert([{ candidate_id: candidateId, ...legacyPayload }])
    .select(LEGACY_SELECT)
    .single();
  if (legacy.error) throw legacy.error;
  return {
    ...legacy.data,
    mobility_radius_km: 50,
    mobility_modes: [],
    availability_status: "immediately",
    availability_date: null,
    job_alerts_enabled: true,
    job_alert_frequency: "weekly",
  } as CandidatePreferences;
}
