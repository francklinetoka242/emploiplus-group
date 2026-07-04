import React, { useEffect, useState } from "react";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Briefcase } from "lucide-react";
import { CandidateAuthService, CandidateExperience } from "@/integrations/supabase/candidate-auth";
import { useCandidate } from "@/hooks/useCandidate";

export function CandidateExperiencePage() {
  const { profile } = useCandidate();
  const [showForm, setShowForm] = useState(false);
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [currentExperience, setCurrentExperience] = useState<Partial<CandidateExperience>>({
    job_title: "",
    company: "",
    city: "",
    start_date: "",
    end_date: null,
    is_current: false,
    description: "",
  });
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const loadExperiences = async () => {
      try {
        setLoading(true);
        const data = await CandidateAuthService.getCandidateExperiences(profile.id);
        setExperiences(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les expériences.");
      } finally {
        setLoading(false);
      }
    };

    loadExperiences();
  }, [profile]);

  usePageSEO({
    title: "Expériences Professionnelles - EmploiPlus Group",
    description: "Gérez vos expériences professionnelles",
    robots: "noindex,nofollow",
  });

  const resetForm = () => {
    setCurrentExperience({
      job_title: "",
      company: "",
      city: "",
      start_date: "",
      end_date: null,
      is_current: false,
      description: "",
    });
    setEditingExperienceId(null);
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditExperience = (experience: CandidateExperience) => {
    setCurrentExperience(experience);
    setEditingExperienceId(experience.id);
    setShowForm(true);
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (!profile) {
      setError("Profil candidat non chargé.");
      return;
    }

    try {
      await CandidateAuthService.deleteCandidateExperience(experienceId);
      setExperiences((prev) => prev.filter((exp) => exp.id !== experienceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer l'expérience.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentExperience.job_title?.trim() || !currentExperience.company?.trim() || !profile) {
      return;
    }

    const experienceData = {
      job_title: currentExperience.job_title.trim(),
      company: currentExperience.company.trim(),
      city: currentExperience.city?.trim() || null,
      description: currentExperience.description?.trim() || null,
      start_date: currentExperience.start_date || "",
      end_date: currentExperience.is_current ? null : currentExperience.end_date || null,
      is_current: currentExperience.is_current ?? false,
    };

    setSaving(true);
    setError(null);

    try {
      if (editingExperienceId) {
        const updated = await CandidateAuthService.updateCandidateExperience(editingExperienceId, experienceData);
        setExperiences((prev) => prev.map((exp) => (exp.id === editingExperienceId ? updated : exp)));
      } else {
        const created = await CandidateAuthService.createCandidateExperience(profile.id, experienceData);
        setExperiences((prev) => [created, ...prev]);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'expérience.");
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
              Ajouter une expérience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExperienceId ? "Modifier une expérience professionnelle" : "Ajouter une expérience professionnelle"}</DialogTitle>
              <DialogDescription>
                Remplissez les informations de votre expérience
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Poste</Label>
                  <Input
                    id="title"
                    value={currentExperience.job_title || ""}
                    onChange={(event) => setCurrentExperience({ ...currentExperience, job_title: event.target.value })}
                    placeholder="Développeur Senior"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={currentExperience.company || ""}
                    onChange={(event) => setCurrentExperience({ ...currentExperience, company: event.target.value })}
                    placeholder="TechCorp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={currentExperience.city || ""}
                    onChange={(event) => setCurrentExperience({ ...currentExperience, city: event.target.value })}
                    placeholder="Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="month"
                    value={currentExperience.start_date || ""}
                    onChange={(event) => setCurrentExperience({ ...currentExperience, start_date: event.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="month"
                    disabled={Boolean(currentExperience.is_current)}
                    value={currentExperience.end_date ?? ""}
                    onChange={(event) => setCurrentExperience({ ...currentExperience, end_date: event.target.value })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Checkbox
                    id="isCurrent"
                    checked={Boolean(currentExperience.is_current)}
                    onCheckedChange={(checked) =>
                      setCurrentExperience({
                        ...currentExperience,
                        is_current: Boolean(checked),
                        end_date: checked ? null : currentExperience.end_date,
                      })
                    }
                  />
                  <Label htmlFor="isCurrent" className="cursor-pointer">
                    Poste actuel
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentExperience.description || ""}
                  onChange={(event) => setCurrentExperience({ ...currentExperience, description: event.target.value })}
                  placeholder="Décrivez vos responsabilités et accomplissements..."
                  rows={4}
                />
              </div>

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
                <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90 text-white">
                  {editingExperienceId ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experiences List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center text-slate-500">
            Chargement des expériences...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center text-slate-500">
            Aucune expérience professionnelle enregistrée.
          </div>
        ) : (
          experiences.map((exp) => (
            <Card key={exp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{exp.job_title}</h3>
                        <p className="text-slate-600">{exp.company}{exp.city ? ` • ${exp.city}` : ""}</p>
                      </div>
                      {exp.is_current && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Actuellement
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      {exp.start_date} - {exp.end_date ? exp.end_date : "Aujourd'hui"}
                    </p>
                    <p className="text-slate-700 mb-4">{exp.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => handleEditExperience(exp)}>
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteExperience(exp.id)}
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
