export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_name: string;
  proficiency_level: string | null;
  created_at: string;
}

export interface CandidateSkillInsert {
  skill_name: string;
  proficiency_level?: string | null;
}
