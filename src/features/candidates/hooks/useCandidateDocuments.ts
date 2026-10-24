import { useEffect, useState } from "react";
import {
  getCandidateDocuments,
  resolveCandidateDocumentUrl,
  type CandidateCVState,
  type CandidateDocument,
} from "@/features/candidates/api/documentsApi";
export type { CandidateCVState, CandidateDocument } from "@/features/candidates/api/documentsApi";

export function useCandidateDocuments(profileId?: string | null, serverCvUrl?: string | null) {
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
        const cv =
          result.cv ??
          (serverCvUrl
            ? {
                id: `cv-server-${profileId}`,
                name: "CV",
                displayName: "Mon CV",
                date: new Date().toISOString(),
                size: "",
                url: await resolveCandidateDocumentUrl(serverCvUrl),
              }
            : null);

        if (!isMounted) return;
        setCv(cv);
        setDocuments(result.documents);
      } catch (error) {
        console.error("Unable to restore candidate documents", error);
        if (isMounted) {
          if (serverCvUrl) {
            try {
              const fallbackCv = {
                id: `cv-server-${profileId}`,
                name: "CV",
                displayName: "Mon CV",
                date: new Date().toISOString(),
                size: "",
                url: await resolveCandidateDocumentUrl(serverCvUrl),
              };
              if (isMounted) setCv(fallbackCv);
            } catch (cvError) {
              console.error("Unable to restore candidate CV", cvError);
              if (isMounted) setCv(null);
            }
          } else {
            setCv(null);
          }
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
  }, [profileId, serverCvUrl]);

  return { cv, documents, setCv, setDocuments, loading, addDocument, deleteDocument };
}
