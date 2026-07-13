export interface CandidatePreferences {
  id: string;
  candidate_id: string;
  contract_types: string[];
  work_types: string[];
  salary_min: number;
  salary_max: number;
  seniority_level: string;
  created_at: string;
  updated_at: string;
}

export interface CandidatePreferencesInsert {
  contract_types: string[];
  work_types: string[];
  salary_min: number;
  salary_max: number;
  seniority_level: string;
}
