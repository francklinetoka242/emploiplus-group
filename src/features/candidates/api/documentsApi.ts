import { supabase } from "@/integrations/supabase/client";
import { CANDIDATE_DOCUMENTS_BUCKET, uploadFileToStorage } from "@/services/storageService";
import { processCandidateCvUpload, updateCandidateCvText, clearCandidateCvText } from "@/services/aiMatchingService";

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

export interface CandidateDocumentsState {
  cv: CandidateCVState | null;
  documents: CandidateDocument[];
}

export function getCandidateDocumentsList(state: CandidateDocumentsState): CandidateDocument[] {
  const documents = state.documents ?? [];
  if (!state.cv) return documents;

  return [
    {
      ...state.cv,
      type: "cv",
      customType: "Mon CV",
    } as unknown as CandidateDocument,
    ...documents,
  ];
}

function toCvStateFromServer(candidateId: string, candidate: { cv_url?: string | null; cv_last_updated_at?: string | null } | null): CandidateCVState | null {
  if (!candidate?.cv_url) {
    return null;
  }

  return {
    id: `cv-server-${candidateId}`,
    name: "CV",
    displayName: "Mon CV",
    date: candidate.cv_last_updated_at ?? new Date().toISOString(),
    size: "",
    url: candidate.cv_url,
  };
}

async function resolveStorageUrl(path: string) {
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage
    .from(CANDIDATE_DOCUMENTS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return path;
  return data.signedUrl;
}

async function toDocumentState(row: {
  id: string;
  type: string;
  name: string;
  display_name: string;
  storage_path: string;
  size_bytes: number | null;
  custom_type: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    type: row.type as CandidateDocument["type"],
    name: row.name,
    displayName: row.display_name,
    date: row.created_at,
    size: row.size_bytes == null ? undefined : String(row.size_bytes),
    url: await resolveStorageUrl(row.storage_path),
    customType: row.custom_type ?? undefined,
  } satisfies CandidateDocument;
}

export async function getCandidateDocuments(candidateId: string) {
  const [{ data: profile, error: profileError }, { data: rows, error: documentsError }] = await Promise.all([
    supabase.from("candidates").select("cv_url, cv_last_updated_at").eq("id", candidateId).maybeSingle(),
    supabase.from("candidate_documents").select("id, type, name, display_name, storage_path, size_bytes, custom_type, created_at").eq("candidate_id", candidateId).order("created_at", { ascending: false }),
  ]);

  if (profileError) throw profileError;
  if (documentsError) throw documentsError;

  return {
    cv: toCvStateFromServer(candidateId, profile),
    documents: await Promise.all((rows ?? []).map(toDocumentState)),
  };
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

  try {
    // Pass the internal storage path to the server so it can regenerate signed URLs later
    const extraction = await processCandidateCvUpload(candidateId, file, path ?? url);
    if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
      window.dispatchEvent(new CustomEvent("cv-uploaded", { detail: { candidateId, cvUrl: newCv.url } }));
    }

    return { cv: newCv, extraction } as { cv: CandidateCVState; extraction: unknown };
  } catch (err) {
    console.warn("CV uploaded but extraction failed", err);
    // Ensure the uploaded CV path or URL is persisted in Supabase even if extraction fails
    try {
      await updateCandidateCvText(candidateId, "", path ?? newCv.url);
      if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
        window.dispatchEvent(new CustomEvent("cv-uploaded", { detail: { candidateId, cvUrl: newCv.url } }));
      }
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
  const { path } = await uploadFileToStorage(file, `candidates/${candidateId}/documents`, CANDIDATE_DOCUMENTS_BUCKET, true);
  const { data, error } = await supabase
    .from("candidate_documents")
    .insert({
      candidate_id: candidateId,
      type,
      name: file.name,
      display_name: type === "other" && customType?.trim() ? customType.trim() : file.name,
      storage_path: path,
      size_bytes: file.size,
      custom_type: type === "other" ? customType?.trim() || null : null,
    })
    .select("id, type, name, display_name, storage_path, size_bytes, custom_type, created_at")
    .single();
  if (error) throw error;
  return toDocumentState(data);
}

export async function deleteCandidateDocument(candidateId: string, documentId: string) {
  const { data: document, error: fetchError } = await supabase
    .from("candidate_documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("candidate_id", candidateId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!document) return (await getCandidateDocuments(candidateId)).documents;

  const { error: deleteError } = await supabase
    .from("candidate_documents")
    .delete()
    .eq("id", documentId)
    .eq("candidate_id", candidateId);
  if (deleteError) throw deleteError;

  const { error: storageError } = await supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).remove([document.storage_path]);
  if (storageError) console.warn("Unable to remove candidate document from Storage", storageError.message);
  return (await getCandidateDocuments(candidateId)).documents;
}

export async function deleteCandidateCV(candidateId: string) {
  try {
    await clearCandidateCvText(candidateId);
    await supabase.from("candidates").update({ cv_url: null, cv_last_updated_at: null }).eq("id", candidateId);
  } catch (error) {
    console.warn("[documentsApi] unable to clear CV in Supabase", error);
  }
  return null;
}
