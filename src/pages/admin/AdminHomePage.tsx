import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  MessagesSquare,
  RefreshCw,
  Sparkles,
  Users2,
} from "lucide-react";

function AdminDashboardView() {
  const { t } = useI18n();
  const [counts, setCounts] = useState({
    activeJobs: 0,
    publishedPosts: 0,
    featuredPosts: 0,
    receivedRequests: 0,
  });
  const [adminStats, setAdminStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    roles: { super_admin: 0, admin: 0, editor: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("--:--");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
      try {
        setLoadError(null);
        if (refreshKey > 0) {
          setRefreshing(true);
        }

        const [jobsRes, postsRes, featuredRes, requestsRes, adminsRes] = await Promise.all([
          supabase
            .from("job_offers")
            .select("id", { count: "exact", head: true })
            .eq("status", "published"),
          supabase
            .from("blog_posts")
            .select("id", { count: "exact", head: true })
            .eq("status", "published"),
          supabase
            .from("blog_posts")
            .select("id", { count: "exact", head: true })
            .eq("status", "published")
            .eq("is_featured", true),
          supabase.from("contacts_messages").select("id", { count: "exact", head: true }),
          supabase.from("user_roles").select("id, role, is_active"),
        ]);

        if (!mounted) return;

        const adminData = adminsRes.data ?? [];
        const roleCounts = { super_admin: 0, admin: 0, editor: 0 };
        let activeCount = 0;
        let blockedCount = 0;

        for (const row of adminData) {
          if (row.role && roleCounts[row.role as keyof typeof roleCounts] !== undefined) {
            roleCounts[row.role as keyof typeof roleCounts] += 1;
          }
          if (row.is_active) activeCount += 1;
          else blockedCount += 1;
        }

        setCounts({
          activeJobs: jobsRes.count ?? 0,
          publishedPosts: postsRes.count ?? 0,
          featuredPosts: featuredRes.count ?? 0,
          receivedRequests: requestsRes.count ?? 0,
        });
        setAdminStats({
          total: adminData.length,
          active: activeCount,
          blocked: blockedCount,
          roles: roleCounts,
        });
        setLastUpdated(
          new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!mounted) return;
        setLoading(false);
        setRefreshing(false);
      }
    }

    void loadCounts();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

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
      label: t("admin.dashboard.metric.featuredPosts"),
      value: counts.featuredPosts.toString(),
      icon: Sparkles,
      tone: "from-cyan-500/15 to-cyan-500/5 text-cyan-600",
    },
    {
      label: t("admin.dashboard.metric.receivedRequests"),
      value: counts.receivedRequests.toString(),
      icon: MessagesSquare,
      tone: "from-violet-500/15 to-violet-500/5 text-violet-600",
    },
  ];

  const roleTotal = Math.max(adminStats.total, 1);
  const roleDistribution = [
    {
      label: t("admin.team.role.superAdmin"),
      value: adminStats.roles.super_admin,
      color: "bg-violet-500",
    },
    {
      label: t("admin.team.role.admin"),
      value: adminStats.roles.admin,
      color: "bg-cyan-500",
    },
    {
      label: t("admin.team.role.editor"),
      value: adminStats.roles.editor,
      color: "bg-emerald-500",
    },
  ];

  const operationalScore = Math.min(
    100,
    Math.round((counts.activeJobs + counts.publishedPosts + counts.featuredPosts + counts.receivedRequests) / 6),
  );

  const activityBars = [
    { label: "Offres actives", value: counts.activeJobs, max: Math.max(counts.activeJobs, 10) },
    { label: "Articles publiés", value: counts.publishedPosts, max: Math.max(counts.publishedPosts, 10) },
    { label: "À la une", value: counts.featuredPosts, max: Math.max(counts.featuredPosts, 10) },
    { label: "Demandes reçues", value: counts.receivedRequests, max: Math.max(counts.receivedRequests, 10) },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="overflow-hidden rounded-xl sm:rounded-[2rem] border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 sm:p-8 text-white shadow-soft">
        <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2 sm:space-y-3 min-w-0">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-300">
              {t("admin.dashboard.overview")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold truncate">{t("admin.dashboard.title")}</h1>
            <p className="max-w-2xl text-xs sm:text-sm leading-6 text-slate-300 line-clamp-3">
              {t("admin.dashboard.description")}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="inline-flex items-center gap-2 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/10 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-slate-100 backdrop-blur flex-shrink-0">
              <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 text-cyan-300" />
              <span className="whitespace-nowrap">{t("admin.dashboard.premium")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-200">
              <Activity className="h-3.5 w-3.5 text-emerald-300" />
              <span>Dernière mise à jour : {lastUpdated}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-400/20"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Actualisation..." : "Rafraîchir"}</span>
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="group rounded-xl sm:rounded-[1.5rem] border border-border bg-background p-3 sm:p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className={`inline-flex rounded-lg sm:rounded-2xl bg-gradient-to-br ${metric.tone} p-2 sm:p-3 transition group-hover:scale-105`}>
                <Icon className="h-4 sm:h-5 w-4 sm:w-5" />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.15em] text-slate-500">
                {metric.label}
              </p>
              <p className="mt-2 text-xl sm:text-3xl font-semibold text-foreground">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Système</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">Santé opérationnelle</h3>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              {operationalScore}%
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
            <div
              className="mx-auto h-36 w-36 rounded-full border border-border"
              style={{
                background: `conic-gradient(#22c55e ${operationalScore * 3.6}deg, rgba(148, 163, 184, 0.15) 0deg)`,
              }}
            >
              <div className="flex h-full items-center justify-center rounded-full bg-background text-center text-xs font-semibold text-foreground">
                <div>
                  <div className="text-xl">{operationalScore}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Score</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {activityBars.map((bar) => (
                <div key={bar.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{bar.label}</span>
                    <span className="font-medium text-foreground">{bar.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-900/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${Math.max(10, (bar.value / bar.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Accès</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">Répartition admin</h3>
            </div>
            <div className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-100">
              {adminStats.total}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {roleDistribution.map((role) => {
              const ratio = (role.value / roleTotal) * 100;
              return (
                <div key={role.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{role.label}</span>
                    <span className="font-semibold text-foreground">{role.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-900/10">
                    <div className={`h-full rounded-full ${role.color}`} style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Actifs</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{adminStats.active}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Bloqués</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{adminStats.blocked}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-6 shadow-soft">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                {t("admin.dashboard.jobs.title")}
              </p>
              <h3 className="mt-1 sm:mt-2 text-sm sm:text-xl font-semibold text-foreground truncate">
                {t("admin.dashboard.jobs.subtitle")}
              </h3>
            </div>
            <div className="rounded-2xl sm:rounded-3xl bg-emerald-500/10 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-emerald-500 whitespace-nowrap flex-shrink-0">Stable</div>
          </div>
          <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-2xl border border-border bg-background/70 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
              <BadgeCheck className="h-3 sm:h-4 w-3 sm:w-4 text-emerald-500 flex-shrink-0" />
              <span className="line-clamp-2">Les offres sont visibles et prêtes à être gérées.</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-6 shadow-soft">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                {t("admin.dashboard.blog.title")}
              </p>
              <h3 className="mt-1 sm:mt-2 text-sm sm:text-xl font-semibold text-foreground truncate">
                {t("admin.dashboard.blog.subtitle")}
              </h3>
            </div>
            <div className="rounded-2xl sm:rounded-3xl bg-cyan-500/10 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-cyan-500 whitespace-nowrap flex-shrink-0">À la une</div>
          </div>
          <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-2xl border border-border bg-background/70 p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-foreground">
              <span>{t("admin.dashboard.blog.featuredCount")}</span>
              <span className="font-semibold">{counts.featuredPosts}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-6 shadow-soft">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                {t("admin.dashboard.admin.title")}
              </p>
              <h3 className="mt-1 sm:mt-2 text-sm sm:text-xl font-semibold text-foreground truncate">
                {t("admin.dashboard.admin.subtitle")}
              </h3>
            </div>
            <div className="rounded-2xl sm:rounded-3xl bg-slate-900/80 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-slate-100 whitespace-nowrap flex-shrink-0">
              {adminStats.total}
            </div>
          </div>
          <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-2xl border border-border bg-background/70 p-3 sm:p-4 text-xs sm:text-sm text-foreground">
            <div className="flex items-center justify-between">
              <span className="truncate">{t("admin.dashboard.admin.active")}</span>
              <span className="font-semibold">{adminStats.active}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="truncate">{t("admin.dashboard.admin.blocked")}</span>
              <span className="font-semibold">{adminStats.blocked}</span>
            </div>
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
