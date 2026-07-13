import { useCallback, useEffect, useState } from "react";
import {
  getCandidateDocumentsList,
  loadCandidateDocuments,
  saveCandidateDocuments,
  type CandidateCVState,
  type CandidateDocument,
} from "@/lib/candidate-documents";

export function useCandidateDocuments(profileId?: string | null) {
  const [cv, setCv] = useState<CandidateCVState | null>(null);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(false);

  // Load documents from storage
  useEffect(() => {
    if (!profileId) return;

    try {
      setLoading(true);
      const state = loadCandidateDocuments(profileId);
      setCv(state.cv ?? null);
      setDocuments(state.documents ?? []);
    } catch (error) {
      console.error("Unable to load candidate documents", error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // Save documents to storage whenever they change
  useEffect(() => {
    if (!profileId) return;

    saveCandidateDocuments(profileId, {
      cv,
      documents,
    });
  }, [profileId, cv, documents]);

  const deleteDocument = useCallback((id: string) => {
    // If deleting CV
    if (cv?.id === id) {
      setCv(null);
    } else {
      // Delete from documents array
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    }
  }, [cv]);

  const addDocument = useCallback((doc: CandidateDocument | CandidateCVState, isCV = false) => {
    if (isCV) {
      setCv(doc as CandidateCVState);
    } else {
      setDocuments((prev) => [doc as CandidateDocument, ...prev]);
    }
  }, []);

  return {
    cv,
    documents,
    loading,
    allDocuments: getCandidateDocumentsList({ cv, documents }),
    deleteDocument,
    addDocument,
    setCv,
    setDocuments,
  };
}
