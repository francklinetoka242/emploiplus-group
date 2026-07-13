import { useCallback, useEffect, useState } from "react";
import type { CandidateEducation, CandidateEducationInsert } from "@/features/candidates/api/types";
import {
  createCandidateEducation,
  deleteCandidateEducation,
  getCandidateEducations,
  updateCandidateEducation,
} from "@/features/candidates/api/educationApi";

export function useCandidateEducation(candidateId?: string | null) {
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEducations = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCandidateEducations(candidateId);
      setEducations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les formations.");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    void fetchEducations();
  }, [fetchEducations]);

  const createEducation = useCallback(async (education: CandidateEducationInsert) => {
    if (!candidateId) throw new Error("Profil non chargé.");
    const created = await createCandidateEducation(candidateId, education);
    setEducations((prev) => [created, ...prev]);
    return created;
  }, [candidateId]);

  const updateEducation = useCallback(async (educationId: string, education: CandidateEducationInsert) => {
    const updated = await updateCandidateEducation(educationId, education);
    setEducations((prev) => prev.map((item) => (item.id === educationId ? updated : item)));
    return updated;
  }, []);

  const deleteEducation = useCallback(async (educationId: string) => {
    await deleteCandidateEducation(educationId);
    setEducations((prev) => prev.filter((item) => item.id !== educationId));
  }, []);

  return { educations, loading, error, createEducation, updateEducation, deleteEducation, refetch: fetchEducations };
}
