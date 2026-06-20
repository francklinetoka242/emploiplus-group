import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils-ext";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts_messages").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const markRead = async (id: string) => {
    const { error } = await supabase.from("contacts_messages").update({ status: "read" }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const { error } = await supabase.from("contacts_messages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["admin-messages"] }); }
  };

  return (
    <div>
      <AdminPageHeader title="Messages de contact" subtitle="Messages reçus depuis le formulaire public." />
      <div className="space-y-3">
        {(data ?? []).map((m) => (
          <div key={m.id} className={`rounded-xl border bg-card p-5 ${m.status === "new" ? "border-brand" : "border-border"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{m.name}</div>
                  {m.status === "new" && <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-brand text-brand-foreground">Nouveau</span>}
                </div>
                <a href={`mailto:${m.email}`} className="text-xs text-muted-foreground hover:text-brand inline-flex items-center gap-1 mt-0.5">
                  <Mail className="size-3" /> {m.email}
                </a>
                {m.phone && <div className="text-xs text-muted-foreground mt-0.5">{m.phone}</div>}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">{formatDate(m.created_at)}</div>
                {m.status === "new" && <Button size="sm" variant="outline" onClick={() => markRead(m.id)}><Check className="size-3.5" /></Button>}
                <Button size="sm" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="size-3.5 text-destructive" /></Button>
              </div>
            </div>
            {m.subject && <div className="text-sm font-medium mb-1">{m.subject}</div>}
            <div className="text-sm text-foreground/80 whitespace-pre-line">{m.message}</div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Aucun message.</div>
        )}
      </div>
    </div>
  );
}
