import { supabase } from "@/integrations/supabase/client";
import type { CandidateProfile } from "./types";

export async function getCandidateApplications(candidateId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select(`
      id,
      status,
      cover_letter,
      applied_at,
      updated_at,
      job_offers:job_offer_id(id, title, company, location_city, contract_type, salary)
    `)
    .eq("candidate_id", candidateId)
    .order("applied_at", { ascending: false });

  if (error) throw error;
  return data as Array<Record<string, unknown>>;
}

export async function applyToJob(candidateId: string, jobOfferId: string, coverLetter?: string, subject?: string) {
  const payload = {
    candidate_id: candidateId,
    job_offer_id: jobOfferId,
    cover_letter: coverLetter ?? null,
    subject: subject ?? null,
    status: "submitted",
  };

  const { data, error } = await supabase
    .from("job_applications")
    .upsert([payload], { onConflict: ["candidate_id", "job_offer_id"] })
    .select("id, candidate_id, job_offer_id, status, cover_letter, subject, applied_at, updated_at")
    .single();

  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function withdrawApplication(applicationId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationId)
    .select("id, candidate_id, job_offer_id, status, cover_letter, applied_at, updated_at")
    .single();

  if (error) throw error;
  return data as Record<string, unknown>;
}
