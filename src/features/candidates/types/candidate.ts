export interface CandidateProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  headline: string | null;
  location_city: string | null;
  location_country: string | null;
  date_of_birth: string | null;
  status: string;
  cv_text?: string | null;
  embedding_vector?: string | null;
  cv_url?: string | null;
  created_at: string;
  updated_at: string;
}
