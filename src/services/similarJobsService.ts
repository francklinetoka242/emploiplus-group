import { supabase } from "@/integrations/supabase/client";
import type { JobOffer } from "@/features/jobs/types";
import { isJobActive } from "@/services/similarJobsUtils";

const JOB_SELECT =
  "id, slug, title, company, contract_type, location_city, location_country, description, requirements, status, publish_at, expires_at, deadline, salary, tags";

export type SimilarJobsOptions = {
  limit?: number;
  excludeId?: string;
  includeExpired?: boolean;
};

function normalizeText(value?: string | null): string {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function scoreSimilarity(reference: JobOffer, candidate: JobOffer): number {
  const rawTextRef = [reference.title, reference.company, reference.description, reference.requirements, reference.tags?.join(" ")]
    .filter(Boolean)
    .join(" ");
  const rawTextCandidate = [candidate.title, candidate.company, candidate.description, candidate.requirements, candidate.tags?.join(" ")]
    .filter(Boolean)
    .join(" ");

  const referenceTokens = new Set(normalizeText(rawTextRef).match(/[a-z0-9]+/g) ?? []);
  const candidateTokens = new Set(normalizeText(rawTextCandidate).match(/[a-z0-9]+/g) ?? []);
  const overlap = [...referenceTokens].filter((token) => candidateTokens.has(token)).length;
  const tokenOverlapRatio = referenceTokens.size > 0 ? overlap / referenceTokens.size : 0;

  let score = tokenOverlapRatio * 55;

  if (reference.contract_type && candidate.contract_type && reference.contract_type === candidate.contract_type) {
    score += 15;
  }

  if (reference.location_city && candidate.location_city && normalizeText(reference.location_city) === normalizeText(candidate.location_city)) {
    score += 18;
  } else if (reference.location_country && candidate.location_country && normalizeText(reference.location_country) === normalizeText(candidate.location_country)) {
    score += 8;
  }

  if (reference.company && candidate.company && normalizeText(reference.company) === normalizeText(candidate.company)) {
    score += 6;
  }

  const referenceTitle = normalizeText(reference.title);
  const candidateTitle = normalizeText(candidate.title);
  if (referenceTitle && candidateTitle && referenceTitle.includes(candidateTitle.slice(0, 12))) {
    score += 8;
  }

  const sharedTags = (reference.tags ?? []).filter((tag) => (candidate.tags ?? []).includes(tag));
  score += Math.min(sharedTags.length * 8, 16);

  return Math.max(0, Math.min(100, score));
}

export async function findSimilarJobs(referenceJob: Partial<JobOffer> | null | undefined, options: SimilarJobsOptions = {}): Promise<JobOffer[]> {
  if (!referenceJob?.id) {
    return [];
  }

  const limit = Math.max(1, Math.min(options.limit ?? 4, 12));
  const { data, error } = await supabase
    .from("job_offers")
    .select(JOB_SELECT)
    .neq("id", referenceJob.id)
    .order("publish_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  const offers = ((data ?? []) as JobOffer[]).filter((offer) => {
    if (options.excludeId && offer.id === options.excludeId) {
      return false;
    }

    if (offer.status === "archived") {
      return false;
    }

    if (options.includeExpired) {
      return true;
    }

    return isJobActive(offer, false);
  });

  return offers
    .map((offer) => ({
      ...offer,
      _similarity: scoreSimilarity(referenceJob as JobOffer, offer),
    }))
    .sort((left, right) => Number(right._similarity) - Number(left._similarity))
    .slice(0, limit)
    .map(({ _similarity, ...offer }) => offer as JobOffer);
}
