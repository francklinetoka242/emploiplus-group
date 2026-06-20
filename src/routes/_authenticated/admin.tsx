import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Briefcase, FileText, Home, LayoutGrid, LogOut, MessageSquare, Sparkles, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "@/components/admin/NotificationsBell";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Backoffice — EmploiPlus Group" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

const items: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Tableau de bord", icon: Home, exact: true },
  { to: "/admin/jobs", label: "Offres d'emploi", icon: Briefcase },
  { to: "/admin/services", label: "Services", icon: LayoutGrid },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/cms", label: "CMS", icon: Sparkles },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="grid lg:grid-cols-[260px_1fr] min-h-[calc(100vh-4rem)]">
      <aside className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 hidden lg:flex flex-col">
        <div className="px-3 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg gradient-brand grid place-items-center text-brand-foreground font-display font-bold shadow-brand">E+</div>
            <div>
              <div className="font-display font-bold text-sm">Backoffice</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">EmploiPlus</div>
            </div>
          </div>
          <NotificationsBell />
        </div>
        <nav className="mt-4 flex-1 space-y-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link key={it.to} to={it.to as any}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}>
                <it.icon className="size-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 pt-4 border-t border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent">
            ← Voir le site
          </Link>
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <LogOut className="size-4 mr-1.5" /> Déconnexion
          </Button>
        </div>
      </aside>

      <div className="lg:hidden border-b border-border bg-sidebar text-sidebar-foreground p-3 flex items-center gap-2 overflow-x-auto">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <Link key={it.to} to={it.to as any}
              className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap",
                active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent/40")}>
              <it.icon className="size-3.5" /> {it.label}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center gap-1">
          <NotificationsBell />
          <Button onClick={signOut} size="sm" variant="ghost" className="text-sidebar-foreground/80"><LogOut className="size-3.5" /></Button>
        </div>
      </div>

      <main className="p-6 md:p-10 bg-background">
        <Outlet />
      </main>
    </div>
  );
}
