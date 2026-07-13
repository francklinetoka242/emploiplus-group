export interface CandidateLanguage {
  id: string;
  candidate_id: string;
  language_name: string;
  proficiency_level: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateLanguageInsert {
  language_name: string;
  proficiency_level: string;
}
