import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-notifications-full"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications" as any).select("*").order("created_at", { ascending: false }).limit(100);
      return (data ?? []) as any[];
    },
  });

  const markRead = async (id: string) => {
    await supabase.from("notifications" as any).update({ read_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-notifications-full"] });
    qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  return (
    <div>
      <AdminPageHeader title="Notifications" subtitle="Activité récente de la plateforme." />
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {(data ?? []).length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Aucune notification.</div>}
        {(data ?? []).map((n) => (
          <div key={n.id} className={`p-4 flex items-start justify-between gap-3 ${!n.read_at ? "bg-brand/5" : ""}`}>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-brand">{n.type}</div>
              <div className="text-sm font-semibold mt-0.5">{n.title}</div>
              {n.body && <div className="text-xs text-muted-foreground mt-1">{n.body}</div>}
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            <div className="flex flex-col gap-1">
              {n.link && <Button asChild size="sm" variant="outline"><Link to={n.link as any}>Voir</Link></Button>}
              {!n.read_at && <Button onClick={() => markRead(n.id)} size="sm" variant="ghost">Lu</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
