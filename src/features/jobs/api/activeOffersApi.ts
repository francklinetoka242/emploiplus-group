import { supabase } from "@/integrations/supabase/client";

let activeOffersCountPromise: Promise<number> | null = null;

export function getActiveOffersCount(): Promise<number> {
  if (!activeOffersCountPromise) {
    const now = new Date().toISOString();
    activeOffersCountPromise = supabase
      .from("job_offers")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .or(`publish_at.is.null,publish_at.lte.${now}`)
      .or(`deadline.is.null,deadline.gte.${now}`)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .then(({ count, error }) => {
        if (error) throw error;
        return count ?? 0;
      })
      .catch((error: unknown) => {
        activeOffersCountPromise = null;
        throw error;
      });
  }

  return activeOffersCountPromise;
}
