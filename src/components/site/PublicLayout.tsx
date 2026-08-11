import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { isMobileApp } from "@/lib/isMobileApp";

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const hideShell = location.pathname === "/auth" || isMobileApp();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!hideShell && <SiteHeader />}
      <main className="flex-1">{children ?? <Outlet />}</main>
      {!hideShell && <SiteFooter />}
      {!hideShell && <CookieConsentBanner />}
    </div>
  );
}
