import type { Session } from "@supabase/supabase-js";
import React from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  BellIcon as Bell,
  BriefcaseIcon as Briefcase,
  FileTextIcon as FileText,
  NewspaperClippingIcon,
  NotebookIcon,
  QuestionIcon,
  SquaresFourIcon as LayoutDashboard,
  SignOutIcon as LogOut,
  ScrollIcon as ScrollText,
  ShieldCheckIcon as ShieldCheck,
  MagnifyingGlassIcon as Search,
  UsersIcon as Users,
  UsersThreeIcon,
  ChartBarIcon as BarChart3,
  MoonIcon,
  SunIcon,
  SidebarSimpleIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { Icon as UiIcon } from "@/components/ui/Icon";
import { ThemeSwitch } from "@/components/ui/theme-switch";

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

interface AdminSidebarProps {
  open: boolean;
  activeView: AdminView;
  onSelect: (view: AdminView) => void;
  onToggle: () => void;
  onLogout: () => void;
  session: Session | null;
}

export function AdminSidebar({
  open,
  activeView,
  onSelect,
  onToggle,
  onLogout,
  session,
}: AdminSidebarProps) {
  const { t } = useI18n();
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("candidate-theme") ?? localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return false;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      const theme = darkMode ? "dark" : "light";
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("candidate-theme", theme);
      localStorage.setItem("theme", theme);
    } catch {
      // Theme application still works if browser storage is unavailable.
    }
  }, [darkMode]);
  const navItems: { id: AdminView; label: string; icon: PhosphorIcon }[] = [
    {
      id: "dashboard",
      label: t("admin.sidebar.dashboard") || "Tableau de bord",
      icon: LayoutDashboard,
    },
    { id: "jobs", label: t("admin.sidebar.jobs") || "Offres", icon: Briefcase },
    { id: "analytics-offres", label: "Analytics-Offres", icon: BarChart3 },
    { id: "candidates", label: t("admin.sidebar.candidates") || "Utilisateur", icon: Users },
    { id: "guides", label: "Fiches-doc", icon: NotebookIcon },
    { id: "blog", label: t("admin.sidebar.blog") || "Blog", icon: NewspaperClippingIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "seo", label: t("admin.sidebar.seo") || "SEO", icon: Search },
    { id: "privacy", label: "Politique-Conf", icon: ShieldCheck },
    { id: "legal", label: "Mentions Légales", icon: ScrollText },
    { id: "cgu", label: "CGU", icon: FileText },
    { id: "team", label: t("admin.sidebar.team") || "Équipe", icon: UsersThreeIcon },
    { id: "faq", label: t("admin.sidebar.faq") || "FAQ", icon: QuestionIcon },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden border-r border-border/70 bg-card text-foreground transition-all duration-300",
        open ? "w-full lg:w-60" : "w-12",
      )}
      style={{
        scrollbarColor: "rgba(148, 163, 184, 0.8) transparent",
      }}
    >
      <div
        className={cn(
          "relative flex h-16 shrink-0 items-center border-b border-border/70 px-2",
          open ? "justify-between" : "justify-center",
        )}
      >
        {open ? (
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/Logo.png"
              alt="EmploiPlus Group"
              className="size-9 shrink-0 rounded-lg object-cover shadow-brand"
            />
            <div className="leading-tight">
              <div className="font-display text-sm font-bold text-foreground">EmploiPlus</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Group</div>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("admin.sidebar.collapse")}
            >
              <SidebarSimpleIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex size-8 items-center justify-center rounded-lg transition hover:bg-muted"
            aria-label={t("admin.sidebar.expand")}
          >
            <img src="/Logo.png" alt="EmploiPlus Group" className="size-7 object-contain" />
          </button>
        )}
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 py-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148, 163, 184, 0.8) rgba(15, 23, 42, 0.04)",
        }}
      >
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "group flex min-h-10 w-full items-center rounded-xl px-2.5 py-2 text-left text-sm transition-all duration-200 ease-out hover:bg-muted hover:text-primary active:scale-[0.98]",
                  open ? "justify-start gap-3 whitespace-nowrap" : "justify-center gap-0",
                  active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground",
                  !open && "w-full px-0",
                )}
                title={item.label}
              >
                <UiIcon
                  icon={Icon}
                  size={18}
                  color="currentColor"
                  className={cn(
                    "size-[18px] flex-shrink-0",
                    active ? "text-primary" : "text-muted-foreground",
                    !open && "mx-auto",
                  )}
                  weight={active ? "fill" : "duotone"}
                  aria-hidden="true"
                />
                <span className={cn("text-sm font-medium", open ? "" : "hidden")}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <div
            className={cn(
              "flex min-h-10 w-full items-center rounded-xl px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary",
              open ? "justify-between gap-3" : "justify-center px-0",
            )}
            title={!open ? "Mode sombre — Thème clair/sombre" : undefined}
          >
            {open ? (
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Mode sombre</p>
                <p className="truncate text-xs text-muted-foreground">Thème clair/sombre</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDarkMode((enabled) => !enabled)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-primary"
                aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
              >
                {darkMode ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
              </button>
            )}
            {open && <ThemeSwitch checked={darkMode} onCheckedChange={setDarkMode} />}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "group flex min-h-10 w-full items-center rounded-xl px-2.5 py-2 text-left text-sm transition-all duration-200 ease-out hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]",
              open ? "justify-start gap-3 whitespace-nowrap" : "justify-center px-0",
            )}
            title={t("common.signOut")}
          >
            <LogOut className="size-[18px] flex-shrink-0" />
            <span className={cn("text-sm font-medium", open ? "" : "hidden")}>
              {t("common.signOut")}
            </span>
          </button>
        </div>
      </nav>

      <div className="mt-auto shrink-0 border-t border-border/70 bg-muted/30 px-2 py-3">
        {open && session?.user?.email && (
          <p className="truncate px-2 text-xs text-muted-foreground" title={session.user.email}>
            {session.user.email}
          </p>
        )}
      </div>
    </aside>
  );
}

export default AdminSidebar;
