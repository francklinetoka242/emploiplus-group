import { useCallback, useEffect, useState } from "react";
import type { CandidateSkill } from "@/features/candidates/api/types";
import { profileService } from "../services/profileService";

export function useCandidateSkills(candidateId?: string | null) {
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getSkills(candidateId);
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les compétences.");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  const createSkill = useCallback(async (skill: Parameters<typeof profileService.createSkill>[1]) => {
    if (!candidateId) throw new Error("Profil non chargé.");
    const created = await profileService.createSkill(candidateId, skill);
    setSkills((prev) => [created, ...prev]);
    return created;
  }, [candidateId]);

  const deleteSkill = useCallback(async (skillId: string) => {
    await profileService.deleteSkill(skillId);
    setSkills((prev) => prev.filter((item) => item.id !== skillId));
  }, []);

  return { skills, loading, error, createSkill, deleteSkill, refetch: fetchSkills };
}
