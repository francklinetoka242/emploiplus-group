import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Briefcase, MapPin, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils-ext";

export const Route = createFileRoute("/jobs")({
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
  const [q, setQ] = useState("");
  const [contract, setContract] = useState<string>("all");

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
    return (data ?? []).filter((j) => {
      if (contract !== "all" && j.contract_type !== contract) return false;
      if (!term) return true;
      return [j.title, j.company, j.location_city, j.location_country, j.description]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(term));
    });
  }, [data, q, contract]);

  return (
    <div className="container-page py-16 md:py-20">
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">{t("jobs.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("jobs.subtitle")}</p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_220px]">
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
          <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            {t("common.empty")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((j) => (
              <Link
                key={j.id}
                to="/jobs/$slug"
                params={{ slug: j.slug }}
                className="group rounded-xl bg-card border border-border overflow-hidden hover:shadow-elev hover:border-brand transition-all"
              >
                {j.cover_image && (
                  <div className="aspect-[16/8] overflow-hidden bg-muted">
                    <img src={j.cover_image} alt={j.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {j.company_logo ? (
                      <img src={j.company_logo} alt={j.company} className="size-5 rounded object-cover" />
                    ) : (
                      <Briefcase className="size-3.5" />
                    )}
                    <span className="font-medium text-foreground">{j.company}</span>
                    {j.contract_type && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-[--brand-deep] font-semibold uppercase text-[10px] tracking-wide">
                        {j.contract_type}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold group-hover:text-brand transition-colors line-clamp-2">{j.title}</h3>
                  {(j.location_city || j.location_country) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {[j.location_city, j.location_country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className="mt-3 text-[11px] text-muted-foreground">{formatDate(j.created_at, locale)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
