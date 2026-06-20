import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Briefcase, MapPin, Search, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils-ext";
import { useGeo, rankJobs, jobLocBadge } from "@/lib/geo";
import { JobCardSkeleton } from "@/components/site/JobSkeleton";
import { z } from "zod";

export const Route = createFileRoute("/jobs")({
  validateSearch: z.object({
    q: z.string().optional(),
    contract: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Offres d'emploi — EmploiPlus Group" },
      { name: "description", content: "Découvrez les dernières offres d'emploi diffusées par EmploiPlus Group. Postulez directement auprès des entreprises." },
      { property: "og:title", content: "Offres d'emploi — EmploiPlus Group" },
      { property: "og:description", content: "Trouvez votre prochain poste parmi nos offres vérifiées." },
      { property: "og:url", content: "/jobs" },
    ],
    links: [{ rel: "canonical", href: "/jobs" }],
  }),
  component: JobsPage,
});

const CONTRACT_TYPES = ["cdi", "cdd", "stage", "freelance", "consultance", "temps_partiel", "interim"] as const;

function JobsPage() {
  const { t, locale } = useI18n();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const geo = useGeo();
  const q = search.q ?? "";
  const contract = search.contract ?? "all";

  const setQ = (v: string) => navigate({ search: (p: any) => ({ ...p, q: v || undefined }) });
  const setContract = (v: string) => navigate({ search: (p: any) => ({ ...p, contract: v === "all" ? undefined : v }) });

  const { data, isLoading } = useQuery({
    queryKey: ["jobs-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_offers")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = (data ?? []).filter((j) => {
      if (contract !== "all" && j.contract_type !== contract) return false;
      if (!term) return true;
      return [j.title, j.company, j.location_city, j.location_country, j.description]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(term));
    });
    return rankJobs(list, geo);
  }, [data, q, contract, geo]);

  return (
    <div className="container-page py-16 md:py-20">
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">{t("jobs.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("jobs.subtitle")}</p>
        {geo?.city && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {t("jobs.geo.sortedBy")} {geo.city}, {geo.country_name}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_220px] sticky top-16 z-10 bg-background/80 backdrop-blur py-3 -mx-4 px-4 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="pl-9 h-11" />
        </div>
        <Select value={contract} onValueChange={setContract}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("jobs.filter.all")}</SelectItem>
            {CONTRACT_TYPES.map((c) => <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            {t("common.empty")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((j) => {
              const featured = j.featured_until && new Date(j.featured_until).getTime() > Date.now();
              const loc = jobLocBadge(j, geo);
              return (
                <Link
                  key={j.id}
                  to="/jobs/$slug"
                  params={{ slug: j.slug }}
                  className={`group rounded-xl bg-card border overflow-hidden hover:shadow-elev hover:border-brand transition-all relative ${featured ? "border-brand ring-1 ring-brand/30" : "border-border"}`}
                >
                  {featured && (
                    <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-wide shadow-brand">
                      <Sparkles className="size-3" /> Featured
                    </div>
                  )}
                  {j.cover_image && (
                    <div className="aspect-[16/8] overflow-hidden bg-muted">
                      <img src={j.cover_image} alt={j.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      {j.company_logo ? (
                        <img src={j.company_logo} alt={j.company} className="size-5 rounded object-cover" loading="lazy" />
                      ) : (
                        <Briefcase className="size-3.5" />
                      )}
                      <span className="font-medium text-foreground">{j.company}</span>
                      {j.contract_type && (
                        <span className="px-2 py-0.5 rounded-full bg-accent text-[--brand-deep] font-semibold uppercase text-[10px] tracking-wide">
                          {j.contract_type}
                        </span>
                      )}
                      {loc === "near" && <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold"><MapPin className="size-2.5" /> {t("jobs.geo.near")}</span>}
                      {loc === "country" && <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold">{t("jobs.geo.country")}</span>}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold group-hover:text-brand transition-colors line-clamp-2">{j.title}</h3>
                    {(j.location_city || j.location_country) && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {[j.location_city, j.location_country].filter(Boolean).join(", ")}
                      </div>
                    )}
                    <div className="mt-3 text-[11px] text-muted-foreground">{formatDate(j.published_at ?? j.created_at, locale)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
