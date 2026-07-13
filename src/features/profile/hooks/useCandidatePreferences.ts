import { useCallback, useEffect, useState } from "react";
import type { CandidatePreferences, CandidatePreferencesInsert } from "@/features/candidates/api/types";
import { profileService } from "../services/profileService";

export function useCandidatePreferences(candidateId?: string | null) {
  const [preferences, setPreferences] = useState<CandidatePreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getPreferences(candidateId);
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les préférences.");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    void fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = useCallback(async (values: CandidatePreferencesInsert) => {
    if (!candidateId) throw new Error("Profil non chargé.");
    const saved = await profileService.savePreferences(candidateId, values);
    setPreferences(saved);
    return saved;
  }, [candidateId]);

  return { preferences, loading, error, savePreferences, refetch: fetchPreferences };
}
