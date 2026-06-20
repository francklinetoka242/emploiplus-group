import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, TrendingUp, Globe2, Briefcase, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsAdmin,
});

function AnalyticsAdmin() {
  const { data: views } = useQuery({
    queryKey: ["analytics-views"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase.from("page_views" as any).select("path, country, created_at").gte("created_at", since).limit(5000);
      return (data ?? []) as { path: string; country: string | null; created_at: string }[];
    },
  });

  const { data: topJobs } = useQuery({
    queryKey: ["analytics-top-jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("job_offers").select("id, slug, title, company, views_count").eq("status", "published").order("views_count", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const { data: topPosts } = useQuery({
    queryKey: ["analytics-top-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("id, slug, title, views_count").eq("status", "published").order("views_count", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const total = views?.length ?? 0;
  const last7 = (views ?? []).filter((v) => new Date(v.created_at).getTime() > Date.now() - 7 * 86400000).length;

  const topPaths = aggregate((views ?? []).map((v) => v.path)).slice(0, 8);
  const topCountries = aggregate((views ?? []).map((v) => v.country ?? "—").filter((c) => c !== "—")).slice(0, 8);

  return (
    <div>
      <AdminPageHeader title="Analytics" subtitle="Derniers 30 jours." />

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Stat icon={Eye} label="Visites (30j)" value={total} />
        <Stat icon={TrendingUp} label="Visites (7j)" value={last7} />
        <Stat icon={Globe2} label="Pays distincts" value={new Set((views ?? []).map(v => v.country).filter(Boolean)).size} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top pages">
          {topPaths.length === 0 ? <Empty /> : topPaths.map(([p, n]) => (
            <Row key={p} label={p} value={String(n)} />
          ))}
        </Panel>
        <Panel title="Top pays">
          {topCountries.length === 0 ? <Empty /> : topCountries.map(([p, n]) => (
            <Row key={p} label={p} value={String(n)} />
          ))}
        </Panel>
        <Panel title="Top offres" icon={Briefcase}>
          {(!topJobs || topJobs.length === 0) ? <Empty /> : topJobs.map((j) => (
            <Row key={j.id} label={`${j.title} — ${j.company}`} value={String(j.views_count ?? 0)} />
          ))}
        </Panel>
        <Panel title="Top articles" icon={FileText}>
          {(!topPosts || topPosts.length === 0) ? <Empty /> : topPosts.map((p) => (
            <Row key={p.id} label={p.title} value={String(p.views_count ?? 0)} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function aggregate(arr: string[]): [string, number][] {
  const m = new Map<string, number>();
  arr.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1));
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="size-10 rounded-lg gradient-brand grid place-items-center text-brand-foreground"><Icon className="size-4" /></div>
      <div className="mt-4 text-3xl font-display font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
function Panel({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="font-display font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
        {Icon && <Icon className="size-4" />}{title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
      <span className="truncate pr-3">{label}</span>
      <span className="font-mono text-brand font-bold">{value}</span>
    </div>
  );
}
function Empty() { return <div className="text-xs text-muted-foreground">Aucune donnée</div>; }
