import { supabase } from "@/integrations/supabase/client";
import type { CandidateEducation, CandidateEducationInsert } from "./types";

function isIgnorableEducationError(error: { code?: string; status?: number; message?: string } | null | undefined) {
  if (!error) return true;
  if (error.code === "PGRST116") return true;
  if (error.status === 400 || error.status === 404 || error.status === 406) return true;
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("no rows") || message.includes("not found") || message.includes("row level security") || message.includes("permission");
}

export async function getCandidateEducations(candidateId: string): Promise<CandidateEducation[]> {
  const { data, error } = await supabase
    .from("candidate_education")
    .select("id, candidate_id, school, degree, field_of_study, start_date, end_date, is_current, created_at, updated_at")
    .eq("candidate_id", candidateId)
    .order("start_date", { ascending: false });

  if (error) {
    if (isIgnorableEducationError(error)) {
      return [];
    }
    throw error;
  }

  return (data ?? []) as CandidateEducation[];
}

export async function createCandidateEducation(
  candidateId: string,
  education: CandidateEducationInsert,
): Promise<CandidateEducation> {
  const { data, error } = await supabase
    .from("candidate_education")
    .insert([
      {
        candidate_id: candidateId,
        school: education.school,
        degree: education.degree,
        field_of_study: education.field_of_study ?? null,
        start_date: education.start_date ?? null,
        end_date: education.end_date ?? null,
        is_current: education.is_current ?? false,
      },
    ])
    .select("id, candidate_id, school, degree, field_of_study, start_date, end_date, is_current, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateEducation;
}

export async function updateCandidateEducation(
  educationId: string,
  education: CandidateEducationInsert,
): Promise<CandidateEducation> {
  const { data, error } = await supabase
    .from("candidate_education")
    .update({
      school: education.school,
      degree: education.degree,
      field_of_study: education.field_of_study ?? null,
      start_date: education.start_date ?? null,
      end_date: education.end_date ?? null,
      is_current: education.is_current ?? false,
    })
    .eq("id", educationId)
    .select("id, candidate_id, school, degree, field_of_study, start_date, end_date, is_current, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateEducation;
}

export async function deleteCandidateEducation(educationId: string): Promise<boolean> {
  const { error } = await supabase.from("candidate_education").delete().eq("id", educationId);

  if (error) {
    throw error;
  }

  return true;
}
