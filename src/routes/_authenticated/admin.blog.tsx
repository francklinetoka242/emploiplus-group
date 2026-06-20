import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, CrudDialog, NewButton, RowActions, useDelete } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slugify } from "@/lib/utils-ext";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: BlogAdmin,
});

type F = {
  id?: string; slug: string; title: string; subtitle: string; excerpt: string;
  content: string; image: string; video_url: string; external_link: string;
  category: string; tags: string; status: "draft" | "published" | "archived";
};
const empty: F = {
  slug: "", title: "", subtitle: "", excerpt: "", content: "",
  image: "", video_url: "", external_link: "", category: "", tags: "", status: "draft",
};

function BlogAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<F>(empty);
  const [saving, setSaving] = useState(false);
  const { del } = useDelete("blog_posts", "admin-blog");

  const { data } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (r: any) => {
    setForm({
      id: r.id, slug: r.slug, title: r.title, subtitle: r.subtitle ?? "",
      excerpt: r.excerpt ?? "", content: r.content, image: r.image ?? "",
      video_url: r.video_url ?? "", external_link: r.external_link ?? "",
      category: r.category ?? "", tags: (r.tags ?? []).join(", "), status: r.status,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.content) { toast.error("Titre et contenu requis"); return; }
    setSaving(true);
    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title, subtitle: form.subtitle || null, excerpt: form.excerpt || null,
      content: form.content, image: form.image || null, video_url: form.video_url || null,
      external_link: form.external_link || null, category: form.category || null,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      status: form.status,
    };
    const res = form.id
      ? await supabase.from("blog_posts").update(payload).eq("id", form.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Enregistré");
    qc.invalidateQueries({ queryKey: ["admin-blog"] });
    setOpen(false);
  };

  return (
    <div>
      <AdminPageHeader title="Blog" subtitle="Articles et publications." action={<NewButton onClick={openNew} />} />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-muted-foreground">{r.category ?? "—"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider
                    ${r.status === "published" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                </TableCell>
                <TableCell><RowActions onEdit={() => openEdit(r)} onDelete={() => del(r.id)} /></TableCell>
              </TableRow>
            ))}
            {(!data || data.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm">Aucun article.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <CrudDialog open={open} onOpenChange={setOpen} title={form.id ? "Modifier l'article" : "Nouvel article"} onSubmit={save} submitting={saving}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Titre *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Sous-titre</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Slug (auto si vide)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Image (URL)</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Vidéo (URL embed)</Label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Tags (séparés par virgules)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs">Extrait</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Contenu *</Label><Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Statut</Label>
          <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
              <SelectItem value="archived">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CrudDialog>
    </div>
  );
}
