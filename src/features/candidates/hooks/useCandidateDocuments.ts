import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    setHasRestoredDocuments(false);
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;

    let isMounted = true;

    const hydrateFromServer = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from("candidates")
          .select("cv_url, cv_last_updated_at")
          .eq("id", profileId)
          .maybeSingle();

        const serverCv = data?.cv_url
          ? {
              id: `cv-server-${profileId}`,
              name: "CV",
              displayName: "Mon CV",
              date: data.cv_last_updated_at ?? new Date().toISOString(),
              size: "",
              url: data.cv_url,
            }
          : null;

        const raw = localStorage.getItem(`emploiplus-candidate-documents-${profileId}`);
        const parsed = raw ? (JSON.parse(raw) as { cv?: CandidateCVState; documents?: CandidateDocument[] }) : null;

        if (!isMounted) return;
        setCv(serverCv ?? parsed?.cv ?? null);
        setDocuments(parsed?.documents ?? []);
      } catch (error) {
        console.error("Unable to restore candidate documents", error);
        if (isMounted) {
          setCv(null);
          setDocuments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setHasRestoredDocuments(true);
        }
      }
    };

    void hydrateFromServer();
    return () => {
      isMounted = false;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileId || !hasRestoredDocuments) return;
    localStorage.setItem(`emploiplus-candidate-documents-${profileId}`, JSON.stringify({ cv, documents }));
    if (cv?.url) {
      void supabase
        .from("candidates")
        .update({ cv_url: cv.url, cv_last_updated_at: new Date().toISOString() })
        .eq("id", profileId);
    }
  }, [profileId, cv, documents, hasRestoredDocuments]);

  return { cv, documents, setCv, setDocuments, loading, addDocument, deleteDocument };
}
