import { useCallback, useEffect, useState } from "react";
import type { CandidateExperience } from "@/features/candidates/api/types";
import { profileService } from "../services/profileService";

export function useCandidateExperiences(candidateId?: string | null) {
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getExperiences(candidateId);
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

  const createExperience = useCallback(async (experience: Parameters<typeof profileService.createExperience>[1]) => {
    if (!candidateId) throw new Error("Profil non chargé.");
    const created = await profileService.createExperience(candidateId, experience);
    setExperiences((prev) => [created, ...prev]);
    return created;
  }, [candidateId]);

  const updateExperience = useCallback(async (experienceId: string, experience: Parameters<typeof profileService.updateExperience>[1]) => {
    const updated = await profileService.updateExperience(experienceId, experience);
    setExperiences((prev) => prev.map((item) => (item.id === experienceId ? updated : item)));
    return updated;
  }, []);

  const deleteExperience = useCallback(async (experienceId: string) => {
    await profileService.deleteExperience(experienceId);
    setExperiences((prev) => prev.filter((item) => item.id !== experienceId));
  }, []);

  return { experiences, loading, error, createExperience, updateExperience, deleteExperience, refetch: fetchExperiences };
}
