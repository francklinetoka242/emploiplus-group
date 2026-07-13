import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Briefcase } from "lucide-react";
import type { CandidateExperience } from "@/features/candidates/api/types";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
import { useCandidateExperiences } from "@/features/candidates/hooks/useCandidateExperiences";
import { experienceSchema, type ExperienceFormValues } from "@/features/forms/schemas/candidate-profile-entities.schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function CandidateExperiencePage() {
  const { profile } = useCandidate();
  const {
    experiences,
    loading,
    error: hookError,
    createExperience,
    updateExperience,
    deleteExperience,
  } = useCandidateExperiences(profile?.id);
  const [showForm, setShowForm] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? hookError;

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      job_title: "",
      company: "",
      start_date: "",
      end_date: null,
      is_current: false,
      description: "",
    },
  });

  usePageSEO({
    title: "Expériences Professionnelles - EmploiPlus Group",
    description: "Gérez vos expériences professionnelles",
    robots: "noindex,nofollow",
  });

  const resetForm = () => {
    form.reset({
      job_title: "",
      company: "",
      start_date: "",
      end_date: null,
      is_current: false,
      description: "",
    });
    setEditingExperienceId(null);
  };

  function formatMonth(value: string | null | undefined) {
    if (!value) return "";
    const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
    const date = new Date(normalized as string);
    if (Number.isNaN(date.getTime())) return value as string;
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditExperience = (experience: CandidateExperience) => {
    form.reset({
      job_title: experience.job_title ?? "",
      company: experience.company ?? "",
      start_date: experience.start_date ?? "",
      end_date: experience.end_date ?? null,
      is_current: experience.is_current ?? false,
      description: experience.description ?? "",
    });
    setEditingExperienceId(experience.id);
    setShowForm(true);
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (!profile) {
      setError("Profil candidat non chargé.");
      return;
    }

    try {
      await deleteExperience(experienceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer l'expérience.");
    }
  };

  const handleSubmit = async (values: ExperienceFormValues) => {
    if (!profile) {
      return;
    }

    const normalizeMonth = (v?: string | null) => {
      if (!v) return null;
      // if already a full date, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      // month input like YYYY-MM -> convert to first day of month
      if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01`;
      return v;
    };

    const experienceData = {
      job_title: values.job_title.trim(),
      company: values.company.trim(),
      description: values.description?.trim() || null,
      start_date: normalizeMonth(values.start_date) || "",
      end_date: values.is_current ? null : normalizeMonth(values.end_date) || null,
      is_current: values.is_current ?? false,
    };

    setSaving(true);
    setError(null);

    try {
      if (editingExperienceId) {
        await updateExperience(editingExperienceId, experienceData);
      } else {
        await createExperience(experienceData);
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
        <Dialog
          open={showForm}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setShowForm(open);
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenForm}
              className="bg-brand text-brand-foreground hover:bg-brand/90 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une expérience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExperienceId
                  ? "Modifier une expérience professionnelle"
                  : "Ajouter une expérience professionnelle"}
              </DialogTitle>
              <DialogDescription>Remplissez les informations de votre expérience</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="job_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poste</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Développeur Senior" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entreprise</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="TechCorp" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de début</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de fin</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="month"
                            value={field.value ?? ""}
                            disabled={Boolean(form.watch("is_current"))}
                            onChange={(event) => field.onChange(event.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_current"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={Boolean(field.value)}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                            if (checked) {
                              form.setValue("end_date", null);
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Poste actuel</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Décrivez vos responsabilités et accomplissements..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  <Button
                    type="submit"
                    className="bg-brand text-brand-foreground hover:bg-brand/90 text-white"
                    disabled={saving}
                  >
                    {editingExperienceId ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </Form>
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
                        <p className="text-slate-600">{exp.company}</p>
                      </div>
                      {exp.is_current && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Actuellement
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      {formatMonth(exp.start_date)} -{" "}
                      {exp.is_current
                        ? "Aujourd'hui"
                        : exp.end_date
                          ? formatMonth(exp.end_date)
                          : ""}
                    </p>
                    <p className="text-slate-700 mb-4">{exp.description}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleEditExperience(exp)}
                      >
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
