import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CandidateProfile } from "@/features/candidates/types";
import {
  getCandidateProfileByUserId,
  updateCandidateProfile,
} from "@/features/candidates/api/profileApi";
import { logoutCandidate } from "@/features/authentication/api/authApi";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";

/**
 * Candidate profile hook - manages candidate-specific data.
 * Independent from auth context.
 * Loads profile only when needed on candidate routes.
 */
export function useCandidate() {
  const { logout: logoutContext, isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load candidate profile when user becomes authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setProfile(null);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextProfile = await getCandidateProfileByUserId(user.id);
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg =
            err instanceof Error ? err.message : "Erreur lors du chargement du profil";
          setError(errorMsg);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  const logout = useCallback(async () => {
    try {
      await logoutCandidate();
      await logoutContext();
      setProfile(null);
      navigate("/candidate/login");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      console.error("Error during logout:", err);
      throw new Error(errorMsg);
    }
  }, [logoutContext, navigate]);

  const updateProfile = useCallback(
    async (updates: Partial<CandidateProfile>) => {
      if (!profile?.id) return null;
      try {
        const updatedProfile = await updateCandidateProfile(profile.id, updates);
        setProfile(updatedProfile);
        return updatedProfile;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil";
        throw new Error(errorMsg);
      }
    },
    [profile?.id],
  );

  const refetch = useCallback(async () => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const nextProfile = await getCandidateProfileByUserId(user.id);
      setProfile(nextProfile);
      return nextProfile;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors du rechargement du profil";
      setError(errorMsg);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    logout,
    updateProfile,
    refetch,
    isAuthenticated,
  };
}
