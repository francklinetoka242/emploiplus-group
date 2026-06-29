import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { BadgeCheck, BriefcaseBusiness, FileText, MessagesSquare, Sparkles, Users2 } from "lucide-react";

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
    {
      label: t("admin.dashboard.metric.activeJobs"),
      value: counts.activeJobs.toString(),
      icon: BriefcaseBusiness,
      tone: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    },
    {
      label: t("admin.dashboard.metric.publishedPosts"),
      value: counts.publishedPosts.toString(),
      icon: FileText,
      tone: "from-sky-500/15 to-sky-500/5 text-sky-600",
    },
    {
      label: t("admin.dashboard.metric.receivedRequests"),
      value: counts.receivedRequests.toString(),
      icon: MessagesSquare,
      tone: "from-violet-500/15 to-violet-500/5 text-violet-600",
    },
  ];

  const quickActions = [
    { label: "Créer une offre", href: "/admin/jobs", icon: BriefcaseBusiness },
    { label: "Rédiger un article", href: "/admin/blog", icon: FileText },
    { label: "Gérer l’équipe", href: "/admin/team", icon: Users2 },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{t("admin.dashboard.overview")}</p>
            <h1 className="text-3xl font-semibold">{t("admin.dashboard.title")}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{t("admin.dashboard.description")}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-slate-100 backdrop-blur">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>{t("admin.dashboard.premium")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-[1.5rem] border border-border bg-background p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300">
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${metric.tone} p-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
              <p className="mt-4 text-3xl font-semibold text-foreground">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t("admin.dashboard.jobs.title")}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{t("admin.dashboard.jobs.subtitle")}</h3>
            </div>
            <div className="rounded-3xl bg-emerald-500/10 px-3 py-2 text-emerald-500">Stable</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("admin.dashboard.jobs.description")}</p>
          <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              <span>Vos offres sont visibles et prêtes à être gérées.</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t("admin.dashboard.content.title")}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{t("admin.dashboard.content.subtitle")}</h3>
            </div>
            <div className="rounded-3xl bg-blue-500/10 px-3 py-2 text-blue-500">Engagé</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("admin.dashboard.content.description")}</p>
          <div className="mt-6 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.href} className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground transition hover:border-slate-300 hover:bg-background">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {action.label}
                  </span>
                  <span className="text-slate-400">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminHomePage() {
  return (
    <>
      <SEO
        title="Administration - Tableau de bord"
        description="Tableau de bord d'administration d'EmploiPlus Group."
        canonical={`${BASE_URL}/admin`}
        robots="noindex,nofollow"
      />
      <AdminDashboardView />
    </>
  );
}
