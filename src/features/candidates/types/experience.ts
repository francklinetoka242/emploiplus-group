export interface CandidateExperience {
  id: string;
  candidate_id: string;
  job_title: string;
  company: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateExperienceInsert {
  job_title: string;
  company: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
}
