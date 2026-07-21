import type { Database } from "@/integrations/supabase/types";

export interface JobOffer extends Database["public"]["Tables"]["job_offers"]["Row"] {}

export type JobOfferInsert = Database["public"]["Tables"]["job_offers"]["Insert"];
export type JobOfferUpdate = Database["public"]["Tables"]["job_offers"]["Update"];

export interface JobOfferFilters {
  query?: string;
  company?: string;
  location?: string;
  contractType?: Database["public"]["Enums"]["contract_type"] | "";
  status?: Database["public"]["Enums"]["job_status"];
  limit?: number;
  offset?: number;
  orderBy?: keyof Database["public"]["Tables"]["job_offers"]["Row"];
  order?: "asc" | "desc";
}
