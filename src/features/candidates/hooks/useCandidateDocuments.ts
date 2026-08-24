import { useEffect, useState } from "react";
import { getCandidateDocuments, type CandidateCVState, type CandidateDocument } from "@/features/candidates/api/documentsApi";
export type { CandidateCVState, CandidateDocument } from "@/features/candidates/api/documentsApi";

export function useCandidateDocuments(profileId?: string | null) {
  const [cv, setCv] = useState<CandidateCVState | null>(null);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const addDocument = (document: CandidateDocument | CandidateCVState, isCV = false) => {
    if (isCV) {
      setCv(document as CandidateCVState);
      return;
    }

    setDocuments((prev) => [document as CandidateDocument, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setCv((currentCv) => (currentCv && currentCv.id === id ? null : currentCv));
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  useEffect(() => {
    if (!profileId) return;

    let isMounted = true;

    const hydrateFromServer = async () => {
      try {
        setLoading(true);
        const result = await getCandidateDocuments(profileId);

        if (!isMounted) return;
        setCv(result.cv);
        setDocuments(result.documents);
      } catch (error) {
        console.error("Unable to restore candidate documents", error);
        if (isMounted) {
          setCv(null);
          setDocuments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void hydrateFromServer();
    return () => {
      isMounted = false;
    };
  }, [profileId]);

  return { cv, documents, setCv, setDocuments, loading, addDocument, deleteDocument };
}
