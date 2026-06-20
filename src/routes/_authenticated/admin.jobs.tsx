import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, CrudDialog, NewButton, RowActions, useDelete } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slugify } from "@/lib/utils-ext";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  component: JobsAdmin,
});

type JobForm = {
  id?: string; slug: string; title: string; company: string; company_logo: string;
  location_city: string; location_country: string; contract_type: string;
  description: string; requirements: string;
  application_email: string; application_whatsapp: string; external_link: string;
  cover_image: string; status: "draft" | "scheduled" | "published" | "archived" | "expired";
  published_at: string; expires_at: string;
  meta_title: string; meta_description: string; og_image: string;
};
const empty: JobForm = {
  slug: "", title: "", company: "", company_logo: "", location_city: "", location_country: "",
  contract_type: "cdi", description: "", requirements: "",
  application_email: "", application_whatsapp: "", external_link: "",
  cover_image: "", status: "draft",
  published_at: "", expires_at: "",
  meta_title: "", meta_description: "", og_image: "",
};
const CONTRACTS = ["cdi", "cdd", "stage", "freelance", "consultance", "temps_partiel", "interim"];

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function JobsAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<JobForm>(empty);
  const [saving, setSaving] = useState(false);
  const { del } = useDelete("job_offers", "admin-jobs");

  const { data } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("job_offers").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (row: any) => {
    setForm({
      id: row.id, slug: row.slug, title: row.title, company: row.company,
      company_logo: row.company_logo ?? "", location_city: row.location_city ?? "",
      location_country: row.location_country ?? "", contract_type: row.contract_type ?? "cdi",
      description: row.description, requirements: row.requirements ?? "",
      application_email: row.application_email ?? "", application_whatsapp: row.application_whatsapp ?? "",
      external_link: row.external_link ?? "", cover_image: row.cover_image ?? "", status: row.status,
      published_at: toLocalInput(row.published_at),
      expires_at: toLocalInput(row.expires_at),
      meta_title: row.meta_title ?? "", meta_description: row.meta_description ?? "", og_image: row.og_image ?? "",
    });
    setOpen(true);
  };

  const boost = async (row: any) => {
    const days = parseInt(prompt("Booster pendant combien de jours ?", "7") ?? "0", 10);
    if (!days || days < 1) return;
    const until = new Date(Date.now() + days * 86400000).toISOString();
    const { error } = await supabase.from("job_offers").update({ featured_until: until } as any).eq("id", row.id);
    if (error) toast.error(error.message);
    else { toast.success(`Boosté pour ${days} jours`); qc.invalidateQueries({ queryKey: ["admin-jobs"] }); }
  };

  const save = async () => {
    if (!form.title || !form.company || !form.description) {
      toast.error("Titre, entreprise et description requis"); return;
    }
    setSaving(true);
    const publishedAtIso = form.published_at ? new Date(form.published_at).toISOString() : null;
    let status = form.status;
    if (publishedAtIso && new Date(publishedAtIso).getTime() > Date.now() && status === "published") {
      status = "scheduled";
    }
    const payload: any = {
      slug: form.slug || slugify(form.title + "-" + form.company),
      title: form.title, company: form.company,
      company_logo: form.company_logo || null,
      location_city: form.location_city || null,
      location_country: form.location_country || null,
      contract_type: form.contract_type as any,
      description: form.description,
      requirements: form.requirements || null,
      application_email: form.application_email || null,
      application_whatsapp: form.application_whatsapp || null,
      external_link: form.external_link || null,
      cover_image: form.cover_image || null,
      status,
      published_at: publishedAtIso,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_image: form.og_image || null,
    };
    const res = form.id
      ? await supabase.from("job_offers").update(payload).eq("id", form.id)
      : await supabase.from("job_offers").insert(payload);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Enregistré");
    qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    setOpen(false);
  };

  return (
    <div>
      <AdminPageHeader title="Offres d'emploi" subtitle="Créer, planifier, booster et publier des offres." action={<NewButton onClick={openNew} />} />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Boost</TableHead>
              <TableHead>Vues</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((r: any) => {
              const featured = r.featured_until && new Date(r.featured_until).getTime() > Date.now();
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-xs truncate">{r.title}</TableCell>
                  <TableCell className="text-muted-foreground">{r.company}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider
                      ${r.status === "published" ? "bg-success/15 text-success" :
                        r.status === "scheduled" ? "bg-warning/15 text-warning" :
                        r.status === "draft" ? "bg-muted text-muted-foreground" : "bg-secondary text-muted-foreground"}`}>{r.status}</span>
                  </TableCell>
                  <TableCell>
                    {featured ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand"><Sparkles className="size-3" /> Featured</span>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => boost(r)} className="h-7 text-xs">Booster</Button>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.views_count ?? 0}</TableCell>
                  <TableCell><RowActions onEdit={() => openEdit(r)} onDelete={() => del(r.id)} /></TableCell>
                </TableRow>
              );
            })}
            {(!data || data.length === 0) && (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">Aucune offre.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CrudDialog open={open} onOpenChange={setOpen} title={form.id ? "Modifier l'offre" : "Nouvelle offre"} onSubmit={save} submitting={saving}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Titre *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Entreprise *"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
          <Field label="Slug (auto si vide)"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <Field label="Type de contrat">
            <Select value={form.contract_type} onValueChange={(v) => setForm({ ...form, contract_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONTRACTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Ville"><Input value={form.location_city} onChange={(e) => setForm({ ...form, location_city: e.target.value })} /></Field>
          <Field label="Pays"><Input value={form.location_country} onChange={(e) => setForm({ ...form, location_country: e.target.value })} /></Field>
          <Field label="Logo entreprise (URL)"><Input value={form.company_logo} onChange={(e) => setForm({ ...form, company_logo: e.target.value })} /></Field>
          <Field label="Image de couverture (URL)"><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></Field>
        </div>
        <Field label="Description *"><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Profil recherché"><Textarea rows={4} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Email candidature"><Input value={form.application_email} onChange={(e) => setForm({ ...form, application_email: e.target.value })} /></Field>
          <Field label="WhatsApp (avec indicatif)"><Input value={form.application_whatsapp} onChange={(e) => setForm({ ...form, application_whatsapp: e.target.value })} /></Field>
          <Field label="Lien externe"><Input value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date publication (auto si vide)"><Input type="datetime-local" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} /></Field>
          <Field label="Date expiration"><Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></Field>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO</div>
          <Field label="Meta title"><Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} /></Field>
          <Field label="Meta description"><Textarea rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></Field>
          <Field label="OG image (URL)"><Input value={form.og_image} onChange={(e) => setForm({ ...form, og_image: e.target.value })} /></Field>
        </div>
        <Field label="Statut">
          <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="scheduled">Planifié</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
              <SelectItem value="archived">Archivé</SelectItem>
              <SelectItem value="expired">Expiré</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </CrudDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
