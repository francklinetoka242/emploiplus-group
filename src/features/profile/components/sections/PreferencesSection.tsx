import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { CandidatePreferences, CandidatePreferencesInsert } from "@/features/candidates/api/types";
import { SlidersHorizontal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CONTRACT_TYPE_OPTIONS = [
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "stage", label: "Stage" },
  { value: "freelance", label: "Freelance" },
  { value: "consultance", label: "Consultance" },
  { value: "temps_partiel", label: "Temps partiel" },
  { value: "interim", label: "Intérim" },
];

const WORK_TYPE_OPTIONS = [
  { value: "remote", label: "Télétravail" },
  { value: "hybrid", label: "Hybride" },
  { value: "onsite", label: "Sur site" },
];

const SENIORITY_OPTIONS = [
  { value: "junior", label: "Junior (0-2 ans)" },
  { value: "intermediaire", label: "Intermédiaire (2-5 ans)" },
  { value: "senior", label: "Senior (5-10 ans)" },
  { value: "expert", label: "Expert (10+ ans)" },
];

interface PreferencesSectionProps {
  preferences: CandidatePreferences | null;
  loading?: boolean;
  onSavePreferences?: (preferences: CandidatePreferencesInsert) => Promise<void>;
}

interface FormData extends CandidatePreferencesInsert {}

export function PreferencesSection({ preferences, loading, onSavePreferences }: PreferencesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    contract_types: [],
    work_types: [],
    salary_min: undefined,
    salary_max: undefined,
    seniority_level: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = useCallback(() => {
    if (preferences) {
      setFormData({
        contract_types: preferences.contract_types || [],
        work_types: preferences.work_types || [],
        salary_min: preferences.salary_min || undefined,
        salary_max: preferences.salary_max || undefined,
        seniority_level: preferences.seniority_level || "",
      });
    } else {
      setFormData({
        contract_types: [],
        work_types: [],
        salary_min: undefined,
        salary_max: undefined,
        seniority_level: "",
      });
    }
    setIsEditing(true);
  }, [preferences]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSavePreferences) return;

    setSaving(true);
    setError(null);

    try {
      await onSavePreferences(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }, [formData, onSavePreferences]);

  const toggleContractType = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      contract_types: prev.contract_types.includes(value)
        ? prev.contract_types.filter((t) => t !== value)
        : [...prev.contract_types, value],
    }));
  }, []);

  const toggleWorkType = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      work_types: prev.work_types.includes(value)
        ? prev.work_types.filter((t) => t !== value)
        : [...prev.work_types, value],
    }));
  }, []);

  const content = useMemo(() => {
    if (loading) return <p className="text-sm text-slate-500">Chargement…</p>;

    if (isEditing) {
      return (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {error && (
            <Alert className="border-rose-200 bg-rose-50">
              <AlertDescription className="text-rose-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Types de contrat */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">Types de contrat</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {CONTRACT_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.contract_types.includes(option.value)}
                    onCheckedChange={() => toggleContractType(option.value)}
                  />
                  <Label className="text-sm font-normal text-slate-600 cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Types de travail */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">Types de travail</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {WORK_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.work_types.includes(option.value)}
                    onCheckedChange={() => toggleWorkType(option.value)}
                  />
                  <Label className="text-sm font-normal text-slate-600 cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Salaire */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Salaire minimum (XAF)</Label>
              <Input
                type="number"
                placeholder="Ex: 500000"
                value={formData.salary_min || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, salary_min: e.target.value ? parseInt(e.target.value) : undefined }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Salaire maximum (XAF)</Label>
              <Input
                type="number"
                placeholder="Ex: 2000000"
                value={formData.salary_max || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, salary_max: e.target.value ? parseInt(e.target.value) : undefined }))}
              />
            </div>
          </div>

          {/* Niveau d'expérience */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">Niveau d'expérience</Label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {SENIORITY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.seniority_level === option.value}
                    onCheckedChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        seniority_level: prev.seniority_level === option.value ? "" : option.value,
                      }))
                    }
                  />
                  <Label className="text-sm font-normal text-slate-600 cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      );
    }

    if (!preferences || (!preferences.contract_types?.length && !preferences.salary_min && !preferences.seniority_level)) {
      return (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 mb-4">Aucune préférence configurée.</p>
          <Button size="sm" onClick={handleEditClick} className="bg-cyan-600 hover:bg-cyan-700">
            Configurer mes préférences
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {preferences.contract_types && preferences.contract_types.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Types de contrat</p>
            <div className="flex flex-wrap gap-2">
              {preferences.contract_types.map((ct) => {
                const label = CONTRACT_TYPE_OPTIONS.find((o) => o.value === ct)?.label || ct;
                return (
                  <span key={ct} className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {preferences.work_types && preferences.work_types.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Types de travail</p>
            <div className="flex flex-wrap gap-2">
              {preferences.work_types.map((wt) => {
                const label = WORK_TYPE_OPTIONS.find((o) => o.value === wt)?.label || wt;
                return (
                  <span key={wt} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {(preferences.salary_min || preferences.salary_max) && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Fourchette salariale</p>
            <p className="text-sm text-slate-600">
              {preferences.salary_min ? new Intl.NumberFormat("fr-FR").format(preferences.salary_min) : "Non renseigné"} -{" "}
              {preferences.salary_max ? new Intl.NumberFormat("fr-FR").format(preferences.salary_max) : "Non renseigné"} XAF
            </p>
          </div>
        )}

        {preferences.seniority_level && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Niveau d'expérience</p>
            <p className="text-sm text-slate-600">
              {SENIORITY_OPTIONS.find((o) => o.value === preferences.seniority_level)?.label || preferences.seniority_level}
            </p>
          </div>
        )}

        <Button size="sm" variant="outline" onClick={handleEditClick}>
          Modifier
        </Button>
      </div>
    );
  }, [loading, isEditing, formData, preferences, saving, error, handleEditClick, handleCancel, handleSave, toggleContractType, toggleWorkType]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cyan-600" />
              Préférences RH
            </CardTitle>
            <CardDescription>Types de contrat, types de travail, salaire et niveau d'expérience.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
