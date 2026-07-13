import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/i18n";
import { usePageSEO } from "@/features/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Globe, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
import type { CandidateLanguage } from "@/features/candidates/api/types";
import { useCandidateLanguages } from "@/features/candidates/hooks/useCandidateLanguages";
import { languageSchema, type LanguageFormValues } from "@/features/forms/schemas/candidate-portfolio.schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const proficiencyLevels = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
  { value: "fluent", label: "Courant" },
  { value: "native", label: "Langue maternelle" },
];

export function CandidateLanguagesPage() {
  const { t } = useI18n();
  const { profile, loading: profileLoading } = useCandidate();
  const { languages, loading, error: hookError, createLanguage, updateLanguage, deleteLanguage } =
    useCandidateLanguages(profile?.id);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? hookError;

  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: "",
      level: "beginner",
    },
  });

  usePageSEO({
    title: "Langues - EmploiPlus Group",
    description: "Gérez vos langues",
    robots: "noindex,nofollow",
  });


  const resetForm = () => {
    form.reset({ name: "", level: "beginner" });
    setEditingId(null);
    setError(null);
  };

  const handleAddLanguage = async (values: LanguageFormValues) => {
    if (!profile?.id) return;

    try {
      await createLanguage({
        language_name: values.name.trim(),
        proficiency_level: values.level,
      });

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error adding language:", err);
      setError("Impossible d'ajouter la langue. Veuillez réessayer.");
    }
  };

  const handleUpdateLanguage = async (languageId: string, values: LanguageFormValues) => {
    try {
      await updateLanguage(languageId, {
        language_name: values.name.trim(),
        proficiency_level: values.level,
      });

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error updating language:", err);
      setError("Impossible de modifier la langue. Veuillez réessayer.");
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette langue ?")) return;

    try {
      await deleteLanguage(id);
    } catch (err) {
      console.error("Error deleting language:", err);
      setError("Impossible de supprimer la langue. Veuillez réessayer.");
    }
  };

  const handleEditLanguage = (language: CandidateLanguage) => {
    form.reset({ name: language.language_name, level: language.proficiency_level });
    setEditingId(language.id);
    setShowForm(true);
  };

  const getProficiencyLabel = (value: string) => {
    return proficiencyLevels.find((l) => l.value === value)?.label || value;
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: "bg-orange-100 text-orange-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-blue-100 text-blue-800",
      fluent: "bg-green-100 text-green-800",
      native: "bg-purple-100 text-purple-800",
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-slate-600">
        Chargement de vos langues...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90 text-white gap-2"
              onClick={() => {
                resetForm();
              }}
            >
              <Plus className="w-4 h-4" />
              Ajouter une langue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier une langue" : "Ajouter une langue"}</DialogTitle>
              <DialogDescription>Entrez la langue et votre niveau de maîtrise</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((values) => {
                  if (editingId) {
                    handleUpdateLanguage(editingId, values);
                  } else {
                    handleAddLanguage(values);
                  }
                })}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Langue</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Lingala" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {proficiencyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  >
                    {editingId ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Languages List */}
      <div className="space-y-3">
        {languages.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            <p className="mb-4">Vous n'avez pas encore ajouté de langues.</p>
            <p className="text-sm">Ajoutez les langues que vous maîtrisez.</p>
          </div>
        ) : (
          languages.map((lang) => (
            <Card key={lang.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-cyan-100 rounded-lg">
                      <Globe className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{lang.language_name}</p>
                      <p
                        className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-1 ${getLevelColor(lang.proficiency_level)}`}
                      >
                        {getProficiencyLabel(lang.proficiency_level)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleEditLanguage(lang)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteLanguage(lang.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Proficiency Levels Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Niveaux de maîtrise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {proficiencyLevels.map((level) => (
              <div key={level.value} className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(level.value)}`}
                >
                  {level.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
