import { supabase } from "@/integrations/supabase/client";
import type { LocalGuideRecord } from "./types";

const TABLE_NAME = "local_guides";
const IMAGE_BUCKET = "guides-images";
const DOCUMENT_BUCKET = "guide-documents";

export async function fetchLocalGuides(options?: { visibleOnly?: boolean }): Promise<LocalGuideRecord[]> {
  let query = supabase.from(TABLE_NAME).select("*").order("created_at", { ascending: false });
  if (options?.visibleOnly) {
    query = query.eq("visible", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as LocalGuideRecord[];
}

export async function createLocalGuide(input: {
  title: string;
  slug: string;
  category: string;
  description: string;
  imageFile?: File | null;
  documentFile: File;
}): Promise<LocalGuideRecord> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Vous devez être connecté pour créer une fiche.");

  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("is_active", true);

  if (roleError) throw roleError;
  const roles = (roleData ?? []).map((row: any) => (row.role as string ?? "").toLowerCase());
  const hasAdminRole = roles.some((role) => role === "admin" || role === "super_admin");

  if (!hasAdminRole) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    const fallbackRole = profileData?.role?.toLowerCase();
    if (fallbackRole !== "admin" && fallbackRole !== "super_admin") {
      throw new Error("Vous n'avez pas les droits suffisants pour créer une fiche.");
    }
  }

  let imageUrl: string | null = null;

  if (input.imageFile) {
    const imagePath = `${Date.now()}-${input.imageFile.name}`;
    const { error: imageUploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(imagePath, input.imageFile, { upsert: true });

    if (imageUploadError) throw imageUploadError;

    const { data: imagePublicData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(imagePath);
    imageUrl = imagePublicData.publicUrl;
  }

  const documentPath = `${Date.now()}-${input.documentFile.name}`;
  const { error: documentUploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(documentPath, input.documentFile, { upsert: true });

  if (documentUploadError) throw documentUploadError;

  const { data: documentPublicData } = supabase.storage.from(DOCUMENT_BUCKET).getPublicUrl(documentPath);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      title: input.title,
      slug: input.slug,
      category: input.category,
      description: input.description,
      image_url: imageUrl,
      document_url: documentPublicData.publicUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LocalGuideRecord;
}

export async function updateLocalGuide(
  id: string,
  input: {
    title: string;
    slug: string;
    category: string;
    description: string;
    visible: boolean;
    imageFile?: File | null;
    documentFile?: File | null;
  },
): Promise<LocalGuideRecord> {
  const updates: Partial<LocalGuideRecord> = {
    title: input.title,
    slug: input.slug,
    category: input.category,
    description: input.description,
    visible: input.visible,
  };

  if (input.imageFile) {
    const imagePath = `${Date.now()}-${input.imageFile.name}`;
    const { error: imageUploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(imagePath, input.imageFile, { upsert: true });

    if (imageUploadError) throw imageUploadError;

    const { data: imagePublicData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(imagePath);
    updates.image_url = imagePublicData.publicUrl;
  }

  if (input.documentFile) {
    const documentPath = `${Date.now()}-${input.documentFile.name}`;
    const { error: documentUploadError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .upload(documentPath, input.documentFile, { upsert: true });

    if (documentUploadError) throw documentUploadError;

    const { data: documentPublicData } = supabase.storage.from(DOCUMENT_BUCKET).getPublicUrl(documentPath);
    updates.document_url = documentPublicData.publicUrl;
  }

  const { data, error } = await supabase.from(TABLE_NAME).update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as LocalGuideRecord;
}

export async function toggleLocalGuideVisibility(id: string, visible: boolean): Promise<LocalGuideRecord> {
  const { data, error } = await supabase.from(TABLE_NAME).update({ visible }).eq("id", id).select().single();
  if (error) throw error;
  return data as LocalGuideRecord;
}

export async function deleteLocalGuide(id: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Vous devez être connecté pour supprimer une fiche.");

  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("is_active", true);

  if (roleError) throw roleError;
  const roles = (roleData ?? []).map((row: any) => (row.role as string ?? "").toLowerCase());
  const hasAdminRole = roles.some((role) => role === "admin" || role === "super_admin");

  if (!hasAdminRole) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    const fallbackRole = profileData?.role?.toLowerCase();
    if (fallbackRole !== "admin" && fallbackRole !== "super_admin") {
      throw new Error("Vous n'avez pas les droits suffisants pour supprimer une fiche.");
    }
  }

  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
}
