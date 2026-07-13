import { supabase } from "@/integrations/supabase/client";
import type { CandidateExperience, CandidateExperienceInsert } from "./types";

export async function getCandidateExperiences(candidateId: string): Promise<CandidateExperience[]> {
  const { data, error } = await supabase
    .from("candidate_experience")
    .select(
      "id, candidate_id, job_title, company, description, start_date, end_date, is_current, created_at, updated_at",
    )
    .eq("candidate_id", candidateId)
    .order("start_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CandidateExperience[];
}

export async function createCandidateExperience(
  candidateId: string,
  experience: CandidateExperienceInsert,
): Promise<CandidateExperience> {
  const { data, error } = await supabase
    .from("candidate_experience")
    .insert([
      {
        candidate_id: candidateId,
        job_title: experience.job_title,
        company: experience.company,
        description: experience.description ?? null,
        start_date: experience.start_date,
        end_date: experience.end_date ?? null,
        is_current: experience.is_current ?? false,
      },
    ])
    .select(
      "id, candidate_id, job_title, company, description, start_date, end_date, is_current, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateExperience;
}

export async function updateCandidateExperience(
  experienceId: string,
  experience: CandidateExperienceInsert,
): Promise<CandidateExperience> {
  const { data, error } = await supabase
    .from("candidate_experience")
    .update({
      job_title: experience.job_title,
      company: experience.company,
      description: experience.description ?? null,
      start_date: experience.start_date,
      end_date: experience.end_date ?? null,
      is_current: experience.is_current ?? false,
    })
    .eq("id", experienceId)
    .select(
      "id, candidate_id, job_title, company, description, start_date, end_date, is_current, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateExperience;
}

export async function deleteCandidateExperience(experienceId: string): Promise<boolean> {
  const { error } = await supabase.from("candidate_experience").delete().eq("id", experienceId);

  if (error) {
    throw error;
  }

  return true;
}
