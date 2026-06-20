import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils-ext";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — EmploiPlus Group" },
      { name: "description", content: "Conseils carrière, actualités tech et insights professionnels par EmploiPlus Group." },
      { property: "og:title", content: "Blog — EmploiPlus Group" },
      { property: "og:description", content: "Conseils carrière, actualités tech et insights professionnels." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");

  const { data: posts } = useQuery({
    queryKey: ["blog-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, subtitle, excerpt, image, category, tags, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ["blog-sidebar-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_offers")
        .select("id, slug, title, company")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (posts ?? []).filter((p) =>
      !term || [p.title, p.subtitle, p.excerpt, p.category].filter(Boolean).some((s) => (s as string).toLowerCase().includes(term))
    );
  }, [posts, q]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (posts ?? []).forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [posts]);

  return (
    <div className="container-page py-16 md:py-20">
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">{t("blog.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("blog.subtitle")}</p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="pl-9 h-11" />
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">{t("common.empty")}</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((p) => (
                <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group rounded-xl overflow-hidden bg-card border border-border hover:shadow-elev transition-all">
                  <div className="aspect-[16/10] bg-muted overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="size-full gradient-brand" />
                    )}
                  </div>
                  <div className="p-5">
                    {p.category && <div className="text-[11px] uppercase tracking-wider font-semibold text-brand">{p.category}</div>}
                    <h3 className="mt-1 font-display text-lg font-bold group-hover:text-brand transition-colors line-clamp-2">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    <div className="mt-3 text-xs text-muted-foreground">{formatDate(p.created_at, locale)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">{t("blog.sidebar.recentJobs")}</h3>
            <div className="space-y-3">
              {(jobs ?? []).map((j) => (
                <Link key={j.id} to="/jobs/$slug" params={{ slug: j.slug }} className="flex items-start gap-2 group">
                  <Briefcase className="size-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-semibold group-hover:text-brand transition-colors line-clamp-2">{j.title}</div>
                    <div className="text-xs text-muted-foreground">{j.company}</div>
                  </div>
                </Link>
              ))}
              {(!jobs || jobs.length === 0) && <div className="text-xs text-muted-foreground">—</div>}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <h3 className="font-display font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">{t("blog.sidebar.categories")}</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c} type="button" onClick={() => setQ(c)} className="px-2.5 py-1 rounded-full text-xs bg-secondary hover:bg-accent transition-colors">
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
