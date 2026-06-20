import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MapPin, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGeo, rankJobs, jobLocBadge } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";

export function BlogSidebar() {
  const { t } = useI18n();
  const geo = useGeo();

  const { data: jobs } = useQuery({
    queryKey: ["sidebar-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_offers")
        .select("id, slug, title, company, location_city, location_country, featured_until, published_at, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const { data: popular } = useQuery({
    queryKey: ["sidebar-popular-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, views_count")
        .eq("status", "published")
        .order("views_count", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["sidebar-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("category")
        .eq("status", "published")
        .not("category", "is", null);
      const set = new Set<string>();
      (data ?? []).forEach((r: any) => r.category && set.add(r.category));
      return Array.from(set);
    },
  });

  const ranked = rankJobs(jobs ?? [], geo).slice(0, 5);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 self-start">
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Briefcase className="size-4" /> {geo?.city ? t("blog.sidebar.jobsNear") : t("blog.sidebar.recentJobs")}
        </h3>
        <div className="space-y-3">
          {ranked.map((j) => {
            const b = jobLocBadge(j, geo);
            return (
              <Link key={j.id} to="/jobs/$slug" params={{ slug: j.slug }} className="block group">
                <div className="text-sm font-semibold group-hover:text-brand transition-colors line-clamp-2">{j.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  {j.company}
                  {b === "near" && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-semibold"><MapPin className="size-2.5" /> Near you</span>}
                  {b === "country" && <span className="px-1.5 py-0.5 rounded-full bg-accent text-[--brand-deep] text-[10px] font-semibold">In your country</span>}
                </div>
              </Link>
            );
          })}
          {ranked.length === 0 && <div className="text-xs text-muted-foreground">—</div>}
        </div>
      </div>

      {popular && popular.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TrendingUp className="size-4" /> {t("blog.sidebar.popular")}
          </h3>
          <ol className="space-y-3 list-decimal list-inside marker:text-brand marker:font-bold">
            {popular.map((p) => (
              <li key={p.id} className="text-sm">
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-brand transition-colors line-clamp-2">{p.title}</Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="font-display font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">{t("blog.sidebar.categories")}</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-secondary">{c}</span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
