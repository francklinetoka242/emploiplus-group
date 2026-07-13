import { supabase } from "@/integrations/supabase/client";
import type { CandidateSkill, CandidateSkillInsert } from "./types";

export async function getCandidateSkills(candidateId: string): Promise<CandidateSkill[]> {
  const { data, error } = await supabase
    .from("candidate_skills")
    .select("id, candidate_id, skill_name, proficiency_level, created_at")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CandidateSkill[];
}

export async function createCandidateSkill(
  candidateId: string,
  skill: CandidateSkillInsert,
): Promise<CandidateSkill> {
  const { data, error } = await supabase
    .from("candidate_skills")
    .insert([
      {
        candidate_id: candidateId,
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency_level ?? null,
      },
    ])
    .select("id, candidate_id, skill_name, proficiency_level, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateSkill;
}

export async function updateCandidateSkill(skillId: string, skill: CandidateSkillInsert): Promise<CandidateSkill> {
  const { data, error } = await supabase
    .from("candidate_skills")
    .update({
      skill_name: skill.skill_name,
      proficiency_level: skill.proficiency_level ?? null,
    })
    .eq("id", skillId)
    .select("id, candidate_id, skill_name, proficiency_level, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateSkill;
}

export async function deleteCandidateSkill(skillId: string): Promise<boolean> {
  const { error } = await supabase.from("candidate_skills").delete().eq("id", skillId);

  if (error) {
    throw error;
  }

  return true;
}
