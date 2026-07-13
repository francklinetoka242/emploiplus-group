import { useCallback, useMemo, useState } from "react";
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
import type { CandidateLanguage, CandidateLanguageInsert } from "@/features/candidates/api/types";
import { Languages, Trash2, Edit2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PROFICIENCY_LEVELS = [
  { value: "elementary", label: "Élémentaire" },
  { value: "limited_working", label: "Limité" },
  { value: "professional_working", label: "Professionnel" },
  { value: "full_professional", label: "Courant" },
  { value: "native_bilingual", label: "Natif/Bilingue" },
];

interface LanguagesSectionProps {
  languages: CandidateLanguage[];
  loading?: boolean;
  onCreateLanguage?: (language: CandidateLanguageInsert) => Promise<void>;
  onUpdateLanguage?: (id: string, language: CandidateLanguageInsert) => Promise<void>;
  onDeleteLanguage?: (id: string) => Promise<void>;
}

interface FormData extends CandidateLanguageInsert {}

export function LanguagesSection({
  languages,
  loading,
  onCreateLanguage,
  onUpdateLanguage,
  onDeleteLanguage,
}: LanguagesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    language_name: "",
    proficiency_level: "professional_working",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = useCallback(() => {
    setFormData({
      language_name: "",
      proficiency_level: "professional_working",
    });
    setEditingId(null);
    setIsAdding(true);
  }, []);

  const handleEditClick = useCallback((language: CandidateLanguage) => {
    setFormData({
      language_name: language.language_name,
      proficiency_level: language.proficiency_level,
    });
    setEditingId(language.id);
    setIsAdding(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      language_name: "",
      proficiency_level: "professional_working",
    });
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.language_name?.trim()) {
      setError("Le nom de la langue est requis.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingId && onUpdateLanguage) {
        await onUpdateLanguage(editingId, formData);
      } else if (onCreateLanguage) {
        await onCreateLanguage(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }, [formData, editingId, onCreateLanguage, onUpdateLanguage, handleCancel]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!onDeleteLanguage) return;
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette langue ?")) return;

      try {
        setSaving(true);
        setError(null);
        await onDeleteLanguage(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setSaving(false);
      }
    },
    [onDeleteLanguage],
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

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Langue *</Label>
            <Input
              placeholder="Ex: Français, Anglais, Espagnol…"
              value={formData.language_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, language_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Niveau de maîtrise</Label>
            <Select
              value={formData.proficiency_level}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, proficiency_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

    if (!languages.length) {
      return (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 mb-4">Aucune langue ajoutée.</p>
          <Button size="sm" onClick={handleAddClick} className="bg-cyan-600 hover:bg-cyan-700">
            Ajouter une langue
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {languages.map((language) => (
          <div key={language.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="font-semibold text-slate-900">{language.language_name}</p>
              <p className="text-sm text-slate-600">
                {PROFICIENCY_LEVELS.find((l) => l.value === language.proficiency_level)?.label ||
                  language.proficiency_level}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditClick(language)}
                disabled={saving}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(language.id)}
                disabled={saving}
                className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={handleAddClick} className="mt-2">
          Ajouter une langue
        </Button>
      </div>
    );
  }, [languages, loading, isAdding, editingId, formData, saving, error, handleAddClick, handleEditClick, handleCancel, handleSave, handleDelete]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-cyan-600" />
              Langues
            </CardTitle>
            <CardDescription>Vos langues parlées et votre niveau.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
