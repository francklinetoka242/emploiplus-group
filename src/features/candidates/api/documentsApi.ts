import { CANDIDATE_DOCUMENTS_BUCKET, uploadFileToStorage } from "@/services/storageService";
import { processCandidateCvUpload, updateCandidateCvText } from "@/services/aiMatchingService";

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

export async function getCandidateDocuments(candidateId: string) {
  const storageKey = `emploiplus-candidate-documents-${candidateId}`;
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    console.debug("[documentsApi] getCandidateDocuments: no local storage entry", { candidateId, storageKey });
    return { cv: null as CandidateCVState | null, documents: [] as CandidateDocument[] };
  }

  try {
    const parsed = JSON.parse(raw) as { cv?: CandidateCVState; documents?: CandidateDocument[] };
    console.debug("[documentsApi] getCandidateDocuments: loaded local documents", {
      candidateId,
      storageKey,
      cv: parsed.cv,
      documents: parsed.documents,
    });
    return { cv: parsed.cv ?? null, documents: parsed.documents ?? [] };
  } catch (error) {
    console.error("[documentsApi] getCandidateDocuments: failed to parse local storage", { candidateId, storageKey, error });
    return { cv: null as CandidateCVState | null, documents: [] as CandidateDocument[] };
  }
}

export async function saveCandidateDocuments(candidateId: string, payload: { cv: CandidateCVState | null; documents: CandidateDocument[] }) {
  localStorage.setItem(`emploiplus-candidate-documents-${candidateId}`, JSON.stringify(payload));
  return payload;
}

export async function uploadCandidateCV(candidateId: string, file: File) {
  return uploadFileToStorage(file, `candidates/${candidateId}/cv`, CANDIDATE_DOCUMENTS_BUCKET, true);
}

export async function uploadAndProcessCandidateCV(candidateId: string, file: File) {
  const { url, path } = await uploadCandidateCV(candidateId, file);
  const newCv: CandidateCVState = {
    id: `cv-${Date.now()}`,
    name: file.name,
    displayName: file.name,
    date: new Date().toISOString(),
    size: file.size.toString(),
    url,
  };

  // Persist local client copy before dispatch so listeners can read it immediately
  try {
    const existing = await getCandidateDocuments(candidateId);
    await saveCandidateDocuments(candidateId, { cv: newCv, documents: existing.documents ?? [] });
  } catch (localErr) {
    // Non-fatal: continue even if local save fails
    console.debug("Failed to persist candidate documents locally before dispatch:", localErr);
  }

  try {
    // Pass the internal storage path to the server so it can regenerate signed URLs later
    const extraction = await processCandidateCvUpload(candidateId, file, path ?? url);

    // Émettre un événement global pour notifier l'application qu'un CV a été uploadé
    try {
      if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cv-uploaded", { detail: { candidateId, cvUrl: newCv.url }, bubbles: true })
        );
      }
    } catch (evErr) {
      console.debug("Failed to dispatch cv-uploaded event", evErr);
    }

    return { cv: newCv, extraction } as { cv: CandidateCVState; extraction: unknown };
  } catch (err) {
    console.warn("CV uploaded but extraction failed", err);
    // Ensure the uploaded CV path or URL is persisted in Supabase even if extraction fails
    try {
      await updateCandidateCvText(candidateId, "", path ?? newCv.url);
    } catch (dbErr) {
      console.debug("Failed to persist cv_url after extraction failure:", dbErr);
    }

    return { cv: newCv, extraction: null, error: err instanceof Error ? err.message : String(err) } as {
      cv: CandidateCVState;
      extraction: unknown | null;
      error?: string;
    };
  }
}

export async function uploadCandidateDocument(candidateId: string, file: File, type: CandidateDocument["type"], customType?: string) {
  const { url } = await uploadFileToStorage(file, `candidates/${candidateId}/documents`, CANDIDATE_DOCUMENTS_BUCKET, true);
  return {
    id: `doc-${Date.now()}`,
    type,
    name: file.name,
    displayName: type === "other" && customType?.trim() ? customType.trim() : file.name,
    date: new Date().toISOString(),
    size: file.size.toString(),
    url,
    customType: type === "other" ? customType?.trim() : undefined,
  } satisfies CandidateDocument;
}

export async function deleteCandidateDocument(candidateId: string, documentId: string) {
  const existing = await getCandidateDocuments(candidateId);
  const filtered = existing.documents.filter((document) => document.id !== documentId);
  await saveCandidateDocuments(candidateId, { cv: existing.cv, documents: filtered });
  return filtered;
}

export async function deleteCandidateCV(candidateId: string) {
  const existing = await getCandidateDocuments(candidateId);
  await saveCandidateDocuments(candidateId, { cv: null, documents: existing.documents });
  return null;
}
