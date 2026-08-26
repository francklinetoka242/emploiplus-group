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
import { AdminDashboardCharts } from "./components/AdminDashboardCharts";

function AdminDashboardView() {
  const { t } = useI18n();
  const [counts, setCounts] = useState({
    activeJobs: 0,
    publishedPosts: 0,
    featuredPosts: 0,
    receivedRequests: 0,
    totalCandidates: 0,
    activeCandidates: 0,
    inactiveCandidates: 0,
    archivedCandidates: 0,
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

        const [jobsRes, postsRes, featuredRes, requestsRes, adminsRes, candidatesRes] = await Promise.all([
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
          supabase.from("candidates").select("status"),
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
          totalCandidates: candidatesRes.data?.length ?? 0,
          activeCandidates: candidatesRes.data?.filter((candidate) => candidate.status === "active").length ?? 0,
          inactiveCandidates: candidatesRes.data?.filter((candidate) => candidate.status === "inactive").length ?? 0,
          archivedCandidates: candidatesRes.data?.filter((candidate) => candidate.status === "archived").length ?? 0,
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
      label: "Candidats",
      value: counts.totalCandidates.toString(),
      details: [
        `${counts.totalCandidates} Total`,
        `${counts.activeCandidates} Actifs`,
        `${counts.inactiveCandidates} Inactifs`,
        `${counts.archivedCandidates} Archivé`,
      ],
      icon: Users2,
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm sm:rounded-[1.25rem] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <p className="text-[9px] uppercase tracking-[0.22em] text-slate-500 sm:text-[10px]">
              {t("admin.dashboard.overview")}
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {t("admin.dashboard.title")}
            </h1>
            <p className="max-w-2xl text-[11px] leading-5 text-slate-600 sm:text-xs">
              {t("admin.dashboard.description")}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-700 sm:self-end sm:text-xs">
            <Activity className="h-3 w-3 text-emerald-500" />
            <span>Dernière mise à jour : {lastUpdated}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-200 sm:text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Actualisation..." : "Rafraîchir"}</span>
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const href =
            metric.label === "Candidats"
              ? "/admin/candidates"
              : metric.label === t("admin.dashboard.metric.activeJobs")
                ? "/admin/jobs"
                : metric.label === t("admin.dashboard.metric.publishedPosts") || metric.label === t("admin.dashboard.metric.featuredPosts")
                  ? "/admin/blog"
                  : "/admin";

          return (
            <Link
              key={metric.label}
              to={href}
              className="group block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:rounded-[1.15rem] sm:p-3.5"
            >
              <div className={`inline-flex rounded-lg bg-gradient-to-br ${metric.tone} p-2 sm:p-2.5`}>
                <Icon className="h-4 w-4 sm:h-4 sm:w-4" />
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
                {metric.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {metric.value}
              </p>
              {metric.details ? (
                <div className="mt-2 space-y-0.5 text-[10px] leading-4 text-slate-600 sm:text-[11px]">
                  {metric.details.map((detail) => (
                    <div key={detail}>{detail}</div>
                  ))}
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>

      <AdminDashboardCharts
        activeJobs={counts.activeJobs}
        publishedPosts={counts.publishedPosts}
        featuredPosts={counts.featuredPosts}
        receivedRequests={counts.receivedRequests}
        activeAdmins={adminStats.active}
        totalAdmins={adminStats.total}
      />

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Link to="/admin/jobs" className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:rounded-[1.35rem] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Système</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Santé opérationnelle</h3>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
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
        </Link>

        <Link to="/admin/team" className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:rounded-[1.35rem] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Accès</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Répartition admin</h3>
            </div>
            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
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
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-3">
        <Link to="/admin/jobs" className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:rounded-[1.2rem] sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 sm:text-xs">
                {t("admin.dashboard.jobs.title")}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-base truncate">
                {t("admin.dashboard.jobs.subtitle")}
              </h3>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 whitespace-nowrap flex-shrink-0 sm:text-xs">Stable</div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-background/70 p-3 sm:p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              <span className="line-clamp-2">Les offres sont visibles et prêtes à être gérées.</span>
            </div>
          </div>
        </Link>

        <Link to="/admin/blog" className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:rounded-[1.2rem] sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 sm:text-xs">
                {t("admin.dashboard.blog.title")}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-base truncate">
                {t("admin.dashboard.blog.subtitle")}
              </h3>
            </div>
            <div className="rounded-2xl bg-cyan-500/10 px-2 py-1 text-[10px] font-medium text-cyan-600 whitespace-nowrap flex-shrink-0 sm:text-xs">À la une</div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-background/70 p-3 sm:p-3.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>{t("admin.dashboard.blog.featuredCount")}</span>
              <span className="font-semibold text-slate-900">{counts.featuredPosts}</span>
            </div>
          </div>
        </Link>

        <Link to="/admin/team" className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:rounded-[1.2rem] sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 sm:text-xs">
                {t("admin.dashboard.admin.title")}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-base truncate">
                {t("admin.dashboard.admin.subtitle")}
              </h3>
            </div>
            <div className="rounded-2xl bg-slate-900 px-2 py-1 text-[10px] font-medium text-white whitespace-nowrap flex-shrink-0 sm:text-xs">
              {adminStats.total}
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-background/70 p-3 sm:p-3.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="truncate">{t("admin.dashboard.admin.active")}</span>
              <span className="font-semibold text-slate-900">{adminStats.active}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="truncate">{t("admin.dashboard.admin.blocked")}</span>
              <span className="font-semibold text-slate-900">{adminStats.blocked}</span>
            </div>
          </div>
        </Link>
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
