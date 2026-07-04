import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  FileText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

// Import sub-components from here
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

type AdminView = "dashboard" | "jobs" | "blog" | "notifications" | "team" | "seo" | "candidates";

export function AdminPage() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [activeView, setActiveView] = React.useState<AdminView>("dashboard");
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    }
    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const path = location.pathname.replace("/admin", "").replace(/^\//, "");
    if (path === "jobs") setActiveView("jobs");
    else if (path === "blog") setActiveView("blog");
    else if (path === "candidates") setActiveView("candidates");
    else if (path === "notifications") setActiveView("notifications");
    else if (path === "team") setActiveView("team");
    else if (path === "seo") setActiveView("seo");
    else setActiveView("dashboard");
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSelect = (view: AdminView) => {
    setActiveView(view);
    navigate(view === "dashboard" ? "/admin" : `/admin/${view}`);
  };

  if (loading) {
    return (
      <>
        {usePageSEO({
          title: t("admin.page.title"),
          description: t("admin.page.description"),
          canonical: "https://emploiplus.group/#/admin",
          robots: "noindex,nofollow",
        })}
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <p className="text-muted-foreground">{t("admin.page.loading")}</p>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        {usePageSEO({
          title: t("admin.page.title"),
          description: t("admin.page.description"),
          canonical: "https://emploiplus.group/#/admin",
          robots: "noindex,nofollow",
        })}
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <h1 className="font-display text-3xl font-bold text-foreground">{t("admin.page.protectedTitle")}</h1>
            <p className="mt-4 text-muted-foreground">{t("admin.page.protectedDescription")}</p>
            <div className="mt-8">
              <Link to="/auth" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                {t("admin.page.loginButton")}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {usePageSEO({
        title: t("admin.page.title"),
        description: t("admin.page.description"),
        canonical: `${BASE_URL}/admin`,
        robots: "noindex,nofollow",
      })}
      <div className="min-h-screen bg-slate-950/5 py-6">
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1600px] gap-6 px-4 sm:px-6 lg:px-8">
          <div className="sticky top-6 self-start shrink-0">
            <AdminSidebar
              open={sidebarOpen}
              activeView={activeView}
              onSelect={handleSelect}
              onToggle={() => setSidebarOpen((prev) => !prev)}
              onLogout={handleLogout}
              session={session}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <AdminTopbar session={session} />
            <main className="flex-1 min-h-0 overflow-y-auto rounded-[2rem] border border-border bg-background p-6 shadow-soft transition-all duration-300">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
