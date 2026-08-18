import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  usePageSEO,
  BASE_URL,
  getSiteSeoSettings,
  saveSiteSeoSettings,
  type SiteSEOSettings,
} from "@/features/seo";
import { RotateCcw, Save, Sparkles } from "lucide-react";

export function AdminSEOPage() {
  const [form, setForm] = React.useState<SiteSEOSettings>(() => getSiteSeoSettings());
  const [statusMessage, setStatusMessage] = React.useState(
    "Les changements seront appliqués sur le site public.",
  );

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
      description:
        "Solutions numériques, diffusion d'offres d'emploi et services médias pour les talents et les entreprises.",
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
      <div className="space-y-3">
        <div className="rounded-[1.25rem] border border-slate-200 bg-white/90 p-3 shadow-sm md:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Administration
                </p>
                <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                  Paramètres SEO
                </h1>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Définissez les métadonnées de votre site depuis l’interface d’administration.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
              {statusMessage}
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSave}
            className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5"
          >
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <h2 className="text-base font-semibold text-slate-900">Informations du site</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                Titre du site
              </Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="EmploiPlus Group"
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Description du site"
                className="resize-none rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-sm font-medium text-slate-700">
                Mots-clés
              </Label>
              <Input
                id="keywords"
                name="keywords"
                value={form.keywords}
                onChange={handleChange}
                placeholder="emploi, recrutement, Congo"
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="canonical" className="text-sm font-medium text-slate-700">
                  URL canonique
                </Label>
                <Input
                  id="canonical"
                  name="canonical"
                  value={form.canonical}
                  onChange={handleChange}
                  placeholder="https://emploiplus.group"
                  className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="robots" className="text-sm font-medium text-slate-700">
                  Directive robots
                </Label>
                <Input
                  id="robots"
                  name="robots"
                  value={form.robots}
                  onChange={handleChange}
                  placeholder="index,follow"
                  className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImage" className="text-sm font-medium text-slate-700">
                URL de l’image Open Graph
              </Label>
              <Input
                id="ogImage"
                name="ogImage"
                value={form.ogImage}
                onChange={handleChange}
                placeholder="https://emploiplus.group/og-default.svg"
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
              />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
              <Button type="submit" className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full border-slate-200 bg-white hover:bg-slate-50"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </form>

          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Aperçu
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  emploiplus.group
                </div>
                <div className="space-y-3 p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    {form.title || "Titre du site"}
                  </h2>
                  <p className="text-sm leading-6 text-slate-600">
                    {form.description ||
                      "Ajoutez une description pour aider les moteurs de recherche à comprendre votre site."}
                  </p>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                    <p>Mots-clés : {form.keywords || "Aucun mot-clé"}</p>
                    <p className="mt-1">Canonical : {form.canonical || BASE_URL}</p>
                    <p className="mt-1">Robots : {form.robots || "index,follow"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Ce que cette page fait</p>
              <p className="mt-2 leading-6">
                Les valeurs enregistrées seront utilisées comme métadonnées par défaut pour les
                pages publiques du site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
