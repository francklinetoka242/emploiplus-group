export interface CandidatePreferences {
  id: string;
  candidate_id: string;
  contract_types: string[];
  work_types: string[];
  mobility_radius_km: number;
  mobility_modes: string[];
  salary_min: number;
  salary_max: number;
  seniority_level: string;
  availability_status: string;
  availability_date: string | null;
  job_alerts_enabled: boolean;
  job_alert_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface CandidatePreferencesInsert {
  contract_types: string[];
  work_types: string[];
  mobility_radius_km?: number;
  mobility_modes?: string[];
  salary_min?: number;
  salary_max?: number;
  seniority_level: string;
  availability_status?: string;
  availability_date?: string | null;
  job_alerts_enabled?: boolean;
  job_alert_frequency?: string;
}
