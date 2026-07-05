import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CandidateAuthService, CandidateProfile } from "@/integrations/supabase/candidate-auth";

export function useCandidate() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await CandidateAuthService.getSession();
      if (!session) {
        setProfile(null);
        return;
      }

      const candidateProfile = await CandidateAuthService.getCurrentProfile();
      setProfile(candidateProfile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors du chargement du profil";
      setError(errorMsg);
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await CandidateAuthService.logout();
      setProfile(null);
      navigate("/candidate/login");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      setError(errorMsg);
      console.error("Error during logout:", err);
    }
  };

  const updateProfile = async (updates: Partial<CandidateProfile>) => {
    if (!profile) return;
    try {
      const updatedProfile = await CandidateAuthService.updateProfile(profile.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil";
      setError(errorMsg);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    logout,
    updateProfile,
    refetch: loadCurrentProfile,
    isAuthenticated: !!profile,
  };
}
