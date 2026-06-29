import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageSEO, BASE_URL, getSiteSeoSettings, saveSiteSeoSettings, type SiteSEOSettings } from "@/lib/seo";
import { RotateCcw, Save, Sparkles } from "lucide-react";

export function AdminSEOPage() {
  const [form, setForm] = React.useState<SiteSEOSettings>(() => getSiteSeoSettings());
  const [statusMessage, setStatusMessage] = React.useState("Les changements seront appliqués sur le site public.");

  React.useEffect(() => {
    setForm(getSiteSeoSettings());
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const nextSettings = saveSiteSeoSettings({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      keywords: form.keywords.trim(),
      canonical: form.canonical.trim(),
      robots: form.robots.trim(),
      ogImage: form.ogImage.trim(),
    });
    setForm(nextSettings);
    setStatusMessage("Paramètres SEO enregistrés avec succès.");
  };

  const handleReset = () => {
    const defaults = saveSiteSeoSettings({
      title: "EmploiPlus Group",
      description: "Solutions numériques, diffusion d'offres d'emploi et services médias pour les talents et les entreprises.",
      keywords: "emploi, offres d'emploi, recrutement, diffusion d'annonces, Congo",
      canonical: BASE_URL,
      robots: "index,follow",
      ogImage: `${BASE_URL}/og-default.svg`,
    });
    setForm(defaults);
    setStatusMessage("Les paramètres SEO par défaut ont été restaurés.");
  };

  return (
    <>
      {usePageSEO({
        title: "SEO - Admin",
        description: "Gérez les paramètres SEO depuis l'administration EmploiPlus.",
        canonical: `${BASE_URL}/admin/seo`,
        robots: "noindex,nofollow",
      })}
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10">
                <Sparkles className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Paramètres SEO</h1>
                <p className="mt-1 text-sm text-muted-foreground">Définissez les métadonnées de votre site depuis l’interface d’administration.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              {statusMessage}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSave} className="space-y-5 rounded-[2rem] border border-border bg-card p-8 shadow-soft">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du site</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="EmploiPlus Group" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Description du site" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Mots-clés</Label>
              <Input id="keywords" name="keywords" value={form.keywords} onChange={handleChange} placeholder="emploi, recrutement, Congo" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="canonical">URL canonique</Label>
                <Input id="canonical" name="canonical" value={form.canonical} onChange={handleChange} placeholder="https://emploiplus.group" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="robots">Directive robots</Label>
                <Input id="robots" name="robots" value={form.robots} onChange={handleChange} placeholder="index,follow" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImage">URL de l’image Open Graph</Label>
              <Input id="ogImage" name="ogImage" value={form.ogImage} onChange={handleChange} placeholder="https://emploiplus.group/og-default.svg" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </form>

          <div className="space-y-4 rounded-[2rem] border border-border bg-card p-8 shadow-soft">
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Aperçu</p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">{form.title || "Titre du site"}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{form.description || "Ajoutez une description pour aider les moteurs de recherche à comprendre votre site."}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p className="font-medium">Mots-clés : {form.keywords || "Aucun mot-clé"}</p>
                <p className="mt-1">Canonical : {form.canonical || BASE_URL}</p>
                <p className="mt-1">Robots : {form.robots || "index,follow"}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-border bg-background/70 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Ce que cette page fait</p>
              <p className="mt-2">Les valeurs enregistrées seront utilisées comme métadonnées par défaut pour les pages publiques du site.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
