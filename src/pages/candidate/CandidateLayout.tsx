import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { CandidateMobileHeader } from "@/components/candidate/CandidateMobileHeader";
import { CandidateTopbar } from "@/components/candidate/CandidateTopbar";
import { useCandidate } from "@/hooks/useCandidate";
import { useCandidateSidebar } from "@/contexts/CandidateSidebarContext";
import { usePageSEO } from "@/lib/seo";
import { cn } from "@/lib/utils";

// Map des titres de page
const pageToTitle: Record<string, string> = {
  "/candidate/dashboard": "Tableau de bord",
  "/candidate/profile": "Mon profil",
  "/candidate/Mes-Documents": "Mes Documents",
  "/candidate/experience": "Expériences professionnelles",
  "/candidate/education": "Formations",
  "/candidate/skills": "Compétences",
  "/candidate/languages": "Langues",
  "/candidate/preferences": "Préférences d'emploi",
  "/candidate/applications": "Mes candidatures",
  "/candidate/saved-offers": "Offres enregistrées",
  "/candidate/notifications": "",
  "/candidate/settings": "",
};

export function CandidateLayout() {
  const { open, setOpen } = useCandidateSidebar();
  const { logout } = useCandidate();
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header (visible uniquement sur mobile) */}
      <CandidateMobileHeader title={pageTitle} onMenuOpen={() => setOpen(true)} onLogout={logout} />

      {/* Drawer Mobile (géré par CandidateSidebar) */}
      <CandidateSidebar open={open} onOpenChange={setOpen} onLogout={logout} isDrawer={true} />

      {/* Layout Desktop */}
      <div className="flex flex-1 md:flex-row flex-col">
        {/* Sidebar Desktop (visible uniquement sur desktop) */}
        <CandidateSidebar open={open} onOpenChange={setOpen} onLogout={logout} isDrawer={false} />

        {/* Contenu principal */}
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-in-out",
            open ? "md:ml-72" : "md:ml-20",
          )}
        >
          {/* Topbar Desktop */}
          <CandidateTopbar onMenuToggle={() => setOpen(!open)} onLogout={logout} />

          {/* Contenu avec scroll */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="w-full">
              <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-7xl">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
