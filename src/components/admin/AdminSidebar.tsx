import type { Session } from "@supabase/supabase-js";
import React from "react";
import favicon from "@/assets/favicon.ico";
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
  PanelLeftOpen,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
  Moon,
  Sun,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

type AdminView = "dashboard" | "jobs" | "blog" | "notifications" | "team" | "seo" | "privacy" | "legal" | "cgu" | "candidates" | "guides" | "faq" | "analytics-offres";

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
  // eslint-disable-next-line no-console
  console.info("[AdminSidebar] render", { open, activeView, hasSession: !!session });
  const name =
    session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "Administrateur";
  const email = session.user?.email || "admin@emploiplus.group";
  const avatar =
    session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || "";

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
        "flex h-screen flex-col overflow-hidden bg-card text-foreground transition-all duration-300",
        open ? "w-full lg:w-72" : "w-20",
      )}
      style={{
        scrollbarColor: "rgba(148, 163, 184, 0.8) transparent",
      }}
    >
      <div className="flex items-center justify-between gap-2 px-2 pt-2 pb-2">
<div className={cn("flex min-w-0 items-center gap-2 sm:gap-3", !open && "justify-center")}> 
          {!open && (
            <button
              type="button"
              onClick={onToggle}
              className="hidden h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 lg:inline-flex"
              aria-label={t("admin.sidebar.expand")}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-1 shadow-sm", !open && "mx-auto") }>
            <img src={favicon} alt="Emploi+" className="h-full w-full object-contain" />
          </div>
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all duration-300",
              open ? "max-w-full opacity-100" : "max-w-0 opacity-0 lg:max-w-0",
            )}
          >
            <p className="truncate text-sm font-semibold">Emploi+</p>
            <p className="truncate text-[11px] text-slate-500">Dashboard pro</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200"
          aria-label={open ? t("admin.sidebar.collapse") : t("admin.sidebar.expand")}
          style={{
            boxShadow: "inset 0 0 0 1px rgba(148, 163, 184, 0.18)",
          }}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={cn(
          "relative z-10 overflow-hidden border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300",
          open ? "max-h-[12rem] opacity-100" : "max-h-0 opacity-0 lg:max-h-0",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-slate-200">{name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-2 pb-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148, 163, 184, 0.8) rgba(15, 23, 42, 0.04)",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
                open ? "justify-start gap-3 whitespace-nowrap" : "justify-center gap-0",
                active ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:text-white" : "text-slate-700",
                !open && "w-full px-0",
              )}
              title={item.label}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", !open && "mx-auto")} />
              <span
                className={cn(
                  "text-sm font-medium transition-all duration-300",
                  open ? "opacity-100" : "opacity-0 lg:opacity-0",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 bg-slate-50/70 p-2 pb-0">
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              "flex items-center px-2 py-1",
              open ? "justify-between gap-3" : "justify-center",
            )}
          >
            <div className={cn("flex min-w-0 items-center gap-3", open ? "" : "hidden")}>
              <Sun className="h-4 w-4 text-amber-500" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800">Mode sombre</p>
                <p className="truncate text-[10px] text-slate-500">Thème clair/sombre</p>
              </div>
            </div>
            <div className={cn(open ? "" : "mx-auto")}>
              <Switch checked={darkMode} onCheckedChange={(value) => setDarkMode(Boolean(value))} />
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "group inline-flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
              open ? "justify-start gap-3" : "justify-center gap-0",
              !open && "px-0",
            )}
          >
            <LogOut className={cn("h-4 w-4 text-red-500", !open && "mx-auto")} />
            <span className={cn("transition-all duration-300", open ? "opacity-100" : "opacity-0 lg:opacity-0")}>
              {t("common.signOut")}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
