import { useEffect, useState } from "react";

export type Geo = { city?: string | null; country_name?: string | null; country_code?: string | null };
const KEY = "epg.geo.v1";
const TTL = 24 * 60 * 60 * 1000;

let inflight: Promise<Geo | null> | null = null;

async function fetchGeo(): Promise<Geo | null> {
  try {
    const cached = JSON.parse(localStorage.getItem(KEY) || "null") as { at: number; v: Geo } | null;
    if (cached && Date.now() - cached.at < TTL) return cached.v;
  } catch {}
  if (!inflight) {
    inflight = fetch("https://ipapi.co/json/", { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: any) => {
        if (!j) return null;
        const v: Geo = { city: j.city ?? null, country_name: j.country_name ?? null, country_code: j.country_code ?? null };
        try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), v })); } catch {}
        return v;
      })
      .catch(() => null)
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export function useGeo() {
  const [geo, setGeo] = useState<Geo | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;
    fetchGeo().then((g) => { if (alive) setGeo(g); });
    return () => { alive = false; };
  }, []);
  return geo;
}

export function rankJobs<T extends { location_city?: string | null; location_country?: string | null; featured_until?: string | null; published_at?: string | null; created_at: string }>(
  jobs: T[], geo: Geo | null,
): T[] {
  const now = Date.now();
  const score = (j: T) => {
    let s = 0;
    if (j.featured_until && new Date(j.featured_until).getTime() > now) s += 1000;
    if (geo?.city && j.location_city && j.location_city.toLowerCase() === geo.city.toLowerCase()) s += 500;
    if (geo?.country_name && j.location_country && j.location_country.toLowerCase() === geo.country_name.toLowerCase()) s += 200;
    const t = new Date(j.published_at ?? j.created_at).getTime();
    s += Math.max(0, 100 - Math.floor((now - t) / (1000 * 60 * 60 * 24)));
    return s;
  };
  return [...jobs].sort((a, b) => score(b) - score(a));
}

export function jobLocBadge<T extends { location_city?: string | null; location_country?: string | null }>(j: T, geo: Geo | null): "near" | "country" | null {
  if (!geo) return null;
  if (geo.city && j.location_city && j.location_city.toLowerCase() === geo.city.toLowerCase()) return "near";
  if (geo.country_name && j.location_country && j.location_country.toLowerCase() === geo.country_name.toLowerCase()) return "country";
  return null;
}
