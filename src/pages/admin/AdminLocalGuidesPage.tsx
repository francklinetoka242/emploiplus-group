import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  PencilLine,
  PlusCircle,
  Trash2,
  UploadCloud,
  FileText,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createLocalGuide, deleteLocalGuide, fetchLocalGuides, toggleLocalGuideVisibility, updateLocalGuide } from "@/features/local-guides/localGuideService";
import type { LocalGuideRecord } from "@/features/local-guides/types";
import { toast } from "sonner";

const categories = ["Salaires", "Droit du travail", "Entretien", "Formation", "Autre"];

export function AdminLocalGuidesPage() {
  const [guides, setGuides] = useState<LocalGuideRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const data = await fetchLocalGuides();
      setGuides(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de charger les fiches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGuides();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !slug.trim() || !description.trim() || (!documentFile && !editingId)) {
      toast.error("Titre, slug, description et document sont obligatoires.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await updateLocalGuide(editingId, {
          title: title.trim(),
          slug: slug.trim(),
          category,
          description: description.trim(),
          visible,
          imageFile,
          documentFile,
        });
        toast.success("Fiche mise à jour avec succès.");
      } else {
        await createLocalGuide({
          title: title.trim(),
          slug: slug.trim(),
          category,
          description: description.trim(),
          imageFile,
          documentFile,
        });
        toast.success("Fiche créée avec succès.");
      }

      setEditingId(null);
      setTitle("");
      setSlug("");
      setCategory(categories[0]);
      setDescription("");
      setVisible(true);
      setImageFile(null);
      setDocumentFile(null);
      const inputElement = document.getElementById("guide-image") as HTMLInputElement | null;
      const docElement = document.getElementById("guide-document") as HTMLInputElement | null;
      if (inputElement) inputElement.value = "";
      if (docElement) docElement.value = "";
      await loadGuides();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l’enregistrement de la fiche.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocalGuide(id);
      toast.success("Fiche supprimée.");
      await loadGuides();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible.");
    }
  };

  const handleEditGuide = (guide: LocalGuideRecord) => {
    setEditingId(guide.id);
    setTitle(guide.title);
    setSlug(guide.slug);
    setCategory(guide.category);
    setDescription(guide.description);
    setVisible(guide.visible);
    setImageFile(null);
    setDocumentFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory(categories[0]);
    setDescription("");
    setVisible(true);
    setImageFile(null);
    setDocumentFile(null);
    setShowForm(false);
    const inputElement = document.getElementById("guide-image") as HTMLInputElement | null;
    const docElement = document.getElementById("guide-document") as HTMLInputElement | null;
    if (inputElement) inputElement.value = "";
    if (docElement) docElement.value = "";
  };

  const handleToggleVisibility = async (guide: LocalGuideRecord) => {
    try {
      setSubmitting(true);
      await toggleLocalGuideVisibility(guide.id, !guide.visible);
      toast.success(`Fiche ${guide.visible ? "masquée" : "rendue visible"}.`);
      await loadGuides();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de changer la visibilité.");
    } finally {
      setSubmitting(false);
    }
  };

  const guideRows = useMemo(() => guides, [guides]);
  const visibleCount = guides.filter((guide) => guide.visible).length;

  return (
    <div className="w-full space-y-4 p-3 md:p-5">
      <div className="w-full rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
                Administration
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Gestion des fiches-doc
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="rounded-full bg-slate-900 px-2.5 py-1.5 text-white">{guides.length} total</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
              {visibleCount} visibles
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-700">
              {guides.length - visibleCount} masquées
            </span>
            <Button
              type="button"
              size="icon"
              onClick={() => {
                setShowForm((prev) => !prev);
                if (!showForm) {
                  setEditingId(null);
                  setTitle("");
                  setSlug("");
                  setCategory(categories[0]);
                  setDescription("");
                  setVisible(true);
                  setImageFile(null);
                  setDocumentFile(null);
                }
              }}
              className="h-10 w-10 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              aria-label="Ajouter une fiche"
              title="Ajouter une fiche"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="grid w-full min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <form
            onSubmit={handleSubmit}
            className="w-full min-w-0 space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm xl:sticky xl:top-6 xl:self-start"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Modifier la fiche" : "Nouvelle fiche"}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingId ? "Mettez à jour le contenu et la visibilité." : "Créez une nouvelle ressource pour les candidats."}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <FolderOpen className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="guide-title">
                Titre
              </label>
              <Input
                id="guide-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Guide salaires 2026"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50/70 focus-visible:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="guide-slug">
                Slug
              </label>
              <Input
                id="guide-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="guide-salaires-2026"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50/70 focus-visible:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Catégorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/70 focus:ring-slate-900">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="guide-description">
                Description
              </label>
              <Textarea
                id="guide-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Résumé court du document"
                className="rounded-2xl border-slate-200 bg-slate-50/70 focus-visible:ring-slate-900"
              />
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
              <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                <span>Visible</span>
                <Switch checked={visible} onCheckedChange={setVisible} />
              </label>
              <p className="mt-2 text-xs text-slate-500">
                La fiche reste administrativement active même si elle est masquée pour les candidats.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="guide-image">
                Image d’illustration (facultative)
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
                <UploadCloud className="h-5 w-5 text-slate-500" />
                <Input
                  id="guide-image"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="guide-document">
                Document (obligatoire)
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
                <FileText className="h-5 w-5 text-slate-500" />
                <Input
                  id="guide-document"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {editingId ? (
                <Button type="button" variant="outline" className="rounded-2xl" onClick={handleCancelEdit} disabled={submitting}>
                  Annuler
                </Button>
              ) : null}
              <Button type="submit" className="ml-auto rounded-2xl bg-slate-900 text-white hover:bg-slate-800" disabled={submitting}>
                {submitting
                  ? "Enregistrement..."
                  : editingId
                    ? "Enregistrer la fiche"
                    : "Publier la fiche"}
              </Button>
            </div>
          </form>

          <div className="w-full min-w-0 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Fiches existantes</h2>
                <p className="text-sm text-slate-500">Gérez les contenus publiés et leur visibilité.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50/60">
              {loading ? (
                <div className="p-4 text-sm text-slate-500">Chargement...</div>
              ) : guideRows.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">Aucune fiche pour le moment.</div>
              ) : (
                <div className="space-y-2 p-1.5">
                  {guideRows.map((guide) => (
                    <div
                      key={guide.id}
                      className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-slate-900">{guide.title}</p>
                            <span
                              className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                guide.visible
                                  ? "bg-emerald-500/10 text-emerald-700"
                                  : "bg-slate-500/10 text-slate-600"
                              }`}
                            >
                              {guide.visible ? "Visible" : "Masqué"}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-500">{guide.category}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditGuide(guide)}
                          className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          aria-label="Modifier la fiche"
                          title="Modifier la fiche"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant={guide.visible ? "secondary" : "outline"}
                          onClick={() => void handleToggleVisibility(guide)}
                          disabled={submitting}
                          className="h-9 w-9 rounded-full"
                          aria-label={guide.visible ? "Masquer la fiche" : "Rendre la fiche visible"}
                          title={guide.visible ? "Masquer la fiche" : "Rendre la fiche visible"}
                        >
                          {guide.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => void handleDelete(guide.id)}
                          className="h-9 w-9 rounded-full"
                          aria-label="Supprimer la fiche"
                          title="Supprimer la fiche"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full min-w-0 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Fiches existantes</h2>
              <p className="text-sm text-slate-500">Gérez les contenus publiés et leur visibilité.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50/60">
            {loading ? (
              <div className="p-4 text-sm text-slate-500">Chargement...</div>
            ) : guideRows.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">Aucune fiche pour le moment.</div>
            ) : (
              <div className="space-y-2 p-1.5">
                {guideRows.map((guide) => (
                  <div
                    key={guide.id}
                    className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-slate-900">{guide.title}</p>
                          <span
                            className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                              guide.visible
                                ? "bg-emerald-500/10 text-emerald-700"
                                : "bg-slate-500/10 text-slate-600"
                            }`}
                          >
                            {guide.visible ? "Visible" : "Masqué"}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{guide.category}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleEditGuide(guide)}
                        className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        aria-label="Modifier la fiche"
                        title="Modifier la fiche"
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        variant={guide.visible ? "secondary" : "outline"}
                        onClick={() => void handleToggleVisibility(guide)}
                        disabled={submitting}
                        className="h-9 w-9 rounded-full"
                        aria-label={guide.visible ? "Masquer la fiche" : "Rendre la fiche visible"}
                        title={guide.visible ? "Masquer la fiche" : "Rendre la fiche visible"}
                      >
                        {guide.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => void handleDelete(guide.id)}
                        className="h-9 w-9 rounded-full"
                        aria-label="Supprimer la fiche"
                        title="Supprimer la fiche"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

