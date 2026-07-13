import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CandidateProfile } from "@/features/candidates/api/types";
import { getCandidateProfile, getCandidateProfileByUserId, updateCandidateProfile } from "@/features/candidates/api/profileApi";
import { getCandidateSession, logoutCandidate } from "@/features/authentication/api/authApi";

export function useCandidate() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadCurrentProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await getCandidateSession();
      console.debug("[useCandidate] session from getCandidateSession:", { hasSession: Boolean(session), userId: session?.user?.id ?? null });
      if (!session) {
        setProfile(null);
        return null;
      }

      console.debug("[useCandidate] loading candidate profile by user id:", { userId: session.user.id });
      const candidateProfile = await getCandidateProfileByUserId(session.user.id);
      console.debug("[useCandidate] candidateProfile result:", { exists: Boolean(candidateProfile), candidateId: candidateProfile?.id ?? null });
      setProfile(candidateProfile);
      return candidateProfile;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors du chargement du profil";
      setError(errorMsg);
      console.error("Error loading profile:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentProfile();
  }, [loadCurrentProfile]);

  const logout = useCallback(async () => {
    try {
      await logoutCandidate();
      setProfile(null);
      navigate("/candidate/login");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      setError(errorMsg);
      console.error("Error during logout:", err);
    }
  }, [navigate]);

  const updateProfile = useCallback(async (updates: Partial<CandidateProfile>) => {
    if (!profile?.id) return null;
    try {
      const updatedProfile = await updateCandidateProfile(profile.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil";
      setError(errorMsg);
      throw err;
    }
  }, [profile?.id]);

  return {
    profile,
    loading,
    error,
    logout,
    updateProfile,
    refetch: loadCurrentProfile,
    isAuthenticated: Boolean(profile),
  };
}
