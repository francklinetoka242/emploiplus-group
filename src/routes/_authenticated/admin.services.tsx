import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, CrudDialog, NewButton, RowActions, useDelete } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: ServicesAdmin,
});

type F = { id?: string; title: string; description: string; icon: string; image: string; category: string; is_active: boolean; sort_order: number };
const empty: F = { title: "", description: "", icon: "", image: "", category: "", is_active: true, sort_order: 0 };

function ServicesAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<F>(empty);
  const [saving, setSaving] = useState(false);
  const { del } = useDelete("services", "admin-services");

  const { data } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (r: any) => {
    setForm({
      id: r.id, title: r.title, description: r.description, icon: r.icon ?? "",
      image: r.image ?? "", category: r.category ?? "", is_active: r.is_active, sort_order: r.sort_order ?? 0,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.description) { toast.error("Titre et description requis"); return; }
    setSaving(true);
    const payload = {
      title: form.title, description: form.description,
      icon: form.icon || null, image: form.image || null, category: form.category || null,
      is_active: form.is_active, sort_order: form.sort_order,
    };
    const res = form.id
      ? await supabase.from("services").update(payload).eq("id", form.id)
      : await supabase.from("services").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Enregistré");
    qc.invalidateQueries({ queryKey: ["admin-services"] });
    setOpen(false);
  };

  return (
    <div>
      <AdminPageHeader title="Services" subtitle="Gérer les services affichés sur le site." action={<NewButton onClick={openNew} />} />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Actif</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-muted-foreground">{r.category ?? "—"}</TableCell>
                <TableCell>{r.is_active ? "✓" : "—"}</TableCell>
                <TableCell><RowActions onEdit={() => openEdit(r)} onDelete={() => del(r.id)} /></TableCell>
              </TableRow>
            ))}
            {(!data || data.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm">Aucun service.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <CrudDialog open={open} onOpenChange={setOpen} title={form.id ? "Modifier le service" : "Nouveau service"} onSubmit={save} submitting={saving}>
        <div className="space-y-1.5"><Label className="text-xs">Titre *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Description *</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Ordre</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Image (URL)</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label className="text-xs">Actif</Label></div>
      </CrudDialog>
    </div>
  );
}
