import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { jobService } from "@/features/jobs/api";
import {
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  MessagesSquare,
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

  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
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

  const quickActions = [
    { label: t("admin.dashboard.action.createJob"), href: "/admin/jobs", icon: BriefcaseBusiness },
    { label: t("admin.dashboard.action.writeArticle"), href: "/admin/blog", icon: FileText },
    { label: t("admin.dashboard.action.manageTeam"), href: "/admin/team", icon: Users2 },
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
          <div className="inline-flex items-center gap-2 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/10 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-slate-100 backdrop-blur flex-shrink-0">
            <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 text-cyan-300" />
            <span className="whitespace-nowrap">{t("admin.dashboard.premium")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-xl sm:rounded-[1.5rem] border border-border bg-background p-3 sm:p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <div className={`inline-flex rounded-lg sm:rounded-2xl bg-gradient-to-br ${metric.tone} p-2 sm:p-3`}>
                <Icon className="h-4 sm:h-5 w-4 sm:w-5" />
              </div>
              <p className="mt-3 sm:mt-5 text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 line-clamp-2">
                {metric.label}
              </p>
              <p className="mt-2 sm:mt-4 text-xl sm:text-3xl font-semibold text-foreground">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-8 shadow-soft">
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
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-6 text-muted-foreground line-clamp-2">
            {t("admin.dashboard.jobs.description")}
          </p>
          <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-2xl border border-border bg-background/70 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
              <BadgeCheck className="h-3 sm:h-4 w-3 sm:w-4 text-emerald-500 flex-shrink-0" />
              <span className="line-clamp-2">Vos offres sont visibles et prêtes à être gérées.</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-8 shadow-soft">
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
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-6 text-muted-foreground line-clamp-2">
            {t("admin.dashboard.blog.description")}
          </p>
          <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-2xl border border-border bg-background/70 p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-foreground mb-3">
              <span>{t("admin.dashboard.blog.featuredCount")}</span>
              <span className="font-semibold">{counts.featuredPosts}</span>
            </div>
            <Link
              to="/admin/blog"
              className="inline-flex items-center rounded-lg sm:rounded-2xl border border-border bg-background/80 px-3 sm:px-4 py-2 text-xs sm:text-sm text-foreground transition hover:border-slate-300 hover:bg-background"
            >
              {t("admin.dashboard.action.viewBlog")}
            </Link>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-8 shadow-soft">
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
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-6 text-muted-foreground line-clamp-2">
            {t("admin.dashboard.admin.description")}
          </p>
          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 rounded-lg sm:rounded-2xl border border-border bg-background/70 p-3 sm:p-4 text-xs sm:text-sm text-foreground">
            <div className="flex items-center justify-between">
              <span className="truncate">{t("admin.dashboard.admin.active")}</span>
              <span className="font-semibold">{adminStats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="truncate">{t("admin.dashboard.admin.blocked")}</span>
              <span className="font-semibold">{adminStats.blocked}</span>
            </div>
            <div className="border-t border-border pt-2 sm:pt-3">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">
                {t("admin.dashboard.admin.roles")}
              </p>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-foreground">
                  <span className="truncate">{t("admin.team.role.superAdmin")}</span>
                  <span className="font-semibold">{adminStats.roles.super_admin}</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span className="truncate">{t("admin.team.role.admin")}</span>
                  <span className="font-semibold">{adminStats.roles.admin}</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span className="truncate">{t("admin.team.role.editor")}</span>
                  <span className="font-semibold">{adminStats.roles.editor}</span>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/admin/team"
            className="mt-4 sm:mt-5 inline-flex items-center rounded-lg sm:rounded-2xl border border-border bg-background/80 px-3 sm:px-4 py-2 text-xs sm:text-sm text-foreground transition hover:border-slate-300 hover:bg-background"
          >
            {t("admin.dashboard.action.viewTeam")}
          </Link>
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
