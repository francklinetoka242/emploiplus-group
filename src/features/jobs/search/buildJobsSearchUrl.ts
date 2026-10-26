export interface JobsSearchUrlInput {
  query?: string | null;
  city?: string | null;
}

export function buildJobsSearchUrl({ query, city }: JobsSearchUrlInput): string {
  const params = new URLSearchParams();
  const normalizedQuery = query?.trim();
  const normalizedCity = city?.trim();

  if (normalizedQuery) params.set("q", normalizedQuery);
  if (normalizedCity) params.set("ville", normalizedCity);

  const search = params.toString();
  return search ? `/jobs?${search}` : "/jobs";
}
