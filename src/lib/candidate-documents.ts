export interface CandidateCVState {
  id: string;
  name: string;
  displayName: string;
  date: string;
  size?: string;
  url: string;
}

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

export interface CandidateDocumentsState {
  cv?: CandidateCVState | null;
  documents?: CandidateDocument[];
}

export function getCandidateDocumentsStorageKey(profileId?: string | null) {
  return profileId ? `emploiplus-candidate-documents-${profileId}` : null;
}

export function loadCandidateDocuments(profileId?: string | null): CandidateDocumentsState {
  const storageKey = getCandidateDocumentsStorageKey(profileId);
  if (!storageKey) {
    return { cv: null, documents: [] };
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return { cv: null, documents: [] };
    }

    const parsed = JSON.parse(raw) as Partial<CandidateDocumentsState>;
    return {
      cv: parsed.cv ?? null,
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
    };
  } catch (error) {
    console.error("Unable to restore candidate documents", error);
    return { cv: null, documents: [] };
  }
}

export function saveCandidateDocuments(profileId: string | null | undefined, value: CandidateDocumentsState) {
  const storageKey = getCandidateDocumentsStorageKey(profileId);
  if (!storageKey) {
    return;
  }

  localStorage.setItem(
    storageKey,
    JSON.stringify({
      cv: value.cv ?? null,
      documents: value.documents ?? [],
    }),
  );
}
