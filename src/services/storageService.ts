import { supabase } from "@/integrations/supabase/client";

export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "public";
export const OFFER_IMAGES_BUCKET = import.meta.env.VITE_SUPABASE_OFFRES_BUCKET || STORAGE_BUCKET;
export const BLOG_IMAGES_BUCKET = import.meta.env.VITE_SUPABASE_BLOG_BUCKET || STORAGE_BUCKET;
export const CANDIDATE_DOCUMENTS_BUCKET =
  import.meta.env.VITE_SUPABASE_CANDIDATE_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  "public";
export const MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"];
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function normalizeBucketName(bucketName?: string) {
  const raw = (bucketName || STORAGE_BUCKET || "public").trim();
  return raw.replace(/^\/+|\/+$/g, "");
}

function getBucketCandidates(primaryBucket: string) {
  return [primaryBucket, STORAGE_BUCKET, "public", "storage"].filter((bucket, index, buckets) => {
    const normalizedBucket = normalizeBucketName(bucket);
    return (
      Boolean(normalizedBucket) &&
      buckets.findIndex((candidate) => normalizeBucketName(candidate) === normalizedBucket) === index
    );
  });
}

async function resolveStorageUrl(bucket: string, filename: string, forceSignedUrl = false) {
  if (!forceSignedUrl) {
    // Prefer a non-expiring public URL when available (public buckets).
    try {
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename);
      if (publicData?.publicUrl) {
        return publicData.publicUrl;
      }
    } catch (err) {
      // ignore and fallback to signed URL
    }
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filename, 60 * 60);

  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  return null;
}

async function uploadValidatedFileToStorage(
  file: File,
  folder: string,
  bucketName = STORAGE_BUCKET,
  forceSignedUrl = false,
  allowedMimeTypes: string[] = ALLOWED_DOCUMENT_MIME_TYPES,
  maxSizeBytes = MAX_DOCUMENT_SIZE_BYTES,
) {
  const extension = file.name.split(".").pop() || "bin";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(
      allowedMimeTypes === ALLOWED_DOCUMENT_MIME_TYPES
        ? "Seuls les fichiers PDF sont acceptés."
        : "Seules les images JPG, PNG, WEBP ou GIF sont acceptées.",
    );
  }

  if (file.size > maxSizeBytes) {
    throw new Error(
      maxSizeBytes === MAX_DOCUMENT_SIZE_BYTES
        ? "Le fichier dépasse la limite de 2 Mo."
        : "L’image dépasse la limite de 8 Mo.",
    );
  }

  const bucketCandidates = getBucketCandidates(bucketName);
  let lastError: Error | null = null;

  for (const bucket of bucketCandidates) {
    const { error } = await supabase.storage.from(bucket).upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

    if (!error) {
      const resolvedUrl = await resolveStorageUrl(bucket, filename, forceSignedUrl);
      if (resolvedUrl) {
        return { url: resolvedUrl, path: filename };
      }

      throw new Error(
        "Le fichier a été téléchargé mais l’URL de consultation n’a pas pu être générée.",
      );
    }

    lastError = new Error(error.message);
  }

  const projectUrl = import.meta.env.VITE_SUPABASE_URL || "(inconnu)";
  const triedBuckets = bucketCandidates.join(", ");

  throw new Error(
    lastError?.message ||
      `Impossible d’uploader le fichier — aucun bucket Supabase disponible pour ${bucketName}. Vérifiez que le bucket existe bien dans le projet Supabase ${projectUrl} et que son nom correspond exactement à l’un des suivants : ${triedBuckets}.`,
  );
}

export function uploadFileToStorage(
  file: File,
  folder: string,
  bucketName = STORAGE_BUCKET,
  forceSignedUrl = false,
) {
  return uploadValidatedFileToStorage(
    file,
    folder,
    bucketName,
    forceSignedUrl,
    ALLOWED_DOCUMENT_MIME_TYPES,
    MAX_DOCUMENT_SIZE_BYTES,
  );
}

export function uploadImageToStorage(file: File, folder: string, bucketName = STORAGE_BUCKET) {
  return uploadValidatedFileToStorage(
    file,
    folder,
    bucketName,
    false,
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_IMAGE_SIZE_BYTES,
  );
}
