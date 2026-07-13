import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CandidateSkill, CandidateSkillInsert } from "@/features/candidates/api/types";
import { Sparkles, Trash2, Edit2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SkillsSectionProps {
  skills: CandidateSkill[];
  loading?: boolean;
  onCreateSkill?: (skill: CandidateSkillInsert) => Promise<void>;
  onDeleteSkill?: (id: string) => Promise<void>;
}

interface FormData extends CandidateSkillInsert {}

export function SkillsSection({
  skills,
  loading,
  onCreateSkill,
  onDeleteSkill,
}: SkillsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    skill_name: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = useCallback(() => {
    setFormData({ skill_name: "" });
    setIsAdding(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsAdding(false);
    setFormData({ skill_name: "" });
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.skill_name?.trim()) {
      setError("Le nom de la compétence est requis.");
      return;
    }

    if (!onCreateSkill) return;

    setSaving(true);
    setError(null);

    try {
      await onCreateSkill(formData);
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }, [formData, onCreateSkill, handleCancel]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!onDeleteSkill) return;
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette compétence ?")) return;

      try {
        setSaving(true);
        setError(null);
        await onDeleteSkill(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setSaving(false);
      }
    },
    [onDeleteSkill],
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
            <Label className="text-sm font-medium text-slate-700">Compétence *</Label>
            <Input
              placeholder="Ex: React, TypeScript, Gestion de projet…"
              value={formData.skill_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, skill_name: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
              {saving ? "Enregistrement…" : "Ajouter"}
            </Button>
          </div>
        </div>
      );
    }

    if (!skills.length) {
      return (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 mb-4">Aucune compétence ajoutée.</p>
          <Button size="sm" onClick={handleAddClick} className="bg-cyan-600 hover:bg-cyan-700">
            Ajouter une compétence
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-700">{skill.skill_name}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(skill.id)}
              disabled={saving}
              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={handleAddClick} className="mt-2">
          Ajouter une compétence
        </Button>
      </div>
    );
  }, [skills, loading, isAdding, formData, saving, error, handleAddClick, handleCancel, handleSave, handleDelete]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              Compétences
            </CardTitle>
            <CardDescription>Vos compétences clés et spécialisations.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
