/**
 * Analytics API
 * Queries sourced from the actual Supabase job_offers / job_applications schema.
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  ApplicationTrend,
  OfferAnalytics,
  CompanyAnalytics,
  ContractAnalytics,
  LocationAnalytics,
  ApplicationStatusAnalytics,
  AnalyticsFilter,
  ApplicationsDetail,
} from "../types/analytics";

const isoDate = (value: Date | null) => value?.toISOString() ?? null;

function applyDateFilters(
  query: any,
  filter: AnalyticsFilter,
  field: "applied_at" | "created_at" | "publish_at" = "applied_at",
) {
  let next = query;
  if (filter.dateFrom) next = next.gte(field, isoDate(filter.dateFrom));
  if (filter.dateTo) next = next.lte(field, isoDate(filter.dateTo));
  return next;
}

export async function getTotalApplications(filter: AnalyticsFilter): Promise<number> {
  let query = supabase.from("job_applications").select("id", { count: "exact", head: true });
  query = applyDateFilters(query, filter, "applied_at");
  if (filter.jobOfferId) query = query.eq("job_offer_id", filter.jobOfferId);
  if (filter.company) {
    query = query.in(
      "job_offer_id",
      (await supabase.from("job_offers").select("id").ilike("company", `%${filter.company}%`).then(({ data }) => (data ?? []).map((offer: any) => offer.id)))
    );
  }
  if (filter.applicationStatus) query = query.eq("status", filter.applicationStatus);
  if (filter.locationCountry) {
    query = query.in(
      "job_offer_id",
      (await supabase.from("job_offers").select("id").ilike("location_country", `%${filter.locationCountry}%`).then(({ data }) => (data ?? []).map((offer: any) => offer.id)))
    );
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getUniqueCandidates(filter: AnalyticsFilter): Promise<number> {
  let query = supabase.from("job_applications").select("candidate_id, applied_at");
  query = applyDateFilters(query, filter, "applied_at");
  if (filter.jobOfferId) query = query.eq("job_offer_id", filter.jobOfferId);
  if (filter.applicationStatus) query = query.eq("status", filter.applicationStatus);
  if (filter.locationCountry) {
    query = query.in(
      "job_offer_id",
      (await supabase.from("job_offers").select("id").ilike("location_country", `%${filter.locationCountry}%`).then(({ data }) => (data ?? []).map((offer: any) => offer.id)))
    );
  }
  const { data, error } = await query;
  if (error) throw error;

  const uniqueIds = new Set((data ?? []).map((row: any) => row.candidate_id).filter(Boolean));
  return uniqueIds.size;
}

export async function getApplicationsTrend(
  filter: AnalyticsFilter,
  groupBy: "day" | "week" | "month"
): Promise<ApplicationTrend[]> {
  let query = supabase.from("job_applications").select("candidate_id, applied_at");
  query = applyDateFilters(query, filter, "applied_at");
  if (filter.jobOfferId) query = query.eq("job_offer_id", filter.jobOfferId);
  if (filter.applicationStatus) query = query.eq("status", filter.applicationStatus);
  if (filter.locationCountry) {
    query = query.in(
      "job_offer_id",
      (await supabase.from("job_offers").select("id").ilike("location_country", `%${filter.locationCountry}%`).then(({ data }) => (data ?? []).map((offer: any) => offer.id)))
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const grouped = new Map<string, { applications: number; unique: Set<string> }>();

  for (const row of data ?? []) {
    const date = new Date(row.applied_at);
    let key = "";
    if (groupBy === "day") {
      key = date.toISOString().slice(0, 10);
    } else if (groupBy === "week") {
      const start = new Date(date);
      const day = start.getUTCDay();
      start.setUTCDate(start.getUTCDate() - day);
      key = start.toISOString().slice(0, 10);
    } else {
      key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    }

    if (!grouped.has(key)) grouped.set(key, { applications: 0, unique: new Set() });
    const bucket = grouped.get(key)!;
    bucket.applications += 1;
    if (row.candidate_id) bucket.unique.add(row.candidate_id);
  }

  return Array.from(grouped.entries())
    .map(([date, bucket]) => ({
      date,
      applications: bucket.applications,
      uniqueCandidates: bucket.unique.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getApplicationsByOffer(
  filter: AnalyticsFilter,
  limit: number = 100,
  offset: number = 0,
): Promise<{ data: OfferAnalytics[]; total: number }> {
  let query = supabase
    .from("job_offers")
    .select(
      `
      id,
      title,
      company,
      contract_type,
      location_city,
      publish_at,
      deadline,
      status,
      views_count,
      created_at,
      job_applications!job_offer_id(candidate_id, status, applied_at)
    `,
      { count: "exact" },
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter.company) query = query.ilike("company", `%${filter.company}%`);
  if (filter.contractType) query = query.eq("contract_type", filter.contractType);
  if (filter.locationCity) query = query.ilike("location_city", `%${filter.locationCity}%`);
  if (filter.locationCountry) query = query.ilike("location_country", `%${filter.locationCountry}%`);
  if (filter.jobOfferId) query = query.eq("id", filter.jobOfferId);

  const { data, count, error } = await query;
  if (error) throw error;

  const offers: OfferAnalytics[] = (data ?? []).map((offer: any) => {
    const applications = (offer.job_applications ?? []).filter((application: any) => {
      if (filter.dateFrom && application.applied_at && new Date(application.applied_at) < new Date(filter.dateFrom)) return false;
      if (filter.dateTo && application.applied_at && new Date(application.applied_at) > new Date(filter.dateTo)) return false;
      if (filter.applicationStatus && application.status !== filter.applicationStatus) return false;
      return true;
    });

    const candidateIds = new Set(
      (applications as any[])
        .map((application: any) => application.candidate_id)
        .filter(Boolean),
    );

    return {
      offerId: offer.id,
      title: offer.title,
      company: offer.company,
      contractType: offer.contract_type,
      locationCity: offer.location_city,
      publishAt: offer.publish_at,
      deadline: offer.deadline,
      applicationCount: applications.length,
      uniqueCandidates: candidateIds.size,
      status: offer.status,
      viewsCount: offer.views_count ?? 0,
    };
  });

  return { data: offers, total: count ?? offers.length };
}

export async function getOffersWithoutApplications(filter: AnalyticsFilter): Promise<OfferAnalytics[]> {
  const { data, error } = await supabase.from("job_offers").select(
    `
      id,
      title,
      company,
      contract_type,
      location_city,
      publish_at,
      deadline,
      status,
      views_count,
      created_at,
      job_applications!job_offer_id(candidate_id, status, applied_at)
    `,
  );
  if (error) throw error;

  return (data ?? [])
    .filter((offer: any) => (offer.job_applications ?? []).length === 0)
    .map((offer: any) => ({
      offerId: offer.id,
      title: offer.title,
      company: offer.company,
      contractType: offer.contract_type,
      locationCity: offer.location_city,
      publishAt: offer.publish_at,
      deadline: offer.deadline,
      applicationCount: 0,
      uniqueCandidates: 0,
      status: offer.status,
      viewsCount: offer.views_count ?? 0,
    }));
}

export async function getApplicationsByCompany(filter: AnalyticsFilter): Promise<CompanyAnalytics[]> {
  let query = supabase.from("job_applications").select(
    `
      candidate_id,
      job_offer_id,
      applied_at,
      status,
      job_offers:job_offer_id(company, id)
    `,
  );
  query = applyDateFilters(query, filter, "applied_at");
  if (filter.applicationStatus) query = query.eq("status", filter.applicationStatus);
  if (filter.company) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("company", `%${filter.company}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.contractType) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").eq("contract_type", filter.contractType).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCity) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_city", `%${filter.locationCity}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCountry) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_country", `%${filter.locationCountry}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));

  const { data, error } = await query;
  if (error) throw error;

  const grouped: Record<string, { offerIds: Set<string>; candidates: Set<string>; applications: number }> = {};

  for (const row of data ?? []) {
    const company = row.job_offers?.company ?? "Inconnue";
    if (!grouped[company]) grouped[company] = { offerIds: new Set(), candidates: new Set(), applications: 0 };
    const bucket = grouped[company];
    bucket.offerIds.add(row.job_offer_id);
    bucket.applications += 1;
    if (row.candidate_id) bucket.candidates.add(row.candidate_id);
  }

  return Object.entries(grouped)
    .map(([company, stats]) => ({
      company,
      offerCount: stats.offerIds.size,
      applicationCount: stats.applications,
      uniqueCandidates: stats.candidates.size,
      avgApplicationsPerOffer: stats.offerIds.size > 0 ? stats.applications / stats.offerIds.size : 0,
    }))
    .sort((a, b) => b.applicationCount - a.applicationCount);
}

export async function getApplicationsByContractType(filter: AnalyticsFilter): Promise<ContractAnalytics[]> {
  let query = supabase.from("job_applications").select(
    `
      candidate_id,
      status,
      applied_at,
      job_offers:job_offer_id(contract_type)
    `,
  );
  query = applyDateFilters(query, filter, "applied_at");
  if (filter.applicationStatus) query = query.eq("status", filter.applicationStatus);
  if (filter.company) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("company", `%${filter.company}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCity) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_city", `%${filter.locationCity}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCountry) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_country", `%${filter.locationCountry}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));

  const { data, error } = await query;
  if (error) throw error;

  const grouped: Record<string, { applications: number; candidates: Set<string> }> = {};
  let total = 0;

  for (const row of data ?? []) {
    const contractType = row.job_offers?.contract_type ?? "unknown";
    if (!grouped[contractType]) grouped[contractType] = { applications: 0, candidates: new Set() };
    grouped[contractType].applications += 1;
    total += 1;
    if (row.candidate_id) grouped[contractType].candidates.add(row.candidate_id);
  }

  return Object.entries(grouped)
    .map(([contractType, stats]) => ({
      contractType,
      count: stats.applications,
      percentage: total > 0 ? (stats.applications / total) * 100 : 0,
      uniqueCandidates: stats.candidates.size,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getApplicationsByLocation(filter: AnalyticsFilter): Promise<LocationAnalytics[]> {
  let query = supabase.from("job_applications").select(
    `
      candidate_id,
      status,
      applied_at,
      job_offers:job_offer_id(location_city, location_country)
    `,
  );
  query = applyDateFilters(query, filter, "applied_at");
  if (filter.applicationStatus) query = query.eq("status", filter.applicationStatus);
  if (filter.company) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("company", `%${filter.company}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.contractType) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").eq("contract_type", filter.contractType).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCountry) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_country", `%${filter.locationCountry}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));

  const { data, error } = await query;
  if (error) throw error;

  const grouped: Record<string, { applications: number; candidates: Set<string>; offers: Set<string> }> = {};
  for (const row of data ?? []) {
    const city = row.job_offers?.location_city ?? "unknown";
    const country = row.job_offers?.location_country ?? "unknown";
    const key = `${city}|${country}`;
    if (!grouped[key]) grouped[key] = { applications: 0, candidates: new Set(), offers: new Set() };
    const bucket = grouped[key];
    bucket.applications += 1;
    if (row.candidate_id) bucket.candidates.add(row.candidate_id);
    if (row.job_offer_id) bucket.offers.add(row.job_offer_id);
  }

  return Object.entries(grouped)
    .map(([key, stats]) => {
      const [city, country] = key.split("|");
      return {
        city: city === "unknown" ? null : city,
        country: country === "unknown" ? null : country,
        applicationCount: stats.applications,
        uniqueCandidates: stats.candidates.size,
        offerCount: stats.offers.size,
      };
    })
    .sort((a, b) => b.applicationCount - a.applicationCount);
}

export async function getApplicationsStatusBreakdown(filter: AnalyticsFilter): Promise<ApplicationStatusAnalytics[]> {
  let query = supabase.from("job_applications").select("status, candidate_id, applied_at");
  query = applyDateFilters(query, filter, "applied_at");
  if (filter.jobOfferId) query = query.eq("job_offer_id", filter.jobOfferId);
  if (filter.company) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("company", `%${filter.company}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.contractType) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").eq("contract_type", filter.contractType).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCity) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_city", `%${filter.locationCity}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));

  const { data, error } = await query;
  if (error) throw error;

  const grouped: Record<string, number> = {};
  for (const row of data ?? []) {
    const status = row.status || "unknown";
    grouped[status] = (grouped[status] ?? 0) + 1;
  }

  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);
  return Object.entries(grouped)
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getPublishedOffersCount(filter: AnalyticsFilter = {} as AnalyticsFilter): Promise<number> {
  let query = supabase
    .from("job_offers")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  if (filter.company) query = query.ilike("company", `%${filter.company}%`);
  if (filter.contractType) query = query.eq("contract_type", filter.contractType);
  if (filter.locationCity) query = query.ilike("location_city", `%${filter.locationCity}%`);
  if (filter.locationCountry) query = query.ilike("location_country", `%${filter.locationCountry}%`);

  const { count, error } = await query;

  if (error) throw error;
  return count ?? 0;
}

export async function getApplicationsDetails(
  filter: AnalyticsFilter,
  limit: number = 50,
  offset: number = 0,
): Promise<{ data: ApplicationsDetail[]; total: number }> {
  let query = supabase
    .from("job_applications")
    .select(
      `
      id,
      candidate_id,
      job_offer_id,
      status,
      applied_at,
      updated_at,
      job_offers:job_offer_id(title, company, contract_type, location_city)
    `,
      { count: "exact" },
    )
    .order("applied_at", { ascending: false })
    .range(offset, offset + limit - 1);

  query = applyDateFilters(query, filter, "applied_at");
  if (filter.jobOfferId) query = query.eq("job_offer_id", filter.jobOfferId);
  if (filter.applicationStatus) query = query.eq("status", filter.applicationStatus);
  if (filter.company) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("company", `%${filter.company}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.contractType) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").eq("contract_type", filter.contractType).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCity) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_city", `%${filter.locationCity}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));
  if (filter.locationCountry) query = query.in("job_offer_id", (await supabase.from("job_offers").select("id").ilike("location_country", `%${filter.locationCountry}%`).then(({ data }) => (data ?? []).map((row: any) => row.id))));

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []).map((app: any) => ({
      id: app.id,
      candidateId: app.candidate_id,
      jobOfferId: app.job_offer_id,
      jobTitle: app.job_offers?.title ?? "Unknown",
      company: app.job_offers?.company ?? "Unknown",
      status: app.status,
      appliedAt: app.applied_at,
      updatedAt: app.updated_at,
      contractType: app.job_offers?.contract_type,
      locationCity: app.job_offers?.location_city,
    })),
    total: count ?? 0,
  };
}
