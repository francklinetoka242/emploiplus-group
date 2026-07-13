import { supabase } from "@/integrations/supabase/client";
import type { CandidateLanguage, CandidateLanguageInsert } from "./types";

export async function getCandidateLanguages(candidateId: string): Promise<CandidateLanguage[]> {
  const { data, error } = await supabase
    .from("candidate_languages")
    .select(
      "id, candidate_id, language_name, proficiency_level, created_at, updated_at"
    )
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CandidateLanguage[];
}

export async function createCandidateLanguage(
  candidateId: string,
  language: CandidateLanguageInsert,
): Promise<CandidateLanguage> {
  const { data, error } = await supabase
    .from("candidate_languages")
    .insert([
      {
        candidate_id: candidateId,
        language_name: language.language_name,
        proficiency_level: language.proficiency_level,
      },
    ])
    .select(
      "id, candidate_id, language_name, proficiency_level"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateLanguage;
}

export async function updateCandidateLanguage(
  languageId: string,
  language: CandidateLanguageInsert,
): Promise<CandidateLanguage> {
  const { data, error } = await supabase
    .from("candidate_languages")
    .update({
      language_name: language.language_name,
      proficiency_level: language.proficiency_level,
    })
    .eq("id", languageId)
    .select(
      "id, candidate_id, language_name, proficiency_level"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateLanguage;
}

export async function deleteCandidateLanguage(languageId: string): Promise<boolean> {
  const { error } = await supabase.from("candidate_languages").delete().eq("id", languageId);

  if (error) {
    throw error;
  }

  return true;
}
