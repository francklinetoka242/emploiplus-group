import React, { useEffect, useState } from "react";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, GraduationCap } from "lucide-react";
import { CandidateAuthService, CandidateEducation } from "@/integrations/supabase/candidate-auth";
import { useCandidate } from "@/hooks/useCandidate";

const emptyEducation: Partial<CandidateEducation> = {
  school: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: null,
  is_current: false,
};

function formatMonth(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function CandidateEducationPage() {
  const { profile } = useCandidate();
  const [showForm, setShowForm] = useState(false);
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [currentEducation, setCurrentEducation] = useState<Partial<CandidateEducation>>(emptyEducation);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const loadEducations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CandidateAuthService.getCandidateEducations(profile.id);
        setEducations(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les formations.");
      } finally {
        setLoading(false);
      }
    };

    loadEducations();
  }, [profile]);

  usePageSEO({
    title: "Formations - EmploiPlus Group",
    description: "Gérez vos formations et diplômes",
    robots: "noindex,nofollow",
  });

  const resetForm = () => {
    setCurrentEducation({
      school: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: null,
      is_current: false,
    });
    setEditingEducationId(null);
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditEducation = (education: CandidateEducation) => {
    setCurrentEducation(education);
    setEditingEducationId(education.id);
    setShowForm(true);
  };

  const handleDeleteEducation = async (educationId: string) => {
    if (!profile) {
      setError("Profil candidat non chargé.");
      return;
    }

    try {
      await CandidateAuthService.deleteCandidateEducation(educationId);
      setEducations((prev) => prev.filter((education) => education.id !== educationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer la formation.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentEducation.school?.trim() || !currentEducation.degree?.trim() || !profile) {
      return;
    }

    const educationData = {
      school: currentEducation.school.trim(),
      degree: currentEducation.degree.trim(),
      field_of_study: currentEducation.field_of_study?.trim() || null,
      start_date: currentEducation.start_date || null,
      end_date: currentEducation.is_current ? null : currentEducation.end_date || null,
      is_current: currentEducation.is_current ?? false,
    };

    setSaving(true);
    setError(null);

    try {
      if (editingEducationId) {
        const updated = await CandidateAuthService.updateCandidateEducation(editingEducationId, educationData);
        setEducations((prev) => prev.map((education) => (education.id === editingEducationId ? updated : education)));
      } else {
        const created = await CandidateAuthService.createCandidateEducation(profile.id, educationData);
        setEducations((prev) => [created, ...prev]);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer la formation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); setShowForm(open); }}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenForm} className="bg-brand text-brand-foreground hover:bg-brand/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEducationId ? "Modifier une formation" : "Ajouter une formation"}</DialogTitle>
              <DialogDescription>Remplissez les détails de votre formation</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="school">École/Université</Label>
                <Input
                  id="school"
                  value={currentEducation.school || ""}
                  onChange={(event) => setCurrentEducation({ ...currentEducation, school: event.target.value })}
                  placeholder="Université Marien Ngouabi"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Diplôme</Label>
                  <Input
                    id="degree"
                    value={currentEducation.degree || ""}
                    onChange={(event) => setCurrentEducation({ ...currentEducation, degree: event.target.value })}
                    placeholder="Master, Licence, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field">Domaine</Label>
                  <Input
                    id="field"
                    value={currentEducation.field_of_study || ""}
                    onChange={(event) => setCurrentEducation({ ...currentEducation, field_of_study: event.target.value })}
                    placeholder="Informatique"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="month"
                    value={currentEducation.start_date || ""}
                    onChange={(event) => setCurrentEducation({ ...currentEducation, start_date: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="month"
                    disabled={Boolean(currentEducation.is_current)}
                    value={currentEducation.end_date || ""}
                    onChange={(event) => setCurrentEducation({ ...currentEducation, end_date: event.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="isCurrent"
                    type="checkbox"
                    checked={Boolean(currentEducation.is_current)}
                    onChange={(event) =>
                      setCurrentEducation({
                        ...currentEducation,
                        is_current: event.target.checked,
                        end_date: event.target.checked ? null : currentEducation.end_date,
                      })
                    }
                    className="h-4 w-4 rounded border border-slate-300 text-brand focus:ring-brand"
                  />
                  <Label htmlFor="isCurrent" className="cursor-pointer">
                    Formation en cours
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentEducation.description || ""}
                  onChange={(event) => setCurrentEducation({ ...currentEducation, description: event.target.value })}
                  placeholder="Décrivez votre programme, vos projets ou vos résultats..."
                  rows={3}
                />
              </div>

              {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90 text-white" disabled={saving}>
                  {editingEducationId ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center text-slate-500">
            Chargement des formations...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : educations.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center text-slate-500">
            Aucune formation enregistrée.
          </div>
        ) : (
          educations.map((edu) => (
            <Card key={edu.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">
                          {edu.degree} {edu.field_of_study ? `en ${edu.field_of_study}` : ""}
                        </h3>
                        <p className="text-slate-600">
                          {edu.school}
                          {edu.start_date || edu.end_date ? ` • ${edu.city || ""}` : ""}
                        </p>
                      </div>
                      {edu.is_current && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      {formatMonth(edu.start_date)}
                      {edu.is_current ? " - Aujourd'hui" : edu.end_date ? ` - ${formatMonth(edu.end_date)}` : ""}
                    </p>
                    <p className="text-slate-700 mb-4">{edu.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => handleEditEducation(edu)}>
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteEducation(edu.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
