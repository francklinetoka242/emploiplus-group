import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { usePageSEO, BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ListIcon as Menu, XIcon as X } from "@phosphor-icons/react";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";

// Import sub-components from here
import AdminSidebar from "@/components/admin/AdminSidebar";
import ErrorBoundary from "@/components/ErrorBoundary";

type AdminView =
  | "dashboard"
  | "jobs"
  | "blog"
  | "notifications"
  | "team"
  | "seo"
  | "privacy"
  | "legal"
  | "cgu"
  | "candidates"
  | "guides"
  | "faq"
  | "analytics-offres";

export function AdminPage() {
  const { session } = useAuthContext();
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

  // Track active view based on current route pathname
  React.useEffect(() => {
    const path = location.pathname.replace("/admin", "").replace(/^\//, "");
    if (path === "jobs") setActiveView("jobs");
    else if (path === "blog") setActiveView("blog");
    else if (path === "analytics-offres") setActiveView("analytics-offres");
    else if (path === "candidates") setActiveView("candidates");
    else if (path === "guides") setActiveView("guides");
    else if (path === "notifications") setActiveView("notifications");
    else if (path === "team") setActiveView("team");
    else if (path === "seo") setActiveView("seo");
    else if (path === "privacy") setActiveView("privacy");
    else if (path === "legal") setActiveView("legal");
    else if (path === "cgu") setActiveView("cgu");
    else if (path === "faq") setActiveView("faq");
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

  // Note: At this point, authentication and authorization have been verified by guards
  // - User exists (verified by AuthenticationGuard)
  // - Session exists (verified by AuthenticationGuard)
  // - Roles are correct (verified by RoleGuard)
  // - Permissions are correct (verified by PermissionGuard)
  // No need for additional auth checks here

  return (
    <>
      {seo}
      <ErrorBoundary>
        <div className="admin-account-shell flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
          {/* Mobile Header */}
          {isMobile && (
            <header className="relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={mobileSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={mobileSidebarOpen}
              >
                {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <span className="text-xs font-semibold tracking-tight text-foreground">
                EmploiPlus Group
              </span>
              <div className="w-10" />
            </header>
          )}

          {/* Mobile Sidebar Overlay */}
          {isMobile && mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Main Container */}
          <div className="relative flex min-h-0 flex-1">
            {/* Sidebar */}
            <div
              className={cn(
                "z-40 shrink-0 transition-all duration-300",
                isMobile
                  ? cn(
                      "fixed inset-y-14 left-0 w-60 overflow-y-auto transition-transform duration-300",
                      mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
                    )
                  : cn("relative h-full", sidebarOpen ? "w-60" : "w-12"),
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
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col bg-slate-100 transition-all duration-300 dark:bg-slate-900",
                isMobile ? "px-1 pb-1 pt-1 sm:px-2 sm:pb-2" : "px-2 py-2",
              )}
            >
              <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                <div className="min-w-0 w-full flex-1 px-2 py-3 sm:px-3 sm:py-4">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
}
