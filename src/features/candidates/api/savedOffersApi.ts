import { supabase } from "@/integrations/supabase/client";

export const MAX_SAVED_OFFERS = 5;

export async function getCandidateSavedOffers(candidateId: string) {
  const { data, error } = await supabase
    .from("candidate_saved_offers")
    .select(
      `
      id,
      saved_at,
      job_offer_id,
      job_offers:job_offer_id(
        id,
        slug,
        title,
        company,
        location_city,
        location_country,
        contract_type,
        salary,
        status,
        deadline,
        expires_at,
        application_email,
        external_link,
        application_whatsapp
      )
    `,
    )
    .eq("candidate_id", candidateId)
    .order("saved_at", { ascending: false });

  if (error) throw error;
  return data as Array<Record<string, unknown>>;
}

export async function saveJobOffer(candidateId: string, jobOfferId: string) {
  const { data: existing, error: existingError } = await supabase
    .from("candidate_saved_offers")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("job_offer_id", jobOfferId)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing as Record<string, unknown>;
  }

  const { count, error: countError } = await supabase
    .from("candidate_saved_offers")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", candidateId);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) >= MAX_SAVED_OFFERS) {
    throw new Error(
      `Vous avez déjà enregistré ${MAX_SAVED_OFFERS} offres. Supprimez-en une avant d'en ajouter une autre.`,
    );
  }

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
