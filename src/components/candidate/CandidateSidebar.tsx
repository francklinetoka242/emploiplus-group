import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isMobileApp } from "@/lib/isMobileApp";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Bell,
  Heart,
  Send,
  Crown,
} from "lucide-react";
import EcoModeToggle from "@/components/sidebar/EcoModeToggle";
import { ThemeSwitch } from "@/components/ui/theme-switch";
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
  { id: "saved", label: "Offres enregistrées", icon: Heart, href: "/candidate/saved-jobs" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/candidate/notifications" },
  { id: "subscription", label: "Abonnement", icon: Crown, href: "/candidate/subscription" },
  { id: "settings", label: "Compte", icon: User, href: "/candidate/account" },
  {
    id: "support",
    label: "Centre d'aide",
    icon: Info,
    href: "https://support.emploiplus-group.com",
    external: true,
  },
];

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return false;
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

export function CandidateSidebar({
  open = true,
  onOpenChange,
  onLogout,
  isDrawer = false,
}: CandidateSidebarProps) {
  const location = useLocation();
  const { profile } = useCandidate();
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const { isEcoMode } = useEcoMode();
  const mobileApp =
    typeof window !== "undefined" &&
    (isMobileApp() || (window as Window & { isMobileApp?: boolean }).isMobileApp === true);
  const sidebarHoverMotion = isEcoMode
    ? ""
    : "transition-transform duration-200 ease-out hover:translate-x-0.5";

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

  const [publicNavExpanded, setPublicNavExpanded] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const candidateMenuItems = menuItems;
  const handleMenuClick = () => isDrawer && onOpenChange?.(false);

  const handleSupportRedirect = () => {
    setSupportDialogOpen(false);
    window.open("https://support.emploiplus-group.com", "_blank", "noopener,noreferrer");
  };

  const renderSupportDialog = () => (
    <AlertDialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
      <AlertDialogContent className="max-w-md rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
        <div className="p-6">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-base font-semibold text-slate-900">
              Redirection vers le centre d’aide
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-slate-600">
              Vous serez redirigé vers le centre d’aide. Continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2 sm:justify-end">
            <AlertDialogCancel
              onClick={() => setSupportDialogOpen(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSupportRedirect}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Mobile drawer rendering
  if (isDrawer) {
    return (
      <>
        {renderSupportDialog()}

        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => onOpenChange?.(false)}
          />
        )}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-4/5 flex flex-col shadow-2xl md:hidden",
            isDarkMode
              ? "bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100"
              : "bg-white text-slate-900",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-end px-4 py-3",
              isDarkMode ? "border-b border-white/5" : "border-b border-slate-200",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange?.(false)}
              className={cn(
                "rounded-lg p-2 hover:bg-white/10",
                isDarkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-900",
              )}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav
            className={cn(
              "flex-1 overflow-y-auto px-2 py-4 scrollbar-hide",
              isDarkMode ? "" : "bg-white",
            )}
          >
            <div className="space-y-4">
              {!mobileApp && (
                <div
                  className={cn(
                    "rounded-2xl p-2",
                    isDarkMode
                      ? "border border-white/10 bg-slate-950/60"
                      : "border border-slate-200 bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between px-2 pb-2">
                    <p
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.24em]",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Navigation publique
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPublicNavExpanded((value) => !value)}
                      aria-expanded={publicNavExpanded}
                      className={cn(
                        "rounded-md p-1 transition",
                        isDarkMode
                          ? "text-slate-300 hover:bg-white/5"
                          : "text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          publicNavExpanded && "rotate-180",
                        )}
                      />
                    </Button>
                  </div>
                  <div className={cn(publicNavExpanded ? "space-y-1" : "hidden")}>
                    {publicMenuItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={handleMenuClick}
                          className={cn(
                            `relative flex items-center gap-3 rounded-lg px-4 py-3 ${sidebarHoverMotion}`,
                            active
                              ? "bg-secondary text-white"
                              : isDarkMode
                                ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                                : "bg-white text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                          )}
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg",
                              active
                                ? "bg-secondary text-white"
                                : isDarkMode
                                  ? "bg-slate-950/90 text-white"
                                  : "bg-slate-100 text-slate-700",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={cn(
                              "truncate text-sm font-medium",
                              active
                                ? "text-white"
                                : isDarkMode
                                  ? "text-slate-300"
                                  : "text-slate-700",
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <Link
                to="/jobs"
                onClick={handleMenuClick}
                className={cn(
                  `relative flex items-center gap-3 rounded-2xl px-4 py-3 ${sidebarHoverMotion}`,
                  isDarkMode
                    ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    isDarkMode ? "bg-slate-950/90 text-white" : "bg-slate-100 text-slate-700",
                  )}
                >
                  <Search className="h-5 w-5" />
                </div>
                <span className="truncate text-sm font-medium">Emplois</span>
              </Link>

              <div
                className={cn(
                  "rounded-2xl p-2",
                  isDarkMode
                    ? "border border-white/10 bg-slate-950/60"
                    : "border border-slate-200 bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em]",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Mon espace
                </p>
                <div className="space-y-1">
                  {candidateMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const content = (
                      <>
                        {active && (
                          <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                        )}
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg",
                            active
                              ? "bg-secondary text-white"
                              : isDarkMode
                                ? "bg-slate-950/90 text-white"
                                : "bg-slate-100 text-slate-700",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            active
                              ? "text-white"
                              : isDarkMode
                                ? "text-slate-300"
                                : "text-slate-700",
                          )}
                        >
                          {item.label}
                        </span>
                      </>
                    );

                    if (item.external) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            handleMenuClick();
                            setSupportDialogOpen(true);
                          }}
                          className={cn(
                            `relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${sidebarHoverMotion}`,
                            active
                              ? "bg-secondary text-white"
                              : isDarkMode
                                ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                                : "bg-white text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        onClick={handleMenuClick}
                        className={cn(
                          `relative flex items-center gap-3 rounded-lg px-4 py-3 ${sidebarHoverMotion}`,
                          active
                            ? "bg-secondary text-white"
                            : isDarkMode
                              ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                              : "bg-white text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div
                className={cn(
                  "mt-3 rounded-2xl p-2",
                  isDarkMode
                    ? "border border-white/10 bg-slate-950/60"
                    : "border border-slate-200 bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                    isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-slate-200" : "text-slate-800",
                      )}
                    >
                      Mode sombre
                    </p>
                    <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                      {isDarkMode ? "Activé" : "Désactivé"}
                    </p>
                  </div>
                  <ThemeSwitch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                </div>
              </div>
              <div
                className={cn(
                  "rounded-2xl p-2",
                  isDarkMode
                    ? "border border-white/10 bg-slate-950/60"
                    : "border border-slate-200 bg-slate-50",
                )}
              >
                <EcoModeToggle />
              </div>
            </div>
          </nav>

          {/* Footer - Logout (mobile) */}
          <div
            className={cn(
              "px-4 py-4",
              isDarkMode ? "border-t border-white/5" : "border-t border-slate-200",
            )}
          >
            <Button
              onClick={() => {
                onOpenChange?.(false);
                onLogout?.();
              }}
              className="w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              variant="ghost"
            >
              <LogOut className="h-4 w-4 text-white" /> Déconnexion
            </Button>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <>
      {renderSupportDialog()}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col shadow-2xl md:flex",
          isDarkMode
            ? "bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100"
            : "bg-white text-slate-900",
          open ? "w-72" : "w-20",
        )}
        style={{ minWidth: open ? 288 : 80 }}
      >
      <div
        className={cn(
          "flex h-12 shrink-0 items-start justify-end px-2 pt-1",
          isDarkMode ? "border-b border-white/5" : "border-b border-slate-200",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange?.(!open)}
          className={cn(
            "h-10 w-10 rounded-lg",
            isDarkMode ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
          )}
          aria-label={open ? "Réduire le menu candidat" : "Agrandir le menu candidat"}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <TooltipProvider delayDuration={200}>
        <nav
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-1 scrollbar-hide",
          )}
        >
          <div className="space-y-2">
            <Link
              to="/jobs"
              onClick={handleMenuClick}
              className={cn(
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 ${sidebarHoverMotion} md:px-3 md:py-2`,
                isDarkMode
                  ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  isDarkMode ? "bg-slate-950/90 text-white" : "bg-slate-100 text-slate-700",
                )}
              >
                <Search className="h-5 w-5" />
              </div>
              {open && <span className="truncate text-sm font-medium">Emplois</span>}
            </Link>

            <div
              className={cn(
                "rounded-2xl p-2",
                isDarkMode
                  ? "border border-white/10 bg-slate-950/60"
                  : "border border-slate-200 bg-slate-50",
              )}
            >
              {open && (
                <p
                  className={cn(
                    "px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em]",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Mon espace
                </p>
              )}
              <div className="space-y-1">
                {candidateMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const content = (
                    <>
                      {active && (
                        <div className="absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                      )}
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          active
                            ? "bg-secondary text-white"
                            : isDarkMode
                              ? "bg-slate-950/90 text-white"
                              : "bg-slate-100 text-slate-700",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            active
                              ? "text-white"
                              : isDarkMode
                                ? "text-slate-200"
                                : "text-slate-700",
                          )}
                        />
                      </div>
                      {open && (
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            active
                              ? "text-white"
                              : isDarkMode
                                ? "text-slate-300 group-hover:text-slate-100"
                                : "text-slate-700 group-hover:text-slate-900",
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </>
                  );

                  const itemElement = item.external ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleMenuClick();
                        setSupportDialogOpen(true);
                      }}
                      className={cn(
                        `group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${sidebarHoverMotion} md:px-3 md:py-2`,
                        active
                          ? "bg-secondary text-white"
                          : isDarkMode
                            ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                            : "bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {content}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={handleMenuClick}
                      className={cn(
                        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 ${sidebarHoverMotion} md:px-3 md:py-2`,
                        active
                          ? "bg-secondary text-white"
                          : isDarkMode
                            ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                            : "bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {content}
                    </Link>
                  );

                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{itemElement}</TooltipTrigger>
                      {!open && (
                        <TooltipContent
                          side="right"
                          align="center"
                          className={cn(
                            "rounded-lg px-3 py-2 text-xs font-medium",
                            isDarkMode
                              ? "border border-white/10 bg-slate-900 text-slate-100"
                              : "border border-slate-200 bg-white text-slate-900",
                          )}
                        >
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

        {/* Footer - desktop */}
        <div
          className={cn(
            "px-2 py-4",
            isDarkMode ? "border-t border-white/5" : "border-t border-slate-200",
          )}
        >
          {open ? (
            <>
              <div className="mb-3">
                <EcoModeToggle />
              </div>
              <Button
                onClick={onLogout}
                className="w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium text-white"
                variant="ghost"
              >
                <LogOut className="h-4 w-4 text-white" /> Déconnexion
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onLogout}
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-lg",
                      isDarkMode ? "bg-slate-800/50" : "bg-slate-100 text-slate-900",
                    )}
                    variant="ghost"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className={cn(
                    "rounded-lg text-xs font-medium",
                    isDarkMode
                      ? "border border-white/10 bg-slate-900 text-slate-100"
                      : "border border-slate-200 bg-white text-slate-900",
                  )}
                >
                  Déconnexion
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </TooltipProvider>
    </aside>
    </>
  );
}

export default CandidateSidebar;
