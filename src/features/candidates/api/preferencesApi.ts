import { supabase } from "@/integrations/supabase/client";
import type { CandidatePreferences, CandidatePreferencesInsert } from "./types";

function isIgnorablePreferencesError(error: { code?: string; status?: number; message?: string } | null | undefined) {
  if (!error) return true;
  if (error.code === "PGRST116") return true;
  if (error.status === 400 || error.status === 404 || error.status === 406) return true;
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("no rows") || message.includes("not found") || message.includes("row level security") || message.includes("permission");
}

export async function getCandidatePreferences(candidateId: string): Promise<CandidatePreferences | null> {
  const { data, error } = await supabase
    .from("candidate_preferences")
    .select("id, candidate_id, contract_types, work_types, salary_min, salary_max, seniority_level, created_at, updated_at")
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (error) {
    if (isIgnorablePreferencesError(error)) {
      return null;
    }
    throw error;
  }

  return data as CandidatePreferences | null;
}

export async function saveCandidatePreferences(
  candidateId: string,
  preferences: CandidatePreferencesInsert,
): Promise<CandidatePreferences> {
  const existing = await getCandidatePreferences(candidateId);

  if (existing) {
    const { data, error } = await supabase
      .from("candidate_preferences")
      .update({
        contract_types: preferences.contract_types,
        work_types: preferences.work_types,
        salary_min: preferences.salary_min,
        salary_max: preferences.salary_max,
        seniority_level: preferences.seniority_level,
      })
      .eq("id", existing.id)
      .select(
        "id, candidate_id, contract_types, work_types, salary_min, salary_max, seniority_level, created_at, updated_at",
      )
      .single();

    if (error) {
      throw error;
    }

    return data as CandidatePreferences;
  }

  const { data, error } = await supabase
    .from("candidate_preferences")
    .insert([
      {
        candidate_id: candidateId,
        contract_types: preferences.contract_types,
        work_types: preferences.work_types,
        salary_min: preferences.salary_min,
        salary_max: preferences.salary_max,
        seniority_level: preferences.seniority_level,
      },
    ])
    .select(
      "id, candidate_id, contract_types, work_types, salary_min, salary_max, seniority_level, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as CandidatePreferences;
}
