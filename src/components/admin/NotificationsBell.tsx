import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Notif = { id: string; type: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

export function NotificationsBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as unknown as Notif[];
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("notif-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const unread = (data ?? []).filter((n) => !n.read_at).length;

  const markAll = async () => {
    const ids = (data ?? []).filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("notifications" as any).update({ read_at: new Date().toISOString() }).in("id", ids);
    qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-semibold text-sm">Notifications</div>
          {unread > 0 && (
            <button onClick={markAll} className="text-xs text-brand hover:underline inline-flex items-center gap-1">
              <Check className="size-3" /> Tout lire
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {(data ?? []).length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Aucune notification</div>
          ) : (
            (data ?? []).map((n) => (
              <Link
                key={n.id}
                to={(n.link ?? "/admin") as any}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 ${!n.read_at ? "bg-brand/5" : ""}`}
              >
                <div className="text-xs uppercase tracking-wider font-semibold text-brand">{n.type}</div>
                <div className="text-sm font-medium mt-0.5">{n.title}</div>
                {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
