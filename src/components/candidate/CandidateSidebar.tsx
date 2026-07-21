import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useCandidate } from "@/hooks/useCandidate";
import {
  Home,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  BriefcaseBusiness,
  BookOpen,
  Info,
  Mail,
  Search,
  ChevronDown,
  PlusCircle,
  Moon,
  Sun,
  ToggleLeft,
  ToggleRight,
  Bell,
  Heart,
  Send,
} from "lucide-react";
import EcoModeToggle from "@/components/sidebar/EcoModeToggle";
import { useEcoMode } from "@/contexts/EcoModeContext";

interface CandidateSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogout?: () => void;
  isDrawer?: boolean;
}

const publicMenuItems = [
  { id: "public-home", label: "Accueil", icon: Home, href: "/" },
  { id: "public-services", label: "Services", icon: BriefcaseBusiness, href: "/services" },
  { id: "public-jobs", label: "Emplois", icon: Search, href: "/jobs" },
  { id: "public-blog", label: "Blog", icon: BookOpen, href: "/blog" },
  { id: "public-faq", label: "FAQ", icon: Info, href: "/faq" },
  { id: "public-about", label: "À propos", icon: Info, href: "/about" },
  { id: "public-contact", label: "Contact", icon: Mail, href: "/contact" },
];

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: Home, href: "/candidate/dashboard" },
  { id: "profile", label: "Mon profil", icon: User, href: "/candidate/profile" },
  { id: "documents", label: "Documents", icon: PlusCircle, href: "/candidate/documents" },
  { id: "guides", label: "Fiches", icon: BookOpen, href: "/candidate/guides" },
  { id: "applications", label: "Mes candidatures", icon: Send, href: "/candidate/applications" },
  { id: "saved", label: "Offres enregistrées", icon: Heart, href: "/candidate/saved-offers" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/candidate/notifications" },
  { id: "settings", label: "Paramètres", icon: User, href: "/candidate/settings" },
];

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
};

const applyTheme = (darkMode: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", darkMode);
  try {
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  } catch {
    // ignore
  }
};

export function CandidateSidebar({ open = true, onOpenChange, onLogout, isDrawer = false }: CandidateSidebarProps) {
  const location = useLocation();
  const { profile } = useCandidate();
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const { isEcoMode } = useEcoMode();

  useEffect(() => applyTheme(isDarkMode), [isDarkMode]);

  useEffect(() => {
    if (!isDrawer || !open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange?.(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDrawer, open, onOpenChange]);

  const isActive = (href: string) => {
    const pathname = location.pathname;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleMenuClick = () => isDrawer && onOpenChange?.(false);

  // Compact toggle for collapsed sidebar
  function CompactCollapsedToggle() {
    const { isEcoMode, toggleEcoMode } = useEcoMode();
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleEcoMode}
            aria-pressed={isEcoMode}
            aria-label="Économie de données"
            className="h-10 w-10 rounded-lg bg-slate-800/50 transition-all duration-250 hover:bg-white/5 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isEcoMode ? "text-emerald-400" : "text-slate-300"}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 13c0-4 4-7 8-7V4c-5 0-9 4-9 9a1 1 0 001 1h1z" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="rounded-lg border border-white/10 bg-slate-900 text-xs font-medium">
          Économie de données
        </TooltipContent>
      </Tooltip>
    );
  }

  // Mobile drawer rendering
  if (isDrawer) {
    return (
      <>
        {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => onOpenChange?.(false)} />}
        <aside className={cn("fixed left-0 top-0 z-50 h-screen w-4/5 flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 shadow-2xl md:hidden", open ? "translate-x-0" : "-translate-x-full") }>
          <div className="flex items-center justify-end border-b border-white/5 px-4 py-5">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange?.(false)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {profile && (
            <div className="border-b border-white/5 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{profile.first_name} {profile.last_name}</p>
                  <p className="truncate text-xs text-slate-400">{profile.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
                <div className="flex items-center justify-between px-2 pb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Navigation publique</p>
                  <Button variant="ghost" size="icon" onClick={() => {}} className="rounded-md p-1 text-slate-300 hover:bg-white/5">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {publicMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.id} to={item.href} onClick={handleMenuClick} className={cn("relative flex items-center gap-3 rounded-lg px-4 py-3", active ? "bg-secondary text-white" : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90")}>
                        {active && <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />}
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", active ? "bg-secondary text-white" : "bg-slate-950/90 text-white")}><Icon className="h-5 w-5"/></div>
                        <span className="truncate text-sm font-medium text-slate-300">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Mon espace</p>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.id} to={item.href} onClick={handleMenuClick} className={cn("relative flex items-center gap-3 rounded-lg px-4 py-3", active ? "bg-secondary text-white" : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90")}>
                        {active && <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />}
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", active ? "bg-secondary text-white" : "bg-slate-950/90 text-white")}><Icon className="h-5 w-5"/></div>
                        <span className="truncate text-sm font-medium text-slate-300">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-2">
                <button type="button" onClick={() => setIsDarkMode(v => !v)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-950/90 text-slate-200">{isDarkMode ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}</div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">Mode sombre</p><p className="text-xs text-slate-400">{isDarkMode ? 'Activé' : 'Désactivé'}</p></div>
                  <div className={cn("flex h-6 w-11 items-center rounded-full p-1 transition-colors", isDarkMode ? "bg-secondary" : "bg-slate-700")}>
                    {isDarkMode ? <ToggleRight className="h-4 w-4 text-white"/> : <ToggleLeft className="h-4 w-4 text-slate-200"/>}
                  </div>
                </button>
              </div>
            </div>
          </nav>

          {/* Footer - Logout (mobile) */}
          <div className="border-t border-white/5 px-4 py-4">
            <div className="mb-3"><EcoModeToggle /></div>
            <Button onClick={() => { onOpenChange?.(false); onLogout?.(); }} className="w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium" variant="ghost">
              <LogOut className="h-4 w-4"/> Déconnexion
            </Button>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={cn("fixed left-0 top-0 z-40 hidden h-screen flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 shadow-2xl md:flex", open ? "w-72" : "w-20")} style={{ minWidth: open ? 288 : 80 }}>
      {/* Toggle Button */}
      <div className="flex items-center justify-end border-b border-white/5 px-4 py-5">
        <Button variant="ghost" size="icon" onClick={() => onOpenChange?.(!open)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white">
          {open ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <TooltipProvider delayDuration={200}>
        <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
              {open && <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Mon espace</p>}
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link to={item.href} onClick={handleMenuClick} className={cn("group relative flex items-center gap-3 rounded-lg px-3 py-2.5 md:px-3 md:py-2", active ? "bg-secondary text-white" : "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90")}>
                          {active && <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />}
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", active ? "bg-secondary text-white" : "bg-slate-950/90 text-white")}><Icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-200")} /></div>
                          {open && <span className={cn("truncate text-sm font-medium", active ? "text-white" : "text-slate-300 group-hover:text-slate-100")}>{item.label}</span>}
                        </Link>
                      </TooltipTrigger>
                      {!open && <TooltipContent side="right" align="center" className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100">{item.label}</TooltipContent>}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Footer - desktop */}
        <div className="border-t border-white/5 px-2 py-4">
          {open ? (
            <>
              <div className="mb-3"><EcoModeToggle /></div>
              <Button onClick={onLogout} className="w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium" variant="ghost">
                <LogOut className="h-4 w-4"/> Déconnexion
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <CompactCollapsedToggle />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onLogout} size="icon" className="h-10 w-10 rounded-lg bg-slate-800/50" variant="ghost"><LogOut className="h-5 w-5"/></Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded-lg border border-white/10 bg-slate-900 text-xs font-medium">Déconnexion</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}

export default CandidateSidebar;
