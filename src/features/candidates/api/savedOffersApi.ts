import { supabase } from "@/integrations/supabase/client";

export async function getCandidateSavedOffers(candidateId: string) {
  const { data, error } = await supabase
    .from("candidate_saved_offers")
    .select(`
      id,
      saved_at,
      job_offers:job_offer_id(id, title, company, location_city, contract_type, salary)
    `)
    .eq("candidate_id", candidateId)
    .order("saved_at", { ascending: false });

  if (error) throw error;
  return data as Array<Record<string, unknown>>;
}

export async function saveJobOffer(candidateId: string, jobOfferId: string) {
  const { data, error } = await supabase
    .from("candidate_saved_offers")
    .insert([{ candidate_id: candidateId, job_offer_id: jobOfferId }])
    .select()
    .single();

  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function unsaveJobOffer(savedOfferId: string) {
  const { error } = await supabase.from("candidate_saved_offers").delete().eq("id", savedOfferId);
  if (error) throw error;
  return true;
}
