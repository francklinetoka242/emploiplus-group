import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ImportedJobOffer = {
  title: string | null;
  company: string | null;
  location_city: string | null;
  location_country: string | null;
  contract_type: Database["public"]["Enums"]["contract_type"] | null;
  salary: string | null;
  application_email: string | null;
  application_whatsapp: string | null;
  external_link: string | null;
  deadline: string | null;
  description: string | null;
  requirements: string | null;
  tags: string[];
  seo_description: string | null;
  a_verifier: string[];
};

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const CONTRACT_TYPES: Database["public"]["Enums"]["contract_type"][] = [
  "cdi",
  "cdd",
  "stage",
  "freelance",
  "prestation_de_services",
  "consultance",
  "temps_partiel",
  "interim",
];

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    let maxSide = 2000;
    let quality = 0.85;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Impossible de préparer cette image.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
      if (!base64) throw new Error("Impossible de préparer cette image.");
      if (base64.length <= 4_000_000) {
        return { base64, mediaType: "image/jpeg" as const };
      }

      if (quality > 0.5) {
        quality = Math.max(0.45, quality - 0.1);
      } else if (maxSide > 640) {
        maxSide = Math.max(640, Math.round(maxSide * 0.8));
        quality = 0.75;
      } else {
        break;
      }
    }

    throw new Error("Impossible de réduire suffisamment la taille de cette image.");
  } finally {
    bitmap.close();
  }
}

function isValidDeadline(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isImportedJobOffer(value: unknown): value is ImportedJobOffer {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const offer = value as Record<string, unknown>;
  const nullableStrings = [
    "title",
    "company",
    "location_city",
    "location_country",
    "salary",
    "application_email",
    "application_whatsapp",
    "external_link",
    "description",
    "requirements",
    "seo_description",
  ];

  return (
    nullableStrings.every((key) => offer[key] === null || typeof offer[key] === "string") &&
    (offer.contract_type === null ||
      (typeof offer.contract_type === "string" &&
        CONTRACT_TYPES.includes(
          offer.contract_type as Database["public"]["Enums"]["contract_type"],
        ))) &&
    (offer.deadline === null ||
      (typeof offer.deadline === "string" && isValidDeadline(offer.deadline))) &&
    Array.isArray(offer.tags) &&
    offer.tags.every((tag) => typeof tag === "string") &&
    Array.isArray(offer.a_verifier) &&
    offer.a_verifier.every((item) => typeof item === "string")
  );
}

export async function extractJobOfferFromImage(file: File): Promise<ImportedJobOffer> {
  if (!MEDIA_TYPES.includes(file.type as (typeof MEDIA_TYPES)[number])) {
    throw new Error("Veuillez choisir une image JPEG, PNG, WEBP ou GIF.");
  }

  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("Session expirée, reconnectez-vous.");

  const { base64, mediaType } = await compressImage(file);
  let response: Response;
  try {
    response = await fetch("/api/extract-job-offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageBase64: base64, mediaType }),
    });
  } catch {
    throw new Error(
      "Impossible de contacter le serveur d'import. Vérifiez la connexion puis réessayez.",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Réponse serveur illisible.");
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Échec de la lecture de l'offre.";
    throw new Error(message);
  }

  if (!isImportedJobOffer(payload)) {
    throw new Error("La réponse ne contient pas une offre exploitable.");
  }

  return payload;
}
