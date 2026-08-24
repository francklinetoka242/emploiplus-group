import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CandidateProfile } from "@/features/candidates/types";
import {
  getCurrentCandidate,
  updateCandidateProfile,
} from "@/features/candidates/api/profileApi";
import { logoutCandidate } from "@/features/authentication/api/authApi";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";
import { diagnosticLogger } from "@/services/diagnosticLogger";

type ProfileListener = () => void;

const profileCache = new Map<string, CandidateProfile | null>();
const profileRequests = new Map<string, Promise<CandidateProfile | null>>();
const profileListeners = new Map<string, Set<ProfileListener>>();

function notifyProfileListeners(userId: string) {
  profileListeners.get(userId)?.forEach((listener) => listener());
}

function subscribeToProfile(userId: string, listener: ProfileListener) {
  const listeners = profileListeners.get(userId) ?? new Set<ProfileListener>();
  listeners.add(listener);
  profileListeners.set(userId, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) profileListeners.delete(userId);
  };
}

function loadSharedProfile(userId: string, force = false) {
  if (!force && profileCache.has(userId)) {
    return Promise.resolve(profileCache.get(userId) ?? null);
  }

  const existingRequest = profileRequests.get(userId);
  if (existingRequest) return existingRequest;

  const request = getCurrentCandidate()
    .then((nextProfile) => {
      profileCache.set(userId, nextProfile);
      notifyProfileListeners(userId);
      return nextProfile;
    })
    .finally(() => {
      profileRequests.delete(userId);
    });

  profileRequests.set(userId, request);
  return request;
}

/**
 * Candidate profile hook - manages candidate-specific data.
 * Independent from auth context.
 * Loads profile only when needed on candidate routes.
 */
export function useCandidate() {
  const { logout: logoutContext, isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CandidateProfile | null>(() =>
    user?.id ? profileCache.get(user.id) ?? null : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load candidate profile when user becomes authenticated
  useEffect(() => {
    diagnosticLogger.log('USECANDIDATE_EFFECT_START', {
      isAuthenticated,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    }, 'useCandidate');
    
    if (!isAuthenticated || !user?.id) {
      diagnosticLogger.log('USECANDIDATE_SKIPPED', {
        isAuthenticated,
        hasUserId: !!user?.id,
      }, 'useCandidate');
      setProfile(null);
      return;
    }

    let isMounted = true;
    const syncProfile = () => {
      if (isMounted) setProfile(profileCache.get(user.id) ?? null);
    };
    const unsubscribe = subscribeToProfile(user.id, syncProfile);

    const loadProfile = async () => {
      diagnosticLogger.log('LOAD_PROFILE_START', {
        userId: user.id,
        timestamp: new Date().toISOString(),
      }, 'useCandidate');
      
      setLoading(true);
      setError(null);

      try {
        const nextProfile = await loadSharedProfile(user.id);
        diagnosticLogger.log('LOAD_PROFILE_SUCCESS', {
          userId: user.id,
          profileId: nextProfile?.id,
          cvText: !!nextProfile?.cv_text,
          embedding: !!nextProfile?.embedding_vector,
          timestamp: new Date().toISOString(),
        }, 'useCandidate');
        
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg =
            err instanceof Error ? err.message : "Erreur lors du chargement du profil";
          diagnosticLogger.log('LOAD_PROFILE_ERROR', {
            userId: user.id,
            error: errorMsg,
            timestamp: new Date().toISOString(),
          }, 'useCandidate');
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
      unsubscribe();
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
        profileCache.set(profile.id, updatedProfile);
        notifyProfileListeners(profile.id);
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
      const nextProfile = await loadSharedProfile(user.id, true);
      profileCache.set(user.id, nextProfile);
      notifyProfileListeners(user.id);
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

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;

    const handleCvUploaded = (event: Event) => {
      const candidateId = (event as CustomEvent<{ candidateId?: string }>).detail?.candidateId;
      if (candidateId === profile?.id) {
        void refetch();
      }
    };

    window.addEventListener("cv-uploaded", handleCvUploaded);
    return () => window.removeEventListener("cv-uploaded", handleCvUploaded);
  }, [profile?.id, refetch, user?.id]);

  return {
    profile,
    loading,
    error,
    logout,
    updateProfile,
    refetch,
  };
}
