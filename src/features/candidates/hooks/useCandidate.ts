import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { CandidateProfile } from "@/features/candidates/types";
import { updateCandidateProfile } from "@/features/candidates/api/profileApi";
import { logoutCandidate } from "@/features/authentication/api/authApi";
import { useAuthContext } from "@/features/authentication/context/AuthContext";

export function useCandidate() {
  const { profile, isProfileLoading: loading, error, refetchProfile, logout: logoutContext, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      await logoutCandidate();
      await logoutContext();
      navigate("/candidate/login");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      console.error("Error during logout:", err);
      throw new Error(errorMsg);
    }
  }, [logoutContext, navigate]);

  const updateProfile = useCallback(async (updates: Partial<CandidateProfile>) => {
    if (!profile?.id) return null;
    try {
      const updatedProfile = await updateCandidateProfile(profile.id, updates);
      return updatedProfile;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil";
      throw new Error(errorMsg);
    }
  }, [profile?.id]);

  return {
    profile,
    loading,
    error,
    logout,
    updateProfile,
    refetch: refetchProfile,
    isAuthenticated,
  };
}
