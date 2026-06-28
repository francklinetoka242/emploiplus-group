import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

export function AdminBlogCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    image: "",
    video_url: "",
    external_link: "",
    status: "draft",
    publish_at: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const slug = createSlug(form.title || `article-${Date.now()}`);
    const payload = {
      slug,
      title: form.title,
      subtitle: form.subtitle || null,
      content: form.content,
      excerpt: form.excerpt || null,
      image: form.image || null,
      video_url: form.video_url || null,
      external_link: form.external_link || null,
      category: form.category || null,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: "published" as Database["public"]["Enums"]["post_status"],
      publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
    };

    const { error } = await supabase.from("blog_posts").insert([payload]);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Article créé avec succès.");
    navigate("/admin/blog");
  };

  return (
    <div className="space-y-6">
      {usePageSEO({
        title: "Créer un article",
        description: "Publiez un nouvel article sur le blog depuis l'administration EmploiPlus.",
        canonical: `${BASE_URL}/admin/blog/new`,
        robots: "noindex,nofollow",
      })}
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Nouvel article</h1>
            <p className="mt-2 text-sm text-muted-foreground">Créez un article clair, professionnel et orienté entreprise.</p>
          </div>
          <Button size="lg" variant="outline" onClick={() => navigate("/admin/blog")}>Retour au blog</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Titre</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder="Titre de l'article" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sous-titre</label>
              <Input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Résumé sous le titre" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Extrait</label>
            <Textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={4} placeholder="Phrase d'accroche visible sur la page blog." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Contenu</label>
            <Textarea name="content" value={form.content} onChange={handleChange} required rows={8} placeholder="Rédigez votre article ici avec un message clair pour les entreprises." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Catégorie</label>
              <Input name="category" value={form.category} onChange={handleChange} placeholder="Recrutement, SaaS, RH..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Mots-clés</label>
              <Input name="tags" value={form.tags} onChange={handleChange} placeholder="talent, recrutement, marque employeur" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Image principale (URL)</label>
              <Input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Lien vidéo</label>
              <Input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Lien externe</label>
              <Input name="external_link" value={form.external_link} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Statut</label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Date de publication</label>
              <Input name="publish_at" type="datetime-local" value={form.publish_at} onChange={handleChange} />
            </div>
            <div className="pt-8 text-sm text-muted-foreground">Laisser vide pour publier immédiatement selon le statut.</div>
          </div>
          {error ? <div className="rounded-2xl bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-success/10 border border-success px-4 py-3 text-sm text-success">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
            {saving ? "Enregistrement..." : "Publier l'article"}
          </Button>
        </div>
      </form>
    </div>
  );
}
