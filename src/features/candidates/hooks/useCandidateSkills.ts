import { useCallback, useEffect, useState } from "react";
import type { CandidateSkill, CandidateSkillInsert } from "@/features/candidates/api/types";
import {
  createCandidateSkill,
  deleteCandidateSkill,
  getCandidateSkills,
  updateCandidateSkill,
} from "@/features/candidates/api/skillsApi";

export function useCandidateSkills(candidateId?: string | null) {
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCandidateSkills(candidateId);
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

  const createSkill = useCallback(async (skill: CandidateSkillInsert) => {
    if (!candidateId) throw new Error("Profil non chargé.");
    const created = await createCandidateSkill(candidateId, skill);
    setSkills((prev) => [created, ...prev]);
    return created;
  }, [candidateId]);

  const deleteSkill = useCallback(async (skillId: string) => {
    await deleteCandidateSkill(skillId);
    setSkills((prev) => prev.filter((item) => item.id !== skillId));
  }, []);

  return { skills, loading, error, createSkill, deleteSkill, refetch: fetchSkills };
}
