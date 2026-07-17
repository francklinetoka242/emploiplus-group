import type { Session } from "@supabase/supabase-js";
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { usePageSEO, BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

// Import sub-components from here
import AdminSidebar from "@/components/admin/AdminSidebar";
import ErrorBoundary from "@/components/ErrorBoundary";

type AdminView = "dashboard" | "jobs" | "blog" | "notifications" | "team" | "seo" | "privacy" | "legal" | "cgu" | "candidates";

export function AdminPage() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState<AdminView>("dashboard");
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const seo = usePageSEO({
    title: t("admin.page.title"),
    description: t("admin.page.description"),
    canonical: `${BASE_URL}/admin`,
    robots: "noindex,nofollow",
  });

  // Debug logs to investigate mobile blank screen
  // eslint-disable-next-line no-console
  console.info("[AdminPage] render", { isMobile, mobileSidebarOpen, sidebarOpen, activeView, sessionPresent: !!session });

  // Detect mobile viewport
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileSidebarOpen]);

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
    else if (path === "privacy") setActiveView("privacy");
    else if (path === "legal") setActiveView("legal");
    else if (path === "cgu") setActiveView("cgu");
    else setActiveView("dashboard");

    // Close mobile sidebar when navigating
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

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
        {seo}
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
        {seo}
        <div className="container-page py-20 md:py-28">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {t("admin.page.protectedTitle")}
            </h1>
            <p className="mt-4 text-muted-foreground">{t("admin.page.protectedDescription")}</p>
            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
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
      {seo}
      <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-foreground transition hover:bg-background"
              aria-label="Toggle menu"
            >
              {mobileSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <span className="text-sm font-semibold text-foreground">Emploi+ Admin</span>
            <div className="w-10" />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <div
            className="fixed inset-0 top-[57px] z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Container */}
        <div
          className={cn(
            "relative flex min-h-[calc(100vh-57px)] lg:min-h-screen",
            isMobile ? "flex-col" : "flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6"
          )}
        >
          {/* Sidebar */}
          <div
            className={cn(
              "lg:sticky lg:top-6 lg:self-start lg:shrink-0 transition-all duration-300",
              isMobile
                ? cn(
                    "fixed inset-y-[57px] left-0 z-40 w-72 overflow-y-auto transform transition-transform duration-300",
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                  )
                : ""
            )}
          >
            <AdminSidebar
              open={isMobile ? mobileSidebarOpen : sidebarOpen}
              activeView={activeView}
              onSelect={handleSelect}
              onToggle={() => {
                if (isMobile) {
                  setMobileSidebarOpen(false);
                } else {
                  setSidebarOpen((prev) => !prev);
                }
              }}
              onLogout={handleLogout}
              session={session}
            />
          </div>

          {/* Content Area */}
          <div className={cn(
            "flex flex-1 flex-col gap-4 sm:gap-6",
            isMobile ? "px-4 pb-6 pt-0" : "min-w-0"
          )}>
            {/* AdminTopbar removed as requested */}
            <main className="flex-1 overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] border border-border bg-background p-4 sm:p-6 shadow-soft transition-all duration-300">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    </>
  );
}
