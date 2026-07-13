import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { CandidateExperience, CandidateExperienceInsert } from "@/features/candidates/api/types";
import { Briefcase, Trash2, Edit2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExperienceSectionProps {
  experiences: CandidateExperience[];
  loading?: boolean;
  onCreateExperience?: (exp: CandidateExperienceInsert) => Promise<void>;
  onUpdateExperience?: (id: string, exp: CandidateExperienceInsert) => Promise<void>;
  onDeleteExperience?: (id: string) => Promise<void>;
}

interface FormData extends CandidateExperienceInsert {}

export function ExperienceSection({
  experiences,
  loading,
  onCreateExperience,
  onUpdateExperience,
  onDeleteExperience,
}: ExperienceSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    job_title: "",
    company: "",
    description: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = useCallback(() => {
    setFormData({
      job_title: "",
      company: "",
      description: "",
      start_date: "",
      end_date: "",
      is_current: false,
    });
    setEditingId(null);
    setIsAdding(true);
  }, []);

  const handleEditClick = useCallback((experience: CandidateExperience) => {
    setFormData({
      job_title: experience.job_title,
      company: experience.company,
      description: experience.description,
      start_date: experience.start_date,
      end_date: experience.end_date,
      is_current: experience.is_current,
    });
    setEditingId(experience.id);
    setIsAdding(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      job_title: "",
      company: "",
      description: "",
      start_date: "",
      end_date: "",
      is_current: false,
    });
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.job_title?.trim() || !formData.company?.trim() || !formData.start_date?.trim()) {
      setError("Le titre du poste, l'entreprise et la date de début sont requis.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingId && onUpdateExperience) {
        await onUpdateExperience(editingId, formData);
      } else if (onCreateExperience) {
        await onCreateExperience(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }, [formData, editingId, onCreateExperience, onUpdateExperience, handleCancel]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!onDeleteExperience) return;
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) return;

      try {
        setSaving(true);
        setError(null);
        await onDeleteExperience(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setSaving(false);
      }
    },
    [onDeleteExperience],
  );

  const content = useMemo(() => {
    if (loading) return <p className="text-sm text-slate-500">Chargement…</p>;

    if (isAdding) {
      return (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {error && (
            <Alert className="border-rose-200 bg-rose-50">
              <AlertDescription className="text-rose-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Titre du poste *</Label>
              <Input
                placeholder="Chef de projet"
                value={formData.job_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, job_title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Entreprise *</Label>
              <Input
                placeholder="Nom de l'entreprise"
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Date de début *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Date de fin</Label>
              <Input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value || null }))}
                disabled={formData.is_current}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                placeholder="Décrivez vos responsabilités et vos accomplissements…"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <Checkbox
                checked={formData.is_current}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_current: Boolean(checked),
                    end_date: Boolean(checked) ? null : prev.end_date,
                  }))
                }
              />
              <Label className="text-sm font-medium text-slate-700 cursor-pointer">Poste actuel</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
              {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </div>
      );
    }

    if (!experiences.length) {
      return <p className="text-sm text-slate-500">Aucune expérience ajoutée.</p>;
    }

    return (
      <div className="space-y-3">
        {experiences.map((experience) => (
          <div key={experience.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{experience.job_title}</p>
                <p className="text-sm text-slate-600">{experience.company}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(experience.start_date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                  })}
                  {" - "}
                  {experience.is_current
                    ? "Actuellement"
                    : experience.end_date
                      ? new Date(experience.end_date).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                        })
                      : "Non spécifiée"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {experience.is_current ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Poste actuel
                  </span>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditClick(experience)}
                  disabled={saving}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(experience.id)}
                  disabled={saving}
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {experience.description ? (
              <p className="mt-2 text-sm text-slate-600">{experience.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    );
  }, [experiences, loading, isAdding, editingId, formData, saving, error, handleAddClick, handleEditClick, handleCancel, handleSave, handleDelete]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-cyan-600" />
              Expériences professionnelles
            </CardTitle>
            <CardDescription>Votre parcours et vos postes successifs.</CardDescription>
          </div>
          {!isAdding && <Button size="sm" variant="outline" onClick={handleAddClick}>
            Ajouter
          </Button>}
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
