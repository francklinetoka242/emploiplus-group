import { useCallback, useEffect, useState } from "react";
import { useCandidate } from "@/hooks/useCandidate";
import { profileService } from "../services/profileService";
import type { CandidateProfile } from "@/features/candidates/api/types";

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
        const data = await profileService.getProfile(baseProfile.id);
        setProfile(data ?? baseProfile);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger le profil.";
        const shouldIgnore = /PGRST116|400|404|406|row level security|permission|not found/i.test(message);
        if (!shouldIgnore) {
          setError(message);
        }
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

    const updated = await profileService.updateProfile(profile.id, updates);
    setProfile(updated);
    await updateBaseProfile(updates);
    return updated;
  }, [profile?.id, updateBaseProfile]);

  return {
    profile,
    loading: loading || baseLoading,
    error: error ?? baseError,
    updateProfile,
    refetch: () => {
      if (!profile?.id) return Promise.resolve(profile);
      return profileService.getProfile(profile.id).then((data) => {
        setProfile(data ?? profile);
        return data ?? profile;
      });
    },
  };
}
