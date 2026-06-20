import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  component: CmsAdmin,
});

const SECTIONS: { key: string; title: string; fields: { name: string; label: string; type: "text" | "textarea" }[] }[] = [
  { key: "home.hero", title: "Hero accueil", fields: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Titre", type: "textarea" },
    { name: "subtitle", label: "Sous-titre", type: "textarea" },
    { name: "cta_primary", label: "CTA principal", type: "text" },
  ]},
  { key: "home.cta", title: "CTA Accueil", fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "subtitle", label: "Sous-titre", type: "textarea" },
    { name: "button", label: "Bouton", type: "text" },
  ]},
  { key: "home.stats", title: "Stats homepage", fields: [
    { name: "jobs_value", label: "Offres (valeur)", type: "text" },
    { name: "companies_value", label: "Entreprises (valeur)", type: "text" },
    { name: "readers_value", label: "Lecteurs (valeur)", type: "text" },
  ]},
  { key: "services.intro", title: "Intro services", fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "body", label: "Texte", type: "textarea" },
  ]},
  { key: "about.body", title: "À propos", fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "body", label: "Corps", type: "textarea" },
  ]},
  { key: "footer.about", title: "Footer — à propos", fields: [
    { name: "text", label: "Texte", type: "textarea" },
  ]},
];

function CmsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-cms"],
    queryFn: async () => {
      const { data } = await supabase.from("cms_sections" as any).select("*");
      const m = new Map<string, any>();
      (data ?? []).forEach((r: any) => m.set(r.key, r));
      return m;
    },
  });

  return (
    <div>
      <AdminPageHeader title="CMS" subtitle="Éditez les contenus dynamiques du site." />
      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <SectionEditor key={s.key} def={s} row={data?.get(s.key)} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-cms"] })} />
        ))}
      </div>
    </div>
  );
}

function SectionEditor({ def, row, onSaved }: { def: typeof SECTIONS[number]; row: any; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(row?.content_json ?? {});
  }, [row?.id]);

  const save = async () => {
    setSaving(true);
    const payload = { key: def.key, title: def.title, content_json: values };
    const res = row?.id
      ? await supabase.from("cms_sections" as any).update(payload).eq("id", row.id)
      : await supabase.from("cms_sections" as any).insert(payload);
    setSaving(false);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Enregistré"); onSaved(); }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40">
        <div>
          <div className="font-display font-bold">{def.title}</div>
          <div className="text-xs text-muted-foreground font-mono">{def.key}</div>
        </div>
        <div className="text-xs text-muted-foreground">{open ? "−" : "+"}</div>
      </button>
      {open && (
        <div className="p-5 border-t border-border space-y-3">
          {def.fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label className="text-xs">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea rows={3} value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              ) : (
                <Input value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              )}
            </div>
          ))}
          <Button onClick={save} disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand/90">
            {saving ? "..." : "Enregistrer"}
          </Button>
        </div>
      )}
    </div>
  );
}
