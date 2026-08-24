import { supabase } from "@/integrations/supabase/client";

export type CandidateOnboarding = {
  id: string;
  candidate_id: string;
  current_step: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type CandidateOnboardingUpdate = {
  current_step?: number;
  completed?: boolean;
  completed_at?: string | null;
};

export type LegacyCandidateOnboardingState = {
  current_step?: number;
  completed?: boolean;
};

const ONBOARDING_SELECT =
  "id, candidate_id, current_step, completed, completed_at, created_at, updated_at";

export async function getCandidateOnboarding(candidateId: string): Promise<CandidateOnboarding | null> {
  const { data, error } = await supabase
    .from("candidate_onboarding")
    .select(ONBOARDING_SELECT)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (error) throw error;
  return data as CandidateOnboarding | null;
}

export async function initializeCandidateOnboarding(
  candidateId: string,
  legacyState?: LegacyCandidateOnboardingState,
): Promise<CandidateOnboarding> {
  const completed = legacyState?.completed === true;
  const { data, error } = await supabase
    .from("candidate_onboarding")
    .insert({
      candidate_id: candidateId,
      current_step: Math.max(0, legacyState?.current_step ?? 0),
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .select(ONBOARDING_SELECT)
    .single();

  if (!error) return data as CandidateOnboarding;

  if (error.code === "23505") {
    const existing = await getCandidateOnboarding(candidateId);
    if (existing) return existing;
  }

  throw error;
}

export async function getOrInitializeCandidateOnboarding(
  candidateId: string,
  legacyState?: LegacyCandidateOnboardingState,
): Promise<CandidateOnboarding> {
  const existing = await getCandidateOnboarding(candidateId);
  if (existing) return existing;

  return initializeCandidateOnboarding(candidateId, legacyState);
}

export async function updateCandidateOnboarding(
  candidateId: string,
  updates: CandidateOnboardingUpdate,
): Promise<CandidateOnboarding> {
  const { data, error } = await supabase
    .from("candidate_onboarding")
    .update(updates)
    .eq("candidate_id", candidateId)
    .select(ONBOARDING_SELECT)
    .single();

  if (error) throw error;
  return data as CandidateOnboarding;
}

export async function completeCandidateOnboarding(candidateId: string): Promise<CandidateOnboarding> {
  return updateCandidateOnboarding(candidateId, {
    completed: true,
    completed_at: new Date().toISOString(),
  });
}

export async function getCandidateOnboardingForUser(userId: string): Promise<{
  candidateId: string;
  onboarding: CandidateOnboarding | null;
}> {
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (candidateError) throw candidateError;
  if (!candidate) return { candidateId: "", onboarding: null };

  return {
    candidateId: candidate.id,
    onboarding: await getCandidateOnboarding(candidate.id),
  };
}
