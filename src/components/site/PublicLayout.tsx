import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { isMobileApp } from "@/lib/isMobileApp";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";
import { cn } from "@/lib/utils";

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const { roles } = useAuthContext();
  const hideShell = location.pathname === "/auth" || isMobileApp();
  const isCandidateSession = roles.includes("candidate");
  const isJobDetailPage = location.pathname.startsWith("/jobs/");

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-background text-foreground",
        isJobDetailPage && "lg:h-dvh lg:min-h-0 lg:overflow-hidden",
      )}
    >
      {!hideShell && <SiteHeader />}
      <main
        className={cn(
          "flex-1 lg:flex lg:flex-col",
          isJobDetailPage && "lg:min-h-0 lg:overflow-hidden",
        )}
      >
        {children ?? <Outlet />}
      </main>
      {!hideShell && !isCandidateSession && (
        <div>
          <SiteFooter />
        </div>
      )}
      {!hideShell && <CookieConsentBanner />}
    </div>
  );
}
