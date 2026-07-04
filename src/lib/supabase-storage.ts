import { supabase } from "@/integrations/supabase/client";

export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "public";
export const OFFER_IMAGES_BUCKET = import.meta.env.VITE_SUPABASE_OFFRES_BUCKET || STORAGE_BUCKET;
export const BLOG_IMAGES_BUCKET = import.meta.env.VITE_SUPABASE_BLOG_BUCKET || STORAGE_BUCKET;
export const CANDIDATE_DOCUMENTS_BUCKET = import.meta.env.VITE_SUPABASE_CANDIDATE_BUCKET || "candidat-doc";
export const MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"];

function normalizeBucketName(bucketName?: string) {
  const raw = (bucketName || STORAGE_BUCKET || "public").trim();
  return raw.replace(/^\/+|\/+$/g, "");
}

export async function uploadFileToStorage(file: File, folder: string, bucketName = STORAGE_BUCKET) {
  const extension = file.name.split(".").pop() || "pdf";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const bucket = normalizeBucketName(bucketName);

  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    throw new Error("Seuls les fichiers PDF sont acceptés.");
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("Le fichier dépasse la limite de 2 Mo.");
  }

  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (error) {
    const fallbackBucket = bucket === "public" ? "storage" : "public";
    const fallbackError = await supabase.storage.from(fallbackBucket).upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

    if (fallbackError.error) {
      throw new Error(
        fallbackError.error.message ||
          `Impossible d’uploader l’image — bucket Supabase introuvable: ${bucket}. Vérifiez VITE_SUPABASE_OFFRES_BUCKET, VITE_SUPABASE_BLOG_BUCKET ou VITE_SUPABASE_STORAGE_BUCKET.`,
      );
    }

    return fallbackError.data?.path ? fallbackBucket : "";
  }

  const { data, error: signedUrlError } = await supabase.storage.from(bucket).createSignedUrl(filename, 60 * 60);

  if (signedUrlError || !data?.signedUrl) {
    throw new Error("Impossible de générer une URL signée pour le fichier téléchargé.");
  }

  return data.signedUrl;
}
