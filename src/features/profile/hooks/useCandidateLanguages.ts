import { useCallback, useEffect, useState } from "react";
import type { CandidateLanguage } from "@/features/candidates/api/types";
import { profileService } from "../services/profileService";

export function useCandidateLanguages(candidateId?: string | null) {
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getLanguages(candidateId);
      setLanguages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les langues.");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    void fetchLanguages();
  }, [fetchLanguages]);

  const createLanguage = useCallback(async (language: Parameters<typeof profileService.createLanguage>[1]) => {
    if (!candidateId) throw new Error("Profil non chargé.");
    const created = await profileService.createLanguage(candidateId, language);
    setLanguages((prev) => [created, ...prev]);
    return created;
  }, [candidateId]);

  const updateLanguage = useCallback(async (languageId: string, language: Parameters<typeof profileService.updateLanguage>[1]) => {
    const updated = await profileService.updateLanguage(languageId, language);
    setLanguages((prev) => prev.map((item) => (item.id === languageId ? updated : item)));
    return updated;
  }, []);

  const deleteLanguage = useCallback(async (languageId: string) => {
    await profileService.deleteLanguage(languageId);
    setLanguages((prev) => prev.filter((item) => item.id !== languageId));
  }, []);

  return { languages, loading, error, createLanguage, updateLanguage, deleteLanguage, refetch: fetchLanguages };
}
