import { supabase } from "@/integrations/supabase/client";
import { createUniqueNotification } from "@/integrations/supabase/notifications";
import type { Database } from "@/integrations/supabase/types";

export const APPLICATION_COOLDOWN_DAYS = 30;
export const APPLICATION_COOLDOWN_MS = APPLICATION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export function getApplicationCooldownInfo(
  lastAppliedAt: string | null | undefined,
  now = new Date(),
) {
  if (!lastAppliedAt) {
    return {
      isBlocked: false,
      remainingMs: 0,
      message: null,
      lastAppliedAt: null,
    };
  }

  const lastApplied = new Date(lastAppliedAt);
  if (Number.isNaN(lastApplied.getTime())) {
    return {
      isBlocked: false,
      remainingMs: 0,
      message: null,
      lastAppliedAt: null,
    };
  }

  const remainingMs = APPLICATION_COOLDOWN_MS - (now.getTime() - lastApplied.getTime());
  const isBlocked = remainingMs > 0;

  return {
    isBlocked,
    remainingMs: Math.max(0, remainingMs),
    lastAppliedAt: lastApplied.toISOString(),
    message: isBlocked
      ? `Vous avez déjà candidaté à cette offre le ${lastApplied.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}. Vous pourrez postuler à nouveau après le délai de 30 jours.`
      : null,
  };
}

export async function getCandidateApplications(candidateId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select(
      `
      id,
      job_offer_id,
      status,
      cover_letter,
      applied_at,
      updated_at,
      job_offers:job_offer_id(id, title, company, location_city, contract_type, salary)
    `,
    )
    .eq("candidate_id", candidateId)
    .order("applied_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Array<Record<string, unknown>>;
}

export interface CandidateApplicationActivity {
  id: string;
  status: Database["public"]["Enums"]["application_status"];
  applied_at: string;
}

const APPLICATION_ACTIVITY_PAGE_SIZE = 500;

export async function getCandidateApplicationsSince(
  candidateId: string,
  since: Date,
): Promise<CandidateApplicationActivity[]> {
  if (!Number.isFinite(since.getTime())) {
    throw new Error("La date de début des candidatures est invalide.");
  }

  const applications: CandidateApplicationActivity[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("job_applications")
      .select("id, status, applied_at")
      .eq("candidate_id", candidateId)
      .gte("applied_at", since.toISOString())
      .order("applied_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + APPLICATION_ACTIVITY_PAGE_SIZE - 1);

    if (error) throw error;

    const page = (data ?? []) as CandidateApplicationActivity[];
    applications.push(...page);
    if (page.length < APPLICATION_ACTIVITY_PAGE_SIZE) return applications;
    offset += APPLICATION_ACTIVITY_PAGE_SIZE;
  }
}

export async function getCandidateApplicationsForStatusBreakdown(
  candidateId: string,
): Promise<CandidateApplicationActivity[]> {
  const applications: CandidateApplicationActivity[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("job_applications")
      .select("id, status, applied_at")
      .eq("candidate_id", candidateId)
      .order("applied_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + APPLICATION_ACTIVITY_PAGE_SIZE - 1);

    if (error) throw error;

    const page = (data ?? []) as CandidateApplicationActivity[];
    applications.push(...page);
    if (page.length < APPLICATION_ACTIVITY_PAGE_SIZE) return applications;
    offset += APPLICATION_ACTIVITY_PAGE_SIZE;
  }
}

export async function getCandidateApplicationsCount(candidateId: string): Promise<number> {
  const { count, error } = await supabase
    .from("job_applications")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", candidateId)
    .neq("status", "withdrawn");

  if (error) throw error;
  if (count === null) {
    throw new Error("Le nombre de candidatures n’a pas pu être déterminé.");
  }
  return count;
}

export async function getJobApplicationCooldown(candidateId: string, jobOfferId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select("id, applied_at, status")
    .eq("candidate_id", candidateId)
    .eq("job_offer_id", jobOfferId)
    .order("applied_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  const lastApplication = data as { id?: string; applied_at?: string; status?: string } | null;
  return getApplicationCooldownInfo(lastApplication?.applied_at ?? null);
}

export async function applyToJob(
  candidateId: string,
  jobOfferId: string,
  coverLetter?: string,
  subject?: string,
) {
  const { data: offer, error: offerError } = await supabase
    .from("job_offers")
    .select("status, publish_at, deadline, expires_at")
    .eq("id", jobOfferId)
    .maybeSingle();

  if (offerError) throw offerError;
  const now = new Date().toISOString();
  if (
    !offer ||
    offer.status !== "published" ||
    (offer.publish_at && offer.publish_at > now) ||
    (offer.deadline && offer.deadline < now) ||
    (offer.expires_at && offer.expires_at < now)
  ) {
    throw new Error("Cette offre n'est plus disponible pour une candidature.");
  }

  const { data: currentApplication, error: currentError } = await supabase
    .from("job_applications")
    .select("id, applied_at")
    .eq("candidate_id", candidateId)
    .eq("job_offer_id", jobOfferId)
    .order("applied_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (currentError && currentError.code !== "PGRST116") {
    throw currentError;
  }

  const cooldownInfo = getApplicationCooldownInfo(currentApplication?.applied_at ?? null);
  if (cooldownInfo.isBlocked && cooldownInfo.message) {
    throw new Error(cooldownInfo.message);
  }

  const payload = {
    candidate_id: candidateId,
    job_offer_id: jobOfferId,
    cover_letter: coverLetter ?? null,
    subject: subject ?? null,
    status: "submitted",
    applied_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("job_applications")
      .insert([payload])
      .select(
        "id, candidate_id, job_offer_id, status, cover_letter, subject, applied_at, updated_at",
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        const duplicateInfo = getApplicationCooldownInfo(currentApplication?.applied_at ?? null);
        if (duplicateInfo.message) {
          throw new Error(duplicateInfo.message);
        }
        throw new Error(
          "Une candidature pour cette offre existe déjà. Vous ne pouvez pas postuler deux fois avant le délai de 30 jours.",
        );
      }

      if (
        error.message?.toLowerCase().includes("30 jours") ||
        error.message?.toLowerCase().includes("already")
      ) {
        throw new Error(error.message);
      }
      throw error;
    }

    return data as Record<string, unknown>;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Vous avez déjà candidaté à cette offre")
    ) {
      throw error;
    }

    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      const duplicateInfo = getApplicationCooldownInfo(currentApplication?.applied_at ?? null);
      if (duplicateInfo.message) {
        throw new Error(duplicateInfo.message);
      }
      throw new Error(
        "Une candidature pour cette offre existe déjà. Vous ne pouvez pas postuler deux fois avant le délai de 30 jours.",
      );
    }

    throw error;
  }
}

export async function withdrawApplication(applicationId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationId)
    .select("id, candidate_id, job_offer_id, status, cover_letter, applied_at, updated_at")
    .single();

  if (error) throw error;

  if (data?.candidate_id && data?.job_offer_id) {
    const { data: jobData } = await supabase
      .from("job_offers")
      .select("slug, title")
      .eq("id", data.job_offer_id)
      .maybeSingle();

    void createUniqueNotification({
      title: "Votre candidature a été mise à jour.",
      content: jobData?.title
        ? `Votre candidature pour « ${jobData.title} » a bien été retirée.`
        : "Votre candidature a bien été mise à jour.",
      type: "candidature",
      user_id:
        (
          await supabase
            .from("candidates")
            .select("user_id")
            .eq("id", data.candidate_id)
            .maybeSingle()
        ).data?.user_id ?? null,
      status: "active",
      is_read: false,
      link: "/candidate/applications",
    });
  }

  return data as Record<string, unknown>;
}
