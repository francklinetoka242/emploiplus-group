import { CANDIDATE_DOCUMENTS_BUCKET, uploadFileToStorage } from "@/services/storageService";

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
  const raw = localStorage.getItem(`emploiplus-candidate-documents-${candidateId}`);
  if (!raw) {
    return { cv: null as CandidateCVState | null, documents: [] as CandidateDocument[] };
  }

  const parsed = JSON.parse(raw) as { cv?: CandidateCVState; documents?: CandidateDocument[] };
  return { cv: parsed.cv ?? null, documents: parsed.documents ?? [] };
}

export async function saveCandidateDocuments(candidateId: string, payload: { cv: CandidateCVState | null; documents: CandidateDocument[] }) {
  localStorage.setItem(`emploiplus-candidate-documents-${candidateId}`, JSON.stringify(payload));
  return payload;
}

export async function uploadCandidateCV(candidateId: string, file: File) {
  return uploadFileToStorage(file, `candidates/${candidateId}/cv`, CANDIDATE_DOCUMENTS_BUCKET);
}

export async function uploadCandidateDocument(candidateId: string, file: File, type: CandidateDocument["type"], customType?: string) {
  const url = await uploadFileToStorage(file, `candidates/${candidateId}/documents`, CANDIDATE_DOCUMENTS_BUCKET);
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
