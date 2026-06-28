import { Link } from "react-router-dom";
import favicon from "@/assets/favicon.ico";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Briefcase, ChevronLeft, ChevronRight, FileText, LayoutDashboard, LogOut, PanelLeftOpen, Sparkles, Users, type LucideIcon } from "lucide-react";

type AdminView = "dashboard" | "jobs" | "blog" | "team" | "seo";

interface AdminSidebarProps {
  open: boolean;
  activeView: AdminView;
  onSelect: (view: AdminView) => void;
  onToggle: () => void;
  onLogout: () => void;
  session: any;
}

export function AdminSidebar({ open, activeView, onSelect, onToggle, onLogout, session }: AdminSidebarProps) {
  const { t } = useI18n();
  const name = session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "Administrateur";
  const email = session.user?.email || "admin@emploiplus.group";
  const avatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || "";

  const navItems: { id: AdminView; label: string; icon: LucideIcon }[] = [
    { id: "dashboard", label: t("admin.sidebar.dashboard"), icon: LayoutDashboard },
    { id: "jobs", label: t("admin.sidebar.jobs"), icon: Briefcase },
    { id: "blog", label: t("admin.sidebar.blog"), icon: FileText },
    { id: "seo", label: t("admin.sidebar.seo"), icon: Sparkles },
    { id: "team", label: t("admin.sidebar.team"), icon: Users },
  ];

  return (
    <aside className={cn(
      "flex min-h-[calc(100vh-48px)] flex-col gap-6 rounded-[2rem] border border-border bg-slate-950/95 p-4 text-slate-50 shadow-xl shadow-slate-950/10 transition-all duration-300",
      open ? "w-72" : "w-20",
    )}>
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          {!open && (
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-100 transition hover:bg-white/15"
              aria-label={t("admin.sidebar.expand")}
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-1 shadow-sm">
            <img src={favicon} alt="Emploi+" className="h-full w-full object-contain" />
          </div>
          <div className={cn("space-y-1 overflow-hidden transition-all duration-300", open ? "max-w-full opacity-100" : "max-w-0 opacity-0")}>
            <p className="text-sm font-semibold">Emploi+</p>
            <p className="text-xs text-slate-300">Dashboard pro</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-100 transition hover:bg-white/15"
          aria-label={open ? t("admin.sidebar.collapse") : t("admin.sidebar.expand")}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("space-y-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 transition-all duration-300", open ? "max-h-[12rem] opacity-100" : "max-h-0 opacity-0")}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl bg-slate-800">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-slate-200">{name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "group flex items-center rounded-3xl px-4 py-3 text-left transition-all duration-300 hover:bg-white/10",
                open ? "gap-3" : "justify-center",
                active ? "bg-white/10 ring-1 ring-white/20" : "",
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5 text-slate-100" />
              <span className={cn("text-sm font-medium transition-all duration-300", open ? "opacity-100" : "opacity-0")}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
        <button
          type="button"
          onClick={onLogout}
          className={cn("group inline-flex w-full items-center rounded-3xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10", open ? "gap-3" : "justify-center")}
        >
          <LogOut className="h-5 w-5 text-red-400" />
          <span className={cn("transition-all duration-300", open ? "opacity-100" : "opacity-0")}>{t("common.signOut")}</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
