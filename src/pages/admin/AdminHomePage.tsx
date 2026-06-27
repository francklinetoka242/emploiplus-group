import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

function AdminDashboardView() {
  const { t } = useI18n();
  const [counts, setCounts] = useState({ activeJobs: 0, publishedPosts: 0, receivedRequests: 0 });

  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
      const [jobsRes, postsRes, requestsRes] = await Promise.all([
        supabase.from("job_offers").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("contacts_messages").select("id", { count: "exact", head: true }),
      ]);

      if (!mounted) return;

      setCounts({
        activeJobs: jobsRes.count ?? 0,
        publishedPosts: postsRes.count ?? 0,
        receivedRequests: requestsRes.count ?? 0,
      });
    }

    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = [
    { label: t("admin.dashboard.metric.activeJobs"), value: counts.activeJobs.toString() },
    { label: t("admin.dashboard.metric.publishedPosts"), value: counts.publishedPosts.toString() },
    { label: t("admin.dashboard.metric.receivedRequests"), value: counts.receivedRequests.toString() },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t("admin.dashboard.overview")}</p>
            <h1 className="text-3xl font-semibold text-foreground">{t("admin.dashboard.title")}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{t("admin.dashboard.description")}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-sm text-slate-200 shadow-sm">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>{t("admin.dashboard.premium")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t("admin.dashboard.jobs.title")}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{t("admin.dashboard.jobs.subtitle")}</h3>
            </div>
            <div className="rounded-3xl bg-emerald-500/10 px-3 py-2 text-emerald-400">Stable</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("admin.dashboard.jobs.description")}</p>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t("admin.dashboard.content.title")}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{t("admin.dashboard.content.subtitle")}</h3>
            </div>
            <div className="rounded-3xl bg-blue-500/10 px-3 py-2 text-blue-300">Engagé</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("admin.dashboard.content.description")}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminHomePage() {
  return <AdminDashboardView />;
}
