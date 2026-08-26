import type { Session } from "@supabase/supabase-js";
import React from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
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
}: AdminSidebarProps) {
  const { t } = useI18n();
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return true;
    } catch (e) {
      return true;
    }
  });

  React.useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      // ignore
    }
  }, [darkMode]);
  const navItems: { id: AdminView; label: string; icon: LucideIcon }[] = [
    {
      id: "dashboard",
      label: t("admin.sidebar.dashboard") || "Tableau de bord",
      icon: LayoutDashboard,
    },
    { id: "jobs", label: t("admin.sidebar.jobs") || "Offres", icon: Briefcase },
    { id: "analytics-offres", label: "Analytics-Offres", icon: BarChart3 },
    { id: "candidates", label: t("admin.sidebar.candidates") || "Utilisateur", icon: Users },
    { id: "guides", label: "Fiches-doc", icon: FileText },
    { id: "blog", label: t("admin.sidebar.blog") || "Blog", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "seo", label: t("admin.sidebar.seo") || "SEO", icon: Sparkles },
    { id: "privacy", label: "Politique-Conf", icon: ShieldCheck },
    { id: "legal", label: "Mentions Légales", icon: ScrollText },
    { id: "cgu", label: "CGU", icon: FileText },
    { id: "team", label: t("admin.sidebar.team") || "Équipe", icon: Users },
    { id: "faq", label: t("admin.sidebar.faq") || "FAQ", icon: FileText },
  ];

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-card text-foreground transition-all duration-300",
        open ? "w-full lg:w-60" : "w-12",
      )}
      style={{
        scrollbarColor: "rgba(148, 163, 184, 0.8) transparent",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-muted hover:text-primary"
        aria-label={open ? t("admin.sidebar.collapse") : t("admin.sidebar.expand")}
      >
        {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-12"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148, 163, 184, 0.8) rgba(15, 23, 42, 0.04)",
        }}
      >
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "group flex min-h-8 w-full items-center rounded-md px-2 py-1 text-left text-sm transition-all duration-200 ease-out hover:bg-muted hover:text-primary active:scale-[0.98]",
                  open ? "justify-start gap-3 whitespace-nowrap" : "justify-center gap-0",
                  active ? "bg-muted text-primary" : "text-slate-700",
                  !open && "w-full px-0",
                )}
                title={item.label}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", !open && "mx-auto")} />
                <span className={cn("text-sm font-medium", open ? "" : "hidden")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-slate-200 bg-slate-50/70 px-2 py-1.5">
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              "flex items-center px-2 py-1",
              open ? "justify-between gap-3" : "justify-center",
            )}
          >
            {open && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800">Mode sombre</p>
                <p className="truncate text-[10px] text-slate-500">Thème clair/sombre</p>
              </div>
            )}
            <ThemeSwitch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "group inline-flex min-h-9 w-full items-center rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
              open ? "justify-start gap-3" : "justify-center gap-0",
              !open && "px-0",
            )}
          >
            <LogOut className={cn("h-4 w-4 text-red-500", !open && "mx-auto")} />
            <span className={cn(open ? "" : "hidden")}>{t("common.signOut")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
