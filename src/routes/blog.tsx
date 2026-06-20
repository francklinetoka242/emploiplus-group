import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils-ext";
import { BlogSidebar } from "@/components/site/BlogSidebar";

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
        .select("id, slug, title, subtitle, excerpt, image, category, tags, created_at, publish_at, reading_time")
        .eq("status", "published")
        .order("publish_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = (posts ?? []).filter((p) => {
    const term = q.trim().toLowerCase();
    return !term || [p.title, p.subtitle, p.excerpt, p.category].filter(Boolean).some((s) => (s as string).toLowerCase().includes(term));
  });

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
                      <img src={p.image} alt={p.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    ) : (
                      <div className="size-full gradient-brand flex items-center justify-center"><Briefcase className="size-8 text-white/40" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    {p.category && <div className="text-[11px] uppercase tracking-wider font-semibold text-brand">{p.category}</div>}
                    <h3 className="mt-1 font-display text-lg font-bold group-hover:text-brand transition-colors line-clamp-2">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                      <span>{formatDate(p.publish_at ?? p.created_at, locale)}</span>
                      {p.reading_time ? <span>· {p.reading_time} min</span> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <BlogSidebar />
      </div>
    </div>
  );
}
