import { useEffect, useState } from "react";

export interface CandidateDocument {
  id: string;
  type: "motivation" | "diploma" | "certificate" | "attestation" | "portfolio" | "other" | "recepisse";
  name: string;
  displayName: string;
  date: string;
  size?: string;
  url: string;
  customType?: string;
}

export interface CandidateCVState {
  id: string;
  name: string;
  displayName: string;
  date: string;
  size?: string;
  url: string;
}

export function useCandidateDocuments(profileId?: string | null) {
  const [cv, setCv] = useState<CandidateCVState | null>(null);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRestoredDocuments, setHasRestoredDocuments] = useState(false);

  useEffect(() => {
    setHasRestoredDocuments(false);
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;

    try {
      setLoading(true);
      const raw = localStorage.getItem(`emploiplus-candidate-documents-${profileId}`);
      if (!raw) {
        setCv(null);
        setDocuments([]);
        return;
      }

      const parsed = JSON.parse(raw) as { cv?: CandidateCVState; documents?: CandidateDocument[] };
      setCv(parsed.cv ?? null);
      setDocuments(parsed.documents ?? []);
    } catch (error) {
      console.error("Unable to restore candidate documents", error);
    } finally {
      setLoading(false);
      setHasRestoredDocuments(true);
    }
  }, [profileId]);

  useEffect(() => {
    if (!profileId || !hasRestoredDocuments) return;
    localStorage.setItem(`emploiplus-candidate-documents-${profileId}`, JSON.stringify({ cv, documents }));
  }, [profileId, cv, documents, hasRestoredDocuments]);

  return { cv, documents, setCv, setDocuments, loading };
}
