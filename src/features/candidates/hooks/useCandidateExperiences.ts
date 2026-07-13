import { useCallback, useEffect, useState } from "react";
import type { CandidateExperience, CandidateExperienceInsert } from "@/features/candidates/api/types";
import {
  createCandidateExperience,
  deleteCandidateExperience,
  getCandidateExperiences,
  updateCandidateExperience,
} from "@/features/candidates/api/experiencesApi";

export function useCandidateExperiences(candidateId?: string | null) {
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCandidateExperiences(candidateId);
      setExperiences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les expériences.");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    void fetchExperiences();
  }, [fetchExperiences]);

  const createExperience = useCallback(async (experience: CandidateExperienceInsert) => {
    if (!candidateId) throw new Error("Profil non chargé.");
    const created = await createCandidateExperience(candidateId, experience);
    setExperiences((prev) => [created, ...prev]);
    return created;
  }, [candidateId]);

  const updateExperience = useCallback(async (experienceId: string, experience: CandidateExperienceInsert) => {
    const updated = await updateCandidateExperience(experienceId, experience);
    setExperiences((prev) => prev.map((item) => (item.id === experienceId ? updated : item)));
    return updated;
  }, []);

  const deleteExperience = useCallback(async (experienceId: string) => {
    await deleteCandidateExperience(experienceId);
    setExperiences((prev) => prev.filter((item) => item.id !== experienceId));
  }, []);

  return { experiences, loading, error, createExperience, updateExperience, deleteExperience, refetch: fetchExperiences };
}
