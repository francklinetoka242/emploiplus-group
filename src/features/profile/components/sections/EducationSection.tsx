import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { CandidateEducation, CandidateEducationInsert } from "@/features/candidates/api/types";
import { GraduationCap, Trash2, Edit2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EducationSectionProps {
  educations: CandidateEducation[];
  loading?: boolean;
  onCreateEducation?: (edu: CandidateEducationInsert) => Promise<void>;
  onUpdateEducation?: (id: string, edu: CandidateEducationInsert) => Promise<void>;
  onDeleteEducation?: (id: string) => Promise<void>;
}

interface FormData extends CandidateEducationInsert {}

export function EducationSection({
  educations,
  loading,
  onCreateEducation,
  onUpdateEducation,
  onDeleteEducation,
}: EducationSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    school: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = useCallback(() => {
    setFormData({
      school: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
    });
    setEditingId(null);
    setIsAdding(true);
  }, []);

  const handleEditClick = useCallback((education: CandidateEducation) => {
    setFormData({
      school: education.school,
      degree: education.degree,
      field_of_study: education.field_of_study,
      start_date: education.start_date,
      end_date: education.end_date,
      is_current: education.is_current,
      description: education.description,
    });
    setEditingId(education.id);
    setIsAdding(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      school: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
    });
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.school?.trim() || !formData.degree?.trim()) {
      setError("L'établissement et le diplôme sont requis.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingId && onUpdateEducation) {
        await onUpdateEducation(editingId, formData);
      } else if (onCreateEducation) {
        await onCreateEducation(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }, [formData, editingId, onCreateEducation, onUpdateEducation, handleCancel]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!onDeleteEducation) return;
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) return;

      try {
        setSaving(true);
        setError(null);
        await onDeleteEducation(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setSaving(false);
      }
    },
    [onDeleteEducation],
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
              <Label className="text-sm font-medium text-slate-700">Établissement *</Label>
              <Input
                placeholder="Nom de l'établissement"
                value={formData.school}
                onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Diplôme *</Label>
              <Input
                placeholder="Ex: Licence, Master, etc."
                value={formData.degree}
                onChange={(e) => setFormData((prev) => ({ ...prev, degree: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-slate-700">Domaine d'études</Label>
              <Input
                placeholder="Ex: Informatique, Gestion, etc."
                value={formData.field_of_study || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, field_of_study: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Date de début</Label>
              <Input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value || null }))}
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
                placeholder="Décrivez votre formation, projets importants, etc…"
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
              <Label className="text-sm font-medium text-slate-700 cursor-pointer">Formation en cours</Label>
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

    if (!educations.length) {
      return <p className="text-sm text-slate-500">Aucune formation ajoutée.</p>;
    }

    return (
      <div className="space-y-3">
        {educations.map((education) => (
          <div key={education.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{education.school}</p>
                <p className="text-sm text-slate-600">{education.degree}</p>
                {education.field_of_study ? (
                  <p className="text-sm text-slate-500">{education.field_of_study}</p>
                ) : null}
                {education.start_date || education.end_date ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {education.start_date &&
                      new Date(education.start_date).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                      })}
                    {education.start_date && (education.is_current || education.end_date) ? " - " : ""}
                    {education.is_current
                      ? "Actuellement"
                      : education.end_date
                        ? new Date(education.end_date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                          })
                        : ""}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {education.is_current ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    En cours
                  </span>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditClick(education)}
                  disabled={saving}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(education.id)}
                  disabled={saving}
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {education.description ? (
              <p className="mt-2 text-sm text-slate-600">{education.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    );
  }, [educations, loading, isAdding, editingId, formData, saving, error, handleAddClick, handleEditClick, handleCancel, handleSave, handleDelete]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-cyan-600" />
              Formations et diplômes
            </CardTitle>
            <CardDescription>Votre parcours académique et certifications.</CardDescription>
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
