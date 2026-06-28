import { supabase } from "@/integrations/supabase/client";

export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "public";
export const OFFER_IMAGES_BUCKET = import.meta.env.VITE_SUPABASE_OFFRES_BUCKET || STORAGE_BUCKET;
export const BLOG_IMAGES_BUCKET = import.meta.env.VITE_SUPABASE_BLOG_BUCKET || STORAGE_BUCKET;

export async function uploadFileToStorage(file: File, folder: string, bucketName = STORAGE_BUCKET) {
  const extension = file.name.split(".").pop() || "jpg";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const bucket = bucketName;

  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (error) {
    throw new Error(
      error.message ||
        `Impossible d’uploader l’image — bucket Supabase introuvable: ${bucket}. Vérifiez VITE_SUPABASE_OFFRES_BUCKET, VITE_SUPABASE_BLOG_BUCKET ou VITE_SUPABASE_STORAGE_BUCKET.`,
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);

  if (!data?.publicUrl) {
    throw new Error("Impossible de récupérer l’URL publique de l’image téléchargée.");
  }

  return data.publicUrl;
}
