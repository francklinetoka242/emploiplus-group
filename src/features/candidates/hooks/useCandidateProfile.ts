import { useCallback, useEffect, useState } from "react";
import type { CandidateProfile } from "@/features/candidates/api/types";
import { getCandidateProfile, updateCandidateProfile } from "@/features/candidates/api/profileApi";
import { useCandidate } from "./useCandidate";
import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache to emulate react-query staleTime behaviour
const profileCache = new Map<
  string,
  { data: CandidateProfile; ts: number }
>();
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

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

    let isMounted = true;
    const profileId = baseProfile.id;

    // Check cache first (staleTime)
    const cached = profileCache.get(profileId);
    if (cached && Date.now() - cached.ts < STALE_TIME) {
      setProfile(cached.data);
      setLoading(false);
      return;
    }

    // Safety timer to ensure loader is unblocked after 2s
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        // If still no profile, fallback to baseProfile minimal data
        if (!profile) setProfile(baseProfile ?? null);
      }
    }, 2000);

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchPromise = getCandidateProfile(profileId);
        const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
          setTimeout(() => resolve({ timeout: true }), 2000),
        );

        const result = (await Promise.race([fetchPromise, timeoutPromise])) as any;

        if (!isMounted) return;

        // If timeout occurred, attempt minimal fallback from auth user metadata
        if (result?.timeout) {
          try {
            const userRes = await supabase.auth.getUser();
            const user = userRes?.data?.user;
            if (user) {
              const name = (user.user_metadata && (user.user_metadata.name || user.user_metadata.full_name)) || null;
              const firstName = (user.user_metadata && (user.user_metadata.first_name || (typeof name === 'string' ? name.split(' ')[0] : null))) || null;
              const lastName = (user.user_metadata && (user.user_metadata.last_name || (typeof name === 'string' ? name.split(' ').slice(1).join(' ') : null))) || null;
              const now = new Date().toISOString();
              const fallback: CandidateProfile = {
                id: `fallback-${user.id ?? profileId}`,
                user_id: user.id ?? profileId,
                first_name: firstName,
                last_name: lastName,
                email: user.email ?? "",
                phone: null,
                avatar_url: (user.user_metadata && (user.user_metadata.avatar_url || user.user_metadata.picture)) || null,
                bio: null,
                headline: null,
                location_city: null,
                location_country: null,
                date_of_birth: null,
                status: "unknown",
                created_at: now,
                updated_at: now,
              } as CandidateProfile;

              profileCache.set(profileId, { data: fallback, ts: Date.now() });
              setProfile(fallback);
              setError(null);
              return;
            }
          } catch (err) {
            // ignore and fallthrough to set baseProfile
          }
          setProfile(baseProfile ?? null);
          return;
        }

        const data = result as CandidateProfile | null;

        if (data) {
          profileCache.set(profileId, { data, ts: Date.now() });
          setProfile(data);
        } else {
          setProfile(baseProfile ?? null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger le profil.");
        // Attempt fallback from auth user metadata
        try {
          const userRes = await supabase.auth.getUser();
          const user = userRes?.data?.user;
          if (user) {
            const name = (user.user_metadata && (user.user_metadata.name || user.user_metadata.full_name)) || null;
            const firstName = (user.user_metadata && (user.user_metadata.first_name || (typeof name === 'string' ? name.split(' ')[0] : null))) || null;
            const lastName = (user.user_metadata && (user.user_metadata.last_name || (typeof name === 'string' ? name.split(' ').slice(1).join(' ') : null))) || null;
            const now = new Date().toISOString();
            const fallback: CandidateProfile = {
              id: `fallback-${user.id ?? profileId}`,
              user_id: user.id ?? profileId,
              first_name: firstName,
              last_name: lastName,
              email: user.email ?? "",
              phone: null,
              avatar_url: (user.user_metadata && (user.user_metadata.avatar_url || user.user_metadata.picture)) || null,
              bio: null,
              headline: null,
              location_city: null,
              location_country: null,
              date_of_birth: null,
              status: "unknown",
              created_at: now,
              updated_at: now,
            } as CandidateProfile;

            profileCache.set(profileId, { data: fallback, ts: Date.now() });
            setProfile(fallback);
          } else {
            setProfile(baseProfile ?? null);
          }
        } catch (e) {
          setProfile(baseProfile ?? null);
        }
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
      // nothing more to cleanup here
    };
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
