import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { CandidateMobileHeader } from "@/components/candidate/CandidateMobileHeader";
import { CandidateTopbar } from "@/components/candidate/CandidateTopbar";
import { useCandidate } from "@/hooks/useCandidate";
import { useCandidateSidebar } from "@/contexts/CandidateSidebarContext";
import { usePageSEO } from "@/features/seo";
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
  "/candidate/account": "Compte",
  "/candidate/settings": "Compte",
};

export function CandidateAppShell({ children, pageTitle = "Mon Espace" }: CandidateAppShellProps) {
  const location = useLocation();
  const { open, setOpen } = useCandidateSidebar();
  const { logout } = useCandidate();
  const mainRef = useRef<HTMLElement | null>(null);
  const lastMainScrollTopRef = useRef(0);
  const lastWindowScrollTopRef = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    setHeaderVisible(true);
    lastMainScrollTopRef.current = mainRef.current?.scrollTop ?? 0;
    lastWindowScrollTopRef.current = window.scrollY;
  }, [location.pathname]);

  useEffect(() => {
    const scrollContainer = mainRef.current;
    const canScrollContainer = () =>
      Boolean(scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight + 1);
    const updateHeaderVisibility = (currentScrollTop: number, lastScrollTopRef: React.MutableRefObject<number>) => {
      const scrollDelta = currentScrollTop - lastScrollTopRef.current;

      if (currentScrollTop <= 0 || scrollDelta < -4) {
        setHeaderVisible((visible) => (visible ? visible : true));
      } else if (scrollDelta > 4) {
        setHeaderVisible((visible) => (visible ? false : visible));
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    const handleContainerScroll = () => updateHeaderVisibility(scrollContainer?.scrollTop ?? 0, lastMainScrollTopRef);
    const handleWindowScroll = () => {
      if (!canScrollContainer()) updateHeaderVisibility(window.scrollY, lastWindowScrollTopRef);
    };

    scrollContainer?.addEventListener("scroll", handleContainerScroll, { passive: true });
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    lastMainScrollTopRef.current = scrollContainer?.scrollTop ?? 0;
    lastWindowScrollTopRef.current = window.scrollY;

    return () => {
      scrollContainer?.removeEventListener("scroll", handleContainerScroll);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  return (
    <div className="h-screen min-h-screen flex flex-col bg-background text-foreground">
      {/* Mobile Header (visible uniquement sur mobile) */}
      <div className={cn("transition-transform duration-300 md:hidden", headerVisible ? "translate-y-0" : "-translate-y-full")}>
        <div>
          <CandidateMobileHeader title={pageTitle} onMenuOpen={() => setOpen(true)} onLogout={logout} />
        </div>
      </div>

      {/* Drawer Mobile (géré par CandidateSidebar) */}
      <CandidateSidebar open={open} onOpenChange={setOpen} onLogout={logout} isDrawer={true} />

      {/* Layout Desktop */}
      <div className="flex flex-1 md:flex-row flex-col">
        {/* Sidebar Desktop (visible uniquement sur desktop) */}
        <CandidateSidebar open={open} onOpenChange={setOpen} onLogout={logout} isDrawer={false} />

        {/* Contenu principal */}
        <div
          className={cn(
            "flex min-w-0 flex-1 min-h-0 flex-col transition-all duration-300 ease-in-out",
            open ? "md:ml-72" : "md:ml-20",
          )}
        >
          {/* Topbar Desktop */}
          <div className={cn("transition-transform duration-300", headerVisible ? "translate-y-0" : "-translate-y-full")}>
            <div>
              <CandidateTopbar onMenuToggle={() => setOpen(!open)} onLogout={logout} />
            </div>
          </div>

          {/* Contenu avec scroll */}
          <main ref={mainRef} className="min-w-0 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="min-w-0 w-full">
              <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-7xl">
                {children}
              </div>
            </div>
          </main>
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

  return (
    <CandidateAppShell pageTitle={pageTitle}>{children ?? <Outlet />}</CandidateAppShell>
  );
}
