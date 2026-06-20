import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, FileText, MessageSquare, LayoutGrid, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function StatCard({ label, value, icon: Icon, to }: { label: string; value: number | string; icon: any; to: string }) {
  return (
    <Link to={to} className="group rounded-2xl bg-card border border-border p-6 hover:shadow-elev hover:border-brand transition-all">
      <div className="flex items-center justify-between">
        <div className="size-10 rounded-lg gradient-brand grid place-items-center text-brand-foreground"><Icon className="size-4" /></div>
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand transition-colors" />
      </div>
      <div className="mt-5 text-3xl font-display font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </Link>
  );
}

function Dashboard() {
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [jobs, services, posts, messages] = await Promise.all([
        supabase.from("job_offers").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("contacts_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return {
        jobs: jobs.count ?? 0,
        services: services.count ?? 0,
        posts: posts.count ?? 0,
        newMessages: messages.count ?? 0,
      };
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vue d'ensemble de la plateforme.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Offres d'emploi" value={counts?.jobs ?? "—"} icon={Briefcase} to="/admin/jobs" />
        <StatCard label="Services" value={counts?.services ?? "—"} icon={LayoutGrid} to="/admin/services" />
        <StatCard label="Articles blog" value={counts?.posts ?? "—"} icon={FileText} to="/admin/blog" />
        <StatCard label="Messages non lus" value={counts?.newMessages ?? "—"} icon={MessageSquare} to="/admin/messages" />
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h2 className="font-display text-lg font-bold">Bienvenue 👋</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Utilisez le menu pour gérer les offres, services, articles et messages. Pour ajouter des administrateurs,
          ajoutez leur identifiant dans la table <code className="px-1.5 py-0.5 rounded bg-secondary text-xs">user_roles</code>.
        </p>
      </div>
    </div>
  );
}
