import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, PencilLine, PlusCircle, Trash2, UploadCloud, FileText } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestion des fiches-doc</h1>
            <p className="text-sm text-muted-foreground">
              Publiez des ressources utiles pour les candidats via l’espace Fiches.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="guide-title">
              Titre
            </label>
            <Input id="guide-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Guide salaires 2026" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="guide-slug">
              Slug
            </label>
            <Input id="guide-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="guide-salaires-2026" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Catégorie</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
            <label className="text-sm font-medium text-foreground" htmlFor="guide-description">
              Description
            </label>
            <Textarea id="guide-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Résumé court du document" />
          </div>

          <div className="rounded-3xl border border-border bg-secondary/10 p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
              <span>Visible</span>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Si la fiche est masquée, elle reste disponible pour l’administration mais n’est pas visible par les candidats.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="guide-image">
              Image d’illustration (facultative)
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-background/60 p-3">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
              <Input id="guide-image" type="file" accept="image/png,image/jpeg" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="guide-document">
              Document (obligatoire)
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-background/60 p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <Input id="guide-document" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)} required />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {editingId ? (
              <Button type="button" variant="outline" className="rounded-2xl" onClick={handleCancelEdit} disabled={submitting}>
                Annuler l’édition
              </Button>
            ) : null}
            <Button type="submit" className="w-full rounded-2xl" disabled={submitting}>
              {submitting
                ? "Enregistrement en cours..."
                : editingId
                ? "Enregistrer la fiche"
                : "Publier la fiche"}
            </Button>
          </div>
        </form>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-foreground">Fiches existantes</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
            ) : guideRows.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">Aucune fiche pour le moment.</div>
            ) : (
              <div className="divide-y divide-border">
                {guideRows.map((guide) => (
                  <div key={guide.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-foreground">{guide.title}</p>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                            guide.visible
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-slate-500/10 text-slate-600"
                          }`}
                        >
                          {guide.visible ? "Visible" : "Masqué"}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{guide.category}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditGuide(guide)}>
                        <PencilLine className="mr-2 h-4 w-4" /> Modifier
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => void handleToggleVisibility(guide)}
                        disabled={submitting}
                      >
                        {guide.visible ? (
                          <EyeOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Eye className="mr-2 h-4 w-4" />
                        )}
                        {guide.visible ? "Masquer" : "Rendre visible"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void handleDelete(guide.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
