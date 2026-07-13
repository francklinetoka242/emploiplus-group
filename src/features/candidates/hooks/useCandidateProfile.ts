import { useCallback, useEffect, useState } from "react";
import type { CandidateProfile } from "@/features/candidates/api/types";
import { getCandidateProfile, updateCandidateProfile } from "@/features/candidates/api/profileApi";
import { useCandidate } from "./useCandidate";

export function useCandidateProfile() {
  const { profile: baseProfile, loading: baseLoading, error: baseError, updateProfile: updateBaseProfile } = useCandidate();
  const [profile, setProfile] = useState<CandidateProfile | null>(baseProfile ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!baseProfile?.id) {
      setProfile(baseProfile ?? null);
      setLoading(baseLoading);
      setError(baseError);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCandidateProfile(baseProfile.id);
        setProfile(data ?? baseProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [baseProfile?.id, baseLoading, baseError]);

  const updateProfile = useCallback(async (updates: Partial<CandidateProfile>) => {
    if (!profile?.id) {
      throw new Error("Profil non chargé.");
    }

    const updated = await updateCandidateProfile(profile.id, updates);
    setProfile(updated);
    await updateBaseProfile(updates);
    return updated;
  }, [profile?.id, updateBaseProfile]);

  return {
    profile,
    loading: loading || baseLoading,
    error: error ?? baseError,
    updateProfile,
    refetch: async () => {
      if (!profile?.id) return profile;
      const data = await getCandidateProfile(profile.id);
      setProfile(data ?? profile);
      return data ?? profile;
    },
  };
}
