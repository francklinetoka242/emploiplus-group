import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useCandidate } from "@/hooks/useCandidate";
import {
  Home,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Star,
  Globe,
  Target,
  Send,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  BriefcaseBusiness,
  BookOpen,
  Info,
  Mail,
  Search,
} from "lucide-react";

interface CandidateSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogout?: () => void;
  isDrawer?: boolean;
}

const publicMenuItems = [
  { id: "public-home", label: "Accueil", icon: Home, href: "/candidate/public" },
  { id: "public-services", label: "Services", icon: BriefcaseBusiness, href: "/candidate/public/services" },
  { id: "public-jobs", label: "Emplois", icon: Search, href: "/candidate/public/jobs" },
  { id: "public-blog", label: "Blog", icon: BookOpen, href: "/candidate/public/blog" },
  { id: "public-about", label: "À propos", icon: Info, href: "/candidate/public/about" },
  { id: "public-contact", label: "Contact", icon: Mail, href: "/candidate/public/contact" },
];

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: Home, href: "/candidate/dashboard" },
  { id: "profile", label: "Mon profil", icon: User, href: "/candidate/profile" },
  { id: "cv", label: "Mes Documents", icon: FileText, href: "/candidate/Mes-Documents" },
  {
    id: "experience",
    label: "Expériences professionnelles",
    icon: Briefcase,
    href: "/candidate/experience",
  },
  { id: "education", label: "Formations", icon: GraduationCap, href: "/candidate/education" },
  { id: "skills", label: "Compétences", icon: Star, href: "/candidate/skills" },
  { id: "languages", label: "Langues", icon: Globe, href: "/candidate/languages" },
  {
    id: "preferences",
    label: "Préférences d'emploi",
    icon: Target,
    href: "/candidate/preferences",
  },
  { id: "applications", label: "Mes candidatures", icon: Send, href: "/candidate/applications" },
  { id: "saved", label: "Offres enregistrées", icon: Heart, href: "/candidate/saved-offers" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/candidate/notifications" },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/candidate/settings" },
];

export function CandidateSidebar({
  open = true,
  onOpenChange,
  onLogout,
  isDrawer = false,
}: CandidateSidebarProps) {
  const location = useLocation();
  const { profile } = useCandidate();

  // Fermer le drawer avec Échap
  useEffect(() => {
    if (!isDrawer || !open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange?.(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawer, open, onOpenChange]);

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleMenuClick = () => {
    if (isDrawer) {
      onOpenChange?.(false);
    }
  };

  // Rendu du Drawer mobile
  if (isDrawer) {
    return (
      <>
        {/* Overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden"
            onClick={() => onOpenChange?.(false)}
            aria-hidden="true"
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-4/5 flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Close Button */}
          <div className="flex items-center justify-end border-b border-white/5 px-4 py-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange?.(false)}
              className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {profile && (
            <div className="border-b border-white/5 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                  {profile.first_name?.[0]}
                  {profile.last_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="truncate text-xs text-slate-400">{profile.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 scrollbar-hide">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Navigation publique
                </p>
                <div className="space-y-1">
                  {publicMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        onClick={handleMenuClick}
                        className={cn(
                          "relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-250 border border-transparent",
                          active
                            ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                            : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90",
                        )}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                        )}

                        <div
                          className={cn(
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-250 border border-white/10",
                            active ? "bg-secondary text-white shadow-md" : "bg-slate-950/90 text-white",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="truncate text-sm font-medium text-slate-300 group-hover:text-slate-100">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Mon espace
                </p>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        onClick={handleMenuClick}
                        className={cn(
                          "relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-250 border border-transparent",
                          active
                            ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                            : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90",
                        )}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                        )}

                        <div
                          className={cn(
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-250 border border-white/10",
                            active ? "bg-secondary text-white shadow-md" : "bg-slate-950/90 text-white",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="truncate text-sm font-medium text-slate-300 group-hover:text-slate-100">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>

          {/* Footer - Logout */}
          <div className="border-t border-white/5 px-4 py-4">
            <Button
              onClick={() => {
                onOpenChange?.(false);
                onLogout?.();
              }}
              className="w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium transition-all duration-250 hover:from-red-600/20 hover:to-red-700/20 hover:text-red-300"
              variant="ghost"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </aside>
      </>
    );
  }

  // Rendu du Sidebar desktop (inchangé)
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 shadow-2xl transition-all duration-300 ease-in-out md:flex",
        open ? "w-72 md:w-72" : "w-20 md:w-20",
      )}
      style={{ minWidth: open ? 288 : 80 }}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-end border-b border-white/5 px-4 py-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange?.(!open)}
          className="flex-shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label={open ? "Replier le menu" : "Déplier le menu"}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <TooltipProvider delayDuration={200}>
        {/* Navigation - Scroll interne */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 scrollbar-hide">
          <div className="space-y-4">
            {/* Public navigation (desktop) */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
              {open && (
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Navigation publique
                </p>
              )}
              <div className="space-y-1">
                {publicMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-250 md:px-3 md:py-2 border border-transparent",
                            active
                              ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                              : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90",
                          )}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                          )}

                          <div
                            className={cn(
                              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-250 border border-white/10",
                              active ? "bg-secondary text-white shadow-md" : "bg-slate-950/90 text-white",
                            )}
                          >
                            <Icon className={cn("h-5 w-5 transition-colors duration-250", active ? "text-white" : "text-slate-200")} />
                          </div>

                          {open && (
                            <span className={cn("truncate text-sm font-medium transition-colors duration-250", active ? "text-white" : "text-slate-300 group-hover:text-slate-100")}>
                              {item.label}
                            </span>
                          )}

                          {!open && (
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 to-secondary/0 opacity-0 transition-all duration-250 group-hover:from-primary/10 group-hover:to-secondary/10 group-hover:opacity-100" />
                          )}
                        </Link>
                      </TooltipTrigger>

                      {!open && (
                        <TooltipContent side="right" align="center" className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 shadow-lg">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Mon espace (desktop) */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
              {open && (
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Mon espace</p>
              )}
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-250 md:px-3 md:py-2 border border-transparent",
                            active
                              ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                              : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90",
                          )}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                          )}

                          <div
                            className={cn(
                              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-250 border border-white/10",
                              active
                                ? "bg-secondary text-white shadow-md"
                                : "bg-slate-950/90 text-white",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5 transition-colors duration-250",
                                active ? "text-white" : "text-slate-200",
                              )}
                            />
                          </div>

                          {open && (
                            <span
                              className={cn(
                                "truncate text-sm font-medium transition-colors duration-250",
                                active ? "text-white" : "text-slate-300 group-hover:text-slate-100",
                              )}
                            >
                              {item.label}
                            </span>
                          )}

                          {!open && (
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 to-secondary/0 opacity-0 transition-all duration-250 group-hover:from-primary/10 group-hover:to-secondary/10 group-hover:opacity-100" />
                          )}
                        </Link>
                      </TooltipTrigger>

                      {!open && (
                        <TooltipContent side="right" align="center" className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 shadow-lg">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Footer - Logout button */}
        <div className="border-t border-white/5 px-2 py-4">
          {open ? (
            <Button
              onClick={onLogout}
              className={cn(
                "w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium transition-all duration-250 hover:from-red-600/20 hover:to-red-700/20 hover:text-red-300",
              )}
              variant="ghost"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onLogout}
                  size="icon"
                  className="h-10 w-10 rounded-lg bg-slate-800/50 transition-all duration-250 hover:bg-red-600/20 hover:text-red-300"
                  variant="ghost"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="rounded-lg border border-white/10 bg-slate-900 text-xs font-medium"
              >
                Déconnexion
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
