import { supabase } from "@/integrations/supabase/client";
import { generateJobEmbeddingVector } from "@/services/aiMatchingService";
import type { JobOffer, JobOfferFilters, JobOfferInsert, JobOfferUpdate } from "@/features/jobs/types";

const DEFAULT_ORDER_BY = "publish_at" as const;
const JOB_LIST_SELECT = "id, slug, title, company, contract_type, location_city, location_country, salary, description, publish_at, deadline, expires_at, status, cover_image";

export const jobService = {
  async getPublishedOffers(limit = 10, offset = 0): Promise<JobOffer[]> {
    const now = new Date().toISOString();
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const start = Math.max(0, offset);
    const end = start + safeLimit - 1;

    const { data, error } = await supabase
      .from("job_offers")
      .select(JOB_LIST_SELECT)
      .eq("status", "published")
      .order(DEFAULT_ORDER_BY, { ascending: false })
      .range(start, end)
      .limit(safeLimit);

    if (error) {
      throw error;
    }

    const offers = (data ?? []) as JobOffer[];
    return offers.filter((offer) => !offer.publish_at || offer.publish_at <= now);
  },

  async getOfferBySlug(slug: string): Promise<JobOffer | null> {
    const { data, error } = await supabase
      .from("job_offers")
      .select(
        "id, slug, title, company, company_logo, contract_type, location_city, location_country, description, requirements, status, publish_at, expires_at, application_email, application_whatsapp, external_link, cover_image, meta_title, meta_description, og_image, updated_at, salary, deadline, tags",
      )
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.details?.includes("No rows found")) {
        return null;
      }
      throw error;
    }

    return data as JobOffer | null;
  },

  async searchOffers(filters: JobOfferFilters = {}): Promise<JobOffer[]> {
    let query = supabase.from("job_offers").select(JOB_LIST_SELECT);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.query) {
      const searchValue = `%${filters.query}%`;
      query = query.or(
        `title.ilike.${searchValue},company.ilike.${searchValue},description.ilike.${searchValue},requirements.ilike.${searchValue}`,
      );
    }

    if (filters.company) {
      query = query.ilike("company", `%${filters.company}%`);
    }

    if (filters.location) {
      const locationValue = `%${filters.location}%`;
      query = query.or(
        `location_city.ilike.${locationValue},location_country.ilike.${locationValue}`,
      );
    }

    if (filters.contractType) {
      query = query.eq("contract_type", filters.contractType);
    }

    const orderBy = filters.orderBy ?? DEFAULT_ORDER_BY;
    const order = filters.order !== "asc";
    query = query.order(orderBy, { ascending: !order });

    const resolvedLimit = typeof filters.limit === "number" ? Math.max(1, Math.min(filters.limit, 50)) : 10;
    const start = typeof filters.offset === "number" ? Math.max(0, filters.offset) : 0;
    const end = start + resolvedLimit - 1;

    query = query.range(start, end).limit(resolvedLimit);

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return (data ?? []) as JobOffer[];
  },

  async createOffer(data: JobOfferInsert): Promise<JobOffer> {
    const payloadBase: JobOfferInsert = {
      ...data,
      embedding_vector: generateJobEmbeddingVector({
        title: data.title,
        company: data.company ?? null,
        description: data.description ?? null,
        requirements: data.requirements ?? null,
        location_city: data.location_city ?? null,
        contract_type: data.contract_type ?? null,
      }),
    };

    if (import.meta.env.DEV) {
      console.log("[jobsApi] Embedding généré pour la création de l'offre");
    }

    // Try insert and on unique conflict (409) retry with a modified slug suffix
    const maxAttempts = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      const payload = attempt === 0 ? payloadBase : { ...payloadBase, slug: `${data.slug}-${Date.now().toString().slice(-6)}` };
      const { data: result, error } = await supabase.from("job_offers").insert([payload]).select(JOB_LIST_SELECT).single();

      if (!error) {
        return result as JobOffer;
      }

      lastError = error;

      if ((error as any).status === 409 || /duplicate key|unique constraint|already exists/i.test(error.message || "")) {
        // try again with a new slug
        attempt += 1;
        continue;
      }

      // Non-conflict error -> stop immediately
      throw new Error(error.message || "Erreur lors de la création de l'offre.");
    }

    // If we exhausted attempts, throw a friendly conflict message or the last error message
    if (lastError) {
      throw new Error("Conflit lors de la création : le slug est déjà utilisé. Réessayez avec un titre différent.");
    }

    // Fallback
    throw new Error("Erreur lors de la création de l'offre.");
  },

  async updateOffer(id: string, data: JobOfferUpdate): Promise<JobOffer> {
    const updateFields = ["title", "description", "requirements", "location_city", "company", "contract_type"] as const;
    let updatePayload: JobOfferUpdate = data;

    const shouldRecomputeEmbedding = updateFields.some((field) => Object.prototype.hasOwnProperty.call(data, field));

    if (shouldRecomputeEmbedding) {
      const { data: existing, error: existingError } = await supabase
        .from("job_offers")
        .select("title, company, description, requirements, location_city, contract_type")
        .eq("id", id)
        .single();

      if (existingError) {
        throw new Error(existingError.message || "Impossible de récupérer l'offre existante pour recalculer l'embedding.");
      }

      if (!existing) {
        throw new Error("Offre introuvable pour le recalcul de l'embedding.");
      }

      const merged = {
        title: data.title ?? existing.title,
        company: data.company ?? existing.company,
        description: data.description ?? existing.description,
        requirements: data.requirements ?? existing.requirements,
        location_city: data.location_city ?? existing.location_city,
        contract_type: data.contract_type ?? existing.contract_type,
      };

      updatePayload = {
        ...data,
        embedding_vector: generateJobEmbeddingVector(merged),
      };

      if (import.meta.env.DEV) {
        console.log("[jobsApi] Embedding généré pour la modification de l'offre");
      }
    }

    const { data: result, error } = await supabase.from("job_offers").update(updatePayload).eq("id", id).select(JOB_LIST_SELECT).single();

    if (error) {
      if ((error as any).status === 409 || /duplicate key|unique constraint|already exists/i.test(error.message || "")) {
        throw new Error("Conflit lors de la mise à jour : un enregistrement similaire existe déjà (vérifiez le slug).");
      }
      throw new Error(error.message || "Erreur lors de la mise à jour de l'offre.");
    }

    return result as JobOffer;
  },

  async deleteOffer(id: string): Promise<void> {
    const { error } = await supabase.from("job_offers").delete().eq("id", id);
    if (error) {
      throw error;
    }
  },

  async getOffersCount(): Promise<number> {
    const { count, error } = await supabase.from("job_offers").select("id", { count: "exact", head: true });

    if (error) {
      throw error;
    }

    return count ?? 0;
  },
};

export const jobsApi = jobService;
