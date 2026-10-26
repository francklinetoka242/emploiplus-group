import React, { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { CandidateMobileHeader } from "@/components/candidate/CandidateMobileHeader";
import { CandidateTopbar } from "@/components/candidate/CandidateTopbar";
import { useCandidate } from "@/hooks/useCandidate";
import { useCandidateSidebar } from "@/contexts/CandidateSidebarContext";
import { usePageSEO } from "@/features/seo";
import { MaeliseWidget } from "@/features/maelise";
import { cn } from "@/lib/utils";

interface CandidateAppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

interface CandidateLayoutProps {
  children?: React.ReactNode;
}

// Map des titres de page
const pageToTitle: Record<string, string> = {
  "/candidate/dashboard": "Tableau de bord",
  "/candidate/profile": "Mon profil",
  "/candidate/create-cv": "Création-CV",
  "/candidate/documents": "Mes Documents",
  "/candidate/experience": "Profil",
  "/candidate/education": "Profil",
  "/candidate/skills": "Profil",
  "/candidate/languages": "Profil",
  "/candidate/preferences": "Profil",
  "/candidate/applications": "Mes candidatures",
  "/candidate/saved-jobs": "Offres enregistrées",
  "/candidate/saved-offers": "Offres enregistrées",
  "/candidate/notifications": "",
  "/candidate/subscription": "Abonnement",
  "/candidate/subscription/free": "Forfait Gratuit",
  "/candidate/subscription/premium": "Premium",
  "/candidate/subscription/premium-plus": "Premium+",
  "/candidate/account": "Compte",
  "/candidate/settings": "Compte",
};

export function CandidateAppShell({ children, pageTitle = "Mon Espace" }: CandidateAppShellProps) {
  const location = useLocation();
  const { open, setOpen } = useCandidateSidebar();
  const { logout } = useCandidate();
  const [isMaeliseCollapsed, setIsMaeliseCollapsed] = useState(true);
  const toggleMaelise = () => setIsMaeliseCollapsed((previous) => !previous);
  const isJobDetailPage = location.pathname.startsWith("/jobs/");
  const isCandidateHomePage = location.pathname === "/candidate/public";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:h-screen md:overflow-hidden">
      {/* Mobile Header (visible uniquement sur mobile) */}
      <div className="overflow-hidden md:hidden">
        <div className="min-h-0">
          <CandidateMobileHeader
            title={pageTitle}
            onMenuOpen={() => setOpen(true)}
            onLogout={logout}
          />
        </div>
      </div>

      {/* Drawer Mobile (géré par CandidateSidebar) */}
      <CandidateSidebar open={open} onOpenChange={setOpen} onLogout={logout} isDrawer={true} />

      {/* Layout Desktop */}
      <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        {/* Sidebar Desktop (visible uniquement sur desktop) */}
        <CandidateSidebar open={open} onOpenChange={setOpen} onLogout={logout} isDrawer={false} />

        {/* Contenu principal */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col bg-slate-100 transition-all duration-300 ease-in-out dark:bg-slate-900 md:min-h-0",
            open ? "md:ml-60" : "md:ml-12",
          )}
        >
          {/* Topbar Desktop */}
          <div className="overflow-hidden">
            <div className="min-h-0">
              <CandidateTopbar
                onMenuToggle={() => setOpen(!open)}
                onMaeliseToggle={toggleMaelise}
                isMaeliseCollapsed={isMaeliseCollapsed}
                onLogout={logout}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 min-[900px]:flex-row md:min-h-0">
            <div className="flex min-w-0 flex-1 flex-col rounded-t-[20px] border border-border bg-background md:min-h-0 md:overflow-hidden">
              <main
                className={cn(
                  "candidate-main-scroll min-w-0 flex-1 touch-pan-y overflow-x-clip bg-background md:min-h-0 md:overflow-y-auto md:overscroll-y-contain lg:flex lg:flex-col",
                  isJobDetailPage && "lg:overflow-hidden lg:overflow-y-hidden",
                )}
              >
                <div
                  className={cn(
                    "min-w-0 w-full",
                    isJobDetailPage && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col",
                  )}
                >
                  <div
                    className={cn(
                      "candidate-main-content w-full max-w-none px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
                      isJobDetailPage && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col",
                      isCandidateHomePage && "lg:p-0",
                    )}
                  >
                    {children}
                  </div>
                </div>
              </main>
            </div>
            <div
              className={cn(
                "min-w-0 overflow-hidden transition-[width,flex-basis] duration-300 ease-in-out",
                isMaeliseCollapsed
                  ? "min-[900px]:w-0 min-[900px]:basis-0"
                  : "min-[900px]:w-[320px] min-[900px]:basis-[320px]",
              )}
            >
              <MaeliseWidget
                isEmbedded
                isCollapsed={isMaeliseCollapsed}
                onCollapse={() => setIsMaeliseCollapsed(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CandidateLayout({ children }: CandidateLayoutProps) {
  const location = useLocation();

  // Déterminer le titre basé sur la route actuelle
  const pageTitle = useMemo(() => {
    return pageToTitle[location.pathname] || "Mon Espace";
  }, [location.pathname]);

  usePageSEO({
    title: "Mon Espace Candidat - EmploiPlus Group",
    description: "Accédez à votre espace candidat sur EmploiPlus Group",
    robots: "noindex,nofollow",
  });

  return <CandidateAppShell pageTitle={pageTitle}>{children ?? <Outlet />}</CandidateAppShell>;
}
