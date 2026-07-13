import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X, Trash2 } from "lucide-react";
import type { CandidateSkill } from "@/features/candidates/api/types";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
import { useCandidateSkills } from "@/features/candidates/hooks/useCandidateSkills";
import { skillSchema, type SkillFormValues } from "@/features/forms/schemas/candidate-portfolio.schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function CandidateSkillsPage() {
  const { profile } = useCandidate();
  const { skills, loading, error: hookError, createSkill, deleteSkill } = useCandidateSkills(
    profile?.id,
  );
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? hookError;

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skill_name: "",
    },
  });

  usePageSEO({
    title: "Compétences - EmploiPlus Group",
    description: "Gérez vos compétences",
    robots: "noindex,nofollow",
  });

  const resetForm = () => {
    form.reset({ skill_name: "" });
    setError(null);
  };

  const handleAddSkill = async (values: SkillFormValues) => {
    if (!profile) {
      return;
    }

    // Check if skill already exists
    if (skills.some((s) => s.skill_name.toLowerCase() === values.skill_name.trim().toLowerCase())) {
      setError("Cette compétence est déjà ajoutée.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createSkill({
        skill_name: values.skill_name.trim(),
      });

      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ajouter la compétence.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await deleteSkill(skillId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer la compétence.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une compétence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une compétence</DialogTitle>
              <DialogDescription>
                Entrez le nom de la compétence que vous souhaitez ajouter
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(handleAddSkill)}>
                <FormField
                  control={form.control}
                  name="skill_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compétence</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Python, Leadership, Design UI, etc."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
                  <Button
                    type="submit"
                    className="bg-brand text-brand-foreground hover:bg-brand/90 text-white"
                    disabled={saving}
                  >
                    Ajouter
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes compétences</CardTitle>
          <CardDescription>
            {loading
              ? "Chargement..."
              : `${skills.length} compétence${skills.length !== 1 ? "s" : ""} ajoutée${skills.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-slate-500">Chargement des compétences...</div>
          ) : skills.length === 0 ? (
            <div className="text-center text-slate-500">
              Aucune compétence ajoutée pour le moment.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-full hover:shadow-md transition-shadow group"
                >
                  <span className="text-sm font-medium text-slate-900">{skill.skill_name}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="ml-1 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <span className="font-medium">💡 Conseil:</span> Ajouter des compétences techniques
            pertinentes augmente votre visibilité auprès des recruteurs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
