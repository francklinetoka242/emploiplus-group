import { supabase } from "@/integrations/supabase/client";
import type { JobOffer, JobOfferFilters, JobOfferInsert, JobOfferUpdate } from "@/features/jobs/types";

const DEFAULT_ORDER_BY = "publish_at" as const;

export const jobService = {
  async getPublishedOffers(limit = 10): Promise<JobOffer[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("job_offers")
      .select(
        "id, slug, title, company, contract_type, location_city, location_country, description, requirements, status, publish_at, salary, deadline, tags, application_email, application_whatsapp, external_link, cover_image",
      )
      .eq("status", "published")
      .order(DEFAULT_ORDER_BY, { ascending: false })
      .limit(limit);

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
    let query = supabase.from("job_offers").select("*");

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

    if (typeof filters.limit === "number") {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return (data ?? []) as JobOffer[];
  },

  async createOffer(data: JobOfferInsert): Promise<JobOffer> {
    const { data: result, error } = await supabase.from("job_offers").insert([data]).select("*").single();

    if (error) {
      throw error;
    }

    return result as JobOffer;
  },

  async updateOffer(id: string, data: JobOfferUpdate): Promise<JobOffer> {
    const { data: result, error } = await supabase.from("job_offers").update(data).eq("id", id).select("*").single();

    if (error) {
      throw error;
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
