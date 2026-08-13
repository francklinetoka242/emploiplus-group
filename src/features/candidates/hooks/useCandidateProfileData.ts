import { useCallback, useEffect, useMemo, useState } from "react";
import type { CandidateProfile } from "@/features/candidates/types";
import { useCandidate } from "./useCandidate";
import { useCandidateEducation } from "./useCandidateEducation";
import { useCandidateSkills } from "./useCandidateSkills";
import { useCandidateLanguages } from "./useCandidateLanguages";
import { useCandidatePreferences } from "./useCandidatePreferences";
import { getCandidateExperiences } from "@/features/candidates/api/experiencesApi";
import type {
  CandidateEducation,
  CandidateExperience,
  CandidateSkill,
  CandidateLanguage,
  CandidatePreferences,
} from "@/features/candidates/types";

/**
 * Coordinated candidate profile data loader.
 * 
 * Loads all candidate-related data synchronously and provides a unified
 * loading state. This ensures that complétude calculations always work with
 * complete, coherent data rather than partially loaded datasets.
 * 
 * Architecture:
 * - Single source of truth: useCandidate() for profile
 * - All sub-data hooks initialized with the same candidate.id
 * - Unified loading state that reflects ALL data loads
 * - No premature completion calculations on partial data
 */
export function useCandidateProfileData() {
  const { profile, loading: profileLoading, error: profileError, refetch } = useCandidate();
  const candidateId = profile?.id;

  // Load all sub-data with the same candidate ID
  const { educations, loading: educationsLoading, error: educationsError } = useCandidateEducation(candidateId);
  const { skills, loading: skillsLoading, error: skillsError } = useCandidateSkills(candidateId);
  const { languages, loading: languagesLoading, error: languagesError } = useCandidateLanguages(candidateId);
  const { preferences, loading: preferencesLoading, error: preferencesError } = useCandidatePreferences(candidateId);

  // Load experiences separately (not in a hook, uses API directly)
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [experiencesError, setExperiencesError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) {
      setExperiences([]);
      return;
    }

    let mounted = true;
    setExperiencesLoading(true);
    setExperiencesError(null);

    const loadExperiences = async () => {
      try {
        const data = await getCandidateExperiences(candidateId);
        if (mounted) {
          setExperiences(data || []);
        }
      } catch (err) {
        if (mounted) {
          setExperiencesError(err instanceof Error ? err.message : "Erreur lors du chargement des expériences");
          setExperiences([]);
        }
      } finally {
        if (mounted) {
          setExperiencesLoading(false);
        }
      }
    };

    void loadExperiences();

    return () => {
      mounted = false;
    };
  }, [candidateId]);

  // Compute unified loading state
  const isLoading = useMemo(() => {
    return profileLoading || educationsLoading || skillsLoading || languagesLoading || preferencesLoading || experiencesLoading;
  }, [profileLoading, educationsLoading, skillsLoading, languagesLoading, preferencesLoading, experiencesLoading]);

  // Compute unified error state (first error encountered)
  const error = useMemo(() => {
    return profileError || educationsError || skillsError || languagesError || preferencesError || experiencesError;
  }, [profileError, educationsError, skillsError, languagesError, preferencesError, experiencesError]);

  // Ensure all data are present before considering ready
  const isReady = useMemo(() => {
    if (!profile) return false;
    if (isLoading) return false;
    // All arrays must be defined (not necessarily filled, but not null/undefined)
    return Array.isArray(educations) && Array.isArray(skills) && Array.isArray(languages) && Array.isArray(experiences) && preferences !== null && preferences !== undefined;
  }, [profile, isLoading, educations, skills, languages, preferences, experiences]);

  return {
    profile,
    educations: educations || [],
    skills: skills || [],
    languages: languages || [],
    preferences: preferences || null,
    experiences: experiences || [],
    isLoading,
    isReady,
    error,
    candidateId,
    refetch,
  };
}
