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
  HouseIcon as Home,
  SignOutIcon as LogOut,
  XIcon as X,
  IdentificationBadgeIcon as BriefcaseBusiness,
  BookOpenIcon as BookOpen,
  InfoIcon as Info,
  EnvelopeIcon as Mail,
  CaretDownIcon as ChevronDown,
  BriefcaseIcon,
  SquaresFourIcon,
  UserCircleIcon,
  FolderOpenIcon,
  NotePencilIcon,
  NotebookIcon,
  PaperPlaneTiltIcon,
  BookmarkSimpleIcon,
  BellRingingIcon,
  DiamondIcon,
  GearSixIcon,
  LifebuoyIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import EcoModeToggle from "@/components/sidebar/EcoModeToggle";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { useEcoMode } from "@/contexts/EcoModeContext";
import { Icon as UiIcon } from "@/components/ui/Icon";

interface CandidateSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogout?: () => void;
  isDrawer?: boolean;
}

const publicMenuItems = [
  { id: "public-home", label: "Accueil", icon: Home, href: "/" },
  { id: "public-blog", label: "Blog", icon: BookOpen, href: "/blog" },
  { id: "public-faq", label: "FAQ", icon: Info, href: "/faq" },
  { id: "public-about", label: "À propos", icon: Info, href: "/about" },
  { id: "public-contact", label: "Contact", icon: Mail, href: "/contact" },
];

const publicServiceItems = [
  { id: "service-hr", label: "Mise à disposition", href: "/services/mise-disposition-rh" },
  { id: "service-recruitment", label: "Recrutement", href: "/services/recrutement" },
  { id: "service-outsourcing", label: "Externalisation", href: "/services/externalisation" },
  { id: "service-training", label: "Conseil & formation RH", href: "/services/conseil-formation" },
];

const menuItems = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: SquaresFourIcon,
    href: "/candidate/dashboard",
  },
  { id: "profile", label: "Mon profil", icon: UserCircleIcon, href: "/candidate/profile" },
  { id: "documents", label: "Documents", icon: FolderOpenIcon, href: "/candidate/documents" },
  { id: "create-cv", label: "Création-CV", icon: NotePencilIcon, href: "/candidate/create-cv" },
  { id: "guides", label: "Fiches", icon: NotebookIcon, href: "/candidate/guides" },
  {
    id: "applications",
    label: "Mes candidatures",
    icon: PaperPlaneTiltIcon,
    href: "/candidate/applications",
  },
  {
    id: "saved",
    label: "Offres enregistrées",
    icon: BookmarkSimpleIcon,
    href: "/candidate/saved-jobs",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: BellRingingIcon,
    href: "/candidate/notifications",
  },
  { id: "subscription", label: "Abonnement", icon: DiamondIcon, href: "/candidate/subscription" },
  { id: "settings", label: "Compte", icon: GearSixIcon, href: "/candidate/account" },
  {
    id: "support",
    label: "Centre d'aide",
    icon: LifebuoyIcon,
    href: "https://support.emploiplus-group.com",
    external: true,
  },
];

const newMenuItemIds = new Set(["create-cv", "subscription", "support"]);

const CANDIDATE_THEME_STORAGE_KEY = "candidate-theme";

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(CANDIDATE_THEME_STORAGE_KEY);
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
    window.localStorage.setItem(CANDIDATE_THEME_STORAGE_KEY, darkMode ? "dark" : "light");
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
            "fixed left-0 top-0 z-50 h-screen w-4/5 flex flex-col md:hidden",
            isDarkMode
              ? "bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100"
              : "bg-slate-100 text-slate-900",
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
              "flex-1 overflow-y-auto px-2 py-2 scrollbar-hide",
              isDarkMode ? "" : "bg-slate-100",
            )}
          >
            <div className="space-y-2">
              {!mobileApp && (
                <div
                  className={cn(
                    "rounded-xl p-1.5",
                    isDarkMode
                      ? "border border-white/10 bg-slate-950/60"
                      : "border border-slate-200 bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between px-2 pb-1">
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
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
                            `relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 ${sidebarHoverMotion}`,
                            active
                              ? "bg-secondary text-white"
                              : isDarkMode
                                ? "bg-slate-950/90 text-slate-200 hover:bg-slate-900/90"
                                : "bg-white text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg",
                              active
                                ? "text-white"
                                : isDarkMode
                                  ? "bg-slate-950/90 text-white"
                                  : "bg-slate-100 text-slate-700",
                            )}
                          >
                            <UiIcon
                              icon={Icon}
                              size={20}
                              color="currentColor"
                              className="h-5 w-5"
                              weight={active ? "fill" : "duotone"}
                            />
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
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-lg px-3 py-1.5",
                          isDarkMode ? "bg-slate-950/90 text-slate-200" : "bg-white text-slate-700",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg",
                            isDarkMode
                              ? "bg-slate-950/90 text-white"
                              : "bg-slate-100 text-slate-700",
                          )}
                        >
                          <BriefcaseBusiness className="h-5 w-5" />
                        </div>
                        <span className="truncate text-sm font-medium">Services</span>
                      </div>
                      <div className="ml-12 space-y-1 border-l border-slate-200 pl-2 dark:border-slate-700">
                        {publicServiceItems.map((service) => (
                          <Link
                            key={service.id}
                            to={service.href}
                            onClick={handleMenuClick}
                            className={cn(
                              "block rounded-md px-2 py-1.5 text-xs transition-colors",
                              isActive(service.href)
                                ? "bg-secondary text-white"
                                : isDarkMode
                                  ? "text-slate-300 hover:bg-slate-900/90"
                                  : "text-slate-600 hover:bg-slate-50",
                            )}
                          >
                            {service.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Link
                to="/jobs"
                onClick={handleMenuClick}
                className={cn(
                  `group relative flex items-center gap-2.5 rounded-xl px-3 py-1.5 ${sidebarHoverMotion}`,
                  isActive("/jobs")
                    ? "bg-primary/10 text-primary"
                    : isDarkMode
                      ? "bg-transparent text-slate-200 hover:bg-white/5"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/70",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150",
                    isActive("/jobs")
                      ? "bg-primary/10 text-primary"
                      : isDarkMode
                        ? "bg-slate-950/90 text-slate-500 group-hover:text-primary"
                        : "bg-slate-100 text-slate-500 group-hover:text-primary",
                  )}
                >
                  <BriefcaseIcon
                    size={22}
                    weight={isActive("/jobs") ? "fill" : "duotone"}
                    className="transition-colors duration-150"
                  />
                </div>
                <span className="truncate text-sm font-medium">Emplois</span>
              </Link>

              <div
                className={cn(
                  "rounded-xl p-1.5",
                  isDarkMode
                    ? "border border-white/10 bg-slate-950/60"
                    : "border border-slate-200 bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "px-2 pb-1 text-xs font-semibold uppercase tracking-wide",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Mon espace
                </p>
                <div className="space-y-1">
                  {candidateMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const isNew = newMenuItemIds.has(item.id);
                    const content = (
                      <>
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150",
                            active
                              ? "bg-primary/10 text-primary"
                              : isDarkMode
                                ? "bg-slate-950/90 text-slate-500 group-hover:text-primary"
                                : "bg-slate-100 text-slate-500 group-hover:text-primary",
                          )}
                        >
                          <UiIcon
                            icon={Icon}
                            size={22}
                            color="currentColor"
                            className="transition-colors duration-150"
                            weight={active ? "fill" : "duotone"}
                          />
                        </div>
                        <span
                          className={cn(
                            "flex min-w-0 items-center gap-1.5 text-sm font-medium",
                            active
                              ? "text-white"
                              : isDarkMode
                                ? "text-slate-300"
                                : "text-slate-700",
                          )}
                        >
                          <span className="truncate">{item.label}</span>
                          {isNew && (
                            <span
                              aria-hidden="true"
                              className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-bold leading-none text-white"
                            >
                              Nouveau
                            </span>
                          )}
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
                            `group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left ${sidebarHoverMotion}`,
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
                          `group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 ${sidebarHoverMotion}`,
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
                  "mt-2 rounded-xl p-1.5",
                  isDarkMode
                    ? "border border-white/10 bg-slate-950/60"
                    : "border border-slate-200 bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left",
                    isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isDarkMode ? "text-slate-200" : "text-slate-800",
                        )}
                      >
                        Mode sombre
                      </p>
                      <span
                        aria-hidden="true"
                        className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-bold leading-none text-white"
                      >
                        Nouveau
                      </span>
                    </div>
                    <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                      {isDarkMode ? "Activé" : "Désactivé"}
                    </p>
                  </div>
                  <ThemeSwitch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                </div>
              </div>
              <div className="mt-2">
                <EcoModeToggle />
              </div>
            </div>
            <div
              className={cn(
                "mt-2 border-t px-1 pt-2",
                isDarkMode ? "border-white/5" : "border-slate-200",
              )}
            >
              <Button
                onClick={() => {
                  onOpenChange?.(false);
                  onLogout?.();
                }}
                className={cn(
                  `relative flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-left ${sidebarHoverMotion}`,
                  isDarkMode
                    ? "bg-transparent text-slate-200 hover:bg-white/5"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70",
                )}
                variant="ghost"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    isDarkMode ? "bg-slate-950/90 text-white" : "bg-slate-100 text-slate-700",
                  )}
                >
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="truncate text-sm font-medium">Déconnexion</span>
              </Button>
            </div>
          </nav>
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
          "fixed left-0 top-0 z-40 hidden h-screen flex-col md:flex",
          isDarkMode
            ? "bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100"
            : "bg-slate-100 text-slate-900",
          open ? "w-60" : "w-12",
        )}
        style={{ minWidth: open ? 240 : 48 }}
      >
        <div
          className={cn(
            "relative z-20 flex shrink-0 items-center",
            open ? "h-14 justify-between px-2 pt-2" : "h-24 flex-col justify-center gap-1 pt-2",
            isDarkMode ? "bg-slate-950" : "bg-slate-100",
          )}
        >
          <Link
            to="/"
            onClick={handleMenuClick}
            aria-label="EmploiPlus Group"
            className={cn(
              "flex h-10 items-center rounded-lg",
              open ? "gap-2 px-1" : "justify-center",
            )}
          >
            <img src="/Logo.png" alt="" className="h-7 w-7 rounded-lg object-cover" />
            {open && (
              <span className="font-display text-sm font-bold text-foreground">EmploiPlus</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange?.(!open)}
            className={cn(
              "h-10 w-10 rounded-lg",
              isDarkMode
                ? "text-slate-300 hover:bg-white/10 hover:text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            )}
            aria-label={open ? "Réduire le menu candidat" : "Agrandir le menu candidat"}
          >
            <SidebarSimpleIcon size={22} className={!open ? "rotate-180" : undefined} />
          </Button>
        </div>

        <TooltipProvider delayDuration={200}>
          <nav className={cn("min-h-0 flex-1 overflow-y-auto px-2 pb-1 scrollbar-hide")}>
            <div className={cn(open ? "space-y-1.5" : "space-y-1")}>
              <Link
                to="/jobs"
                onClick={handleMenuClick}
                className={cn(
                  cn(
                    `group relative mt-3 flex items-center rounded-lg ${sidebarHoverMotion}`,
                    open ? "gap-2 px-3 py-1" : "justify-center gap-1 px-1 py-1",
                  ),
                  isActive("/jobs")
                    ? "bg-primary/10 text-primary"
                    : isDarkMode
                      ? "bg-transparent text-slate-200 hover:bg-white/5"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/70",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150",
                    isActive("/jobs")
                      ? "bg-primary/10 text-primary"
                      : isDarkMode
                        ? "bg-slate-950/90 text-slate-500 group-hover:text-primary"
                        : "bg-slate-100 text-slate-500 group-hover:text-primary",
                  )}
                >
                  <BriefcaseIcon
                    size={22}
                    weight={isActive("/jobs") ? "fill" : "duotone"}
                    className="transition-colors duration-150"
                  />
                </div>
                {open && <span className="truncate text-sm font-medium">Emplois</span>}
              </Link>

              <div className={cn("rounded-lg", open ? "border-t border-slate-200/80 pt-2" : "p-1")}>
                {open && (
                  <p
                    className={cn(
                      "px-2 pb-1 text-xs font-semibold uppercase tracking-wide",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    Mon espace
                  </p>
                )}
                <div className={cn(open ? "space-y-0.5" : "space-y-0.5")}>
                  {candidateMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const isNew = newMenuItemIds.has(item.id);
                    const content = (
                      <>
                        <div
                          className={cn(
                            "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150",
                            active
                              ? "bg-primary/10 text-primary"
                              : isDarkMode
                                ? "text-slate-500 group-hover:text-primary"
                                : "bg-slate-100 text-slate-500 group-hover:text-primary",
                          )}
                        >
                          <UiIcon
                            icon={Icon}
                            size={22}
                            color="currentColor"
                            className="transition-colors duration-150"
                            weight={active ? "fill" : "duotone"}
                          />
                          {isNew && !open && (
                            <span
                              aria-hidden="true"
                              className="absolute -right-3 -top-1 rounded-full bg-red-600 px-1 py-0.5 text-[7px] font-bold leading-none text-white"
                            >
                              Nouveau
                            </span>
                          )}
                        </div>
                        {open && (
                          <span
                            className={cn(
                              "flex min-w-0 items-center gap-1.5 text-sm font-medium",
                              active
                                ? "text-primary"
                                : isDarkMode
                                  ? "text-slate-300 group-hover:text-slate-100"
                                  : "text-slate-700 group-hover:text-slate-900",
                            )}
                          >
                            <span className="truncate">{item.label}</span>
                            {isNew && (
                              <span
                                aria-hidden="true"
                                className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-bold leading-none text-white"
                              >
                                Nouveau
                              </span>
                            )}
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
                          cn(
                            "group relative flex w-full items-center rounded-lg text-left",
                            open
                              ? `gap-2 px-3 py-1 ${sidebarHoverMotion}`
                              : `justify-center gap-1 px-1 py-1 ${sidebarHoverMotion}`,
                          ),
                          active
                            ? "bg-muted text-primary"
                            : isDarkMode
                              ? "text-slate-200 hover:bg-white/5"
                              : "text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        {content}
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={handleMenuClick}
                        className={cn(
                          cn(
                            "group relative flex items-center rounded-lg",
                            open
                              ? `gap-2 px-3 py-1 ${sidebarHoverMotion}`
                              : `justify-center gap-1 px-1 py-1 ${sidebarHoverMotion}`,
                          ),
                          active
                            ? "bg-muted text-primary"
                            : isDarkMode
                              ? "text-slate-200 hover:bg-white/5"
                              : "text-slate-700 hover:bg-slate-50",
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
              {open && (
                <div className="mt-2">
                  <EcoModeToggle />
                </div>
              )}
            </div>
            <div
              className={cn(
                "mt-2 border-t px-1 pt-2",
                isDarkMode ? "border-white/5" : "border-slate-200",
              )}
            >
              {open ? (
                <Button
                  onClick={onLogout}
                  className={cn(
                    `group relative flex w-full items-center gap-2 rounded-lg px-3 py-1 ${sidebarHoverMotion}`,
                    isDarkMode
                      ? "text-slate-200 hover:bg-white/5"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                  variant="ghost"
                >
                  <div
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-lg",
                      isDarkMode ? "text-slate-200" : "bg-slate-100 text-slate-700",
                    )}
                  >
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isDarkMode
                        ? "text-slate-300 group-hover:text-slate-100"
                        : "text-slate-700 group-hover:text-slate-900",
                    )}
                  >
                    Déconnexion
                  </span>
                </Button>
              ) : (
                <div className="flex items-center justify-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onLogout}
                        size="icon"
                        className={cn(
                          "h-10 w-10 rounded-lg",
                          isDarkMode
                            ? "text-slate-200 hover:bg-white/5"
                            : "text-slate-700 hover:bg-slate-50",
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
          </nav>
        </TooltipProvider>
      </aside>
    </>
  );
}

export default CandidateSidebar;
