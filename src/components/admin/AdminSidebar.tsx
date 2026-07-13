import type { Session } from "@supabase/supabase-js";
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
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

type AdminView = "dashboard" | "jobs" | "blog" | "notifications" | "team" | "seo" | "candidates";

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
    { id: "candidates", label: t("admin.sidebar.candidates") || "Utilisateur", icon: Users },
    { id: "blog", label: t("admin.sidebar.blog") || "Blog", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "seo", label: t("admin.sidebar.seo") || "SEO", icon: Sparkles },
    { id: "team", label: t("admin.sidebar.team") || "Équipe", icon: Users },
  ];

  return (
    <aside
      className={cn(
        "flex min-h-screen lg:min-h-[calc(100vh-48px)] flex-col gap-4 sm:gap-6 rounded-none lg:rounded-[2rem] border-0 lg:border border-border bg-card p-3 sm:p-4 text-foreground shadow-none lg:shadow-soft transition-all duration-300",
        open ? "w-full lg:w-72" : "w-20",
      )}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {!open && (
            <button
              type="button"
              onClick={onToggle}
              className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-background/80 text-foreground transition hover:bg-background"
              aria-label={t("admin.sidebar.expand")}
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 sm:h-11 w-10 sm:w-11 items-center justify-center overflow-hidden rounded-2xl bg-background/80 p-1 shadow-sm flex-shrink-0">
            <img src={favicon} alt="Emploi+" className="h-full w-full object-contain" />
          </div>
          <div
            className={cn(
              "space-y-1 overflow-hidden transition-all duration-300 min-w-0",
              open ? "max-w-full opacity-100" : "max-w-0 opacity-0 lg:max-w-0",
            )}
          >
            <p className="text-sm font-semibold truncate">Emploi+</p>
            <p className="text-xs text-slate-300 truncate">Dashboard pro</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex lg:inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-100 transition hover:bg-white/15 flex-shrink-0"
          aria-label={open ? t("admin.sidebar.collapse") : t("admin.sidebar.expand")}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "space-y-2 overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-background/80 p-3 sm:p-4 transition-all duration-300",
          open ? "max-h-[12rem] opacity-100" : "max-h-0 opacity-0 lg:max-h-0",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-800 flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "group flex items-center rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base transition-all duration-300 hover:bg-white/10",
                open ? "gap-2 sm:gap-3 justify-start whitespace-nowrap" : "justify-center gap-0",
                active ? "bg-white/10 ring-1 ring-white/20" : "",
              )}
              title={item.label}
            >
              <Icon className="h-4 sm:h-5 w-4 sm:w-5 text-foreground flex-shrink-0" />
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium transition-all duration-300",
                  open ? "opacity-100" : "opacity-0 lg:opacity-0",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl sm:rounded-3xl border border-border bg-background/80 p-2 sm:p-4">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            "group inline-flex w-full items-center rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-100 transition hover:bg-white/10",
            open ? "gap-2 sm:gap-3 justify-start" : "justify-center gap-0",
          )}
        >
          <LogOut className="h-4 sm:h-5 w-4 sm:w-5 text-red-400 flex-shrink-0" />
          <span className={cn("transition-all duration-300", open ? "opacity-100" : "opacity-0 lg:opacity-0")}>
            {t("common.signOut")}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
