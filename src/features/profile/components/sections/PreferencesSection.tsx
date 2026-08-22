import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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

const MOBILITY_MODE_OPTIONS = [
  { value: "remote", label: "Télétravail" },
  { value: "hybrid", label: "Hybride" },
  { value: "onsite", label: "Sur site" },
  { value: "mobile", label: "Mobile" },
];

const SENIORITY_OPTIONS = [
  { value: "junior", label: "Junior (0-2 ans)" },
  { value: "intermediaire", label: "Intermédiaire (2-5 ans)" },
  { value: "senior", label: "Senior (5-10 ans)" },
  { value: "expert", label: "Expert (10+ ans)" },
];

const AVAILABILITY_OPTIONS = [
  { value: "immediately", label: "Disponible immédiatement" },
  { value: "two_weeks", label: "Disponible sous 2 semaines" },
  { value: "one_month", label: "Disponible sous 1 mois" },
  { value: "not_available", label: "Non disponible actuellement" },
];

const JOB_ALERT_FREQUENCY_OPTIONS = [
  { value: "immediate", label: "À chaque nouvelle offre" },
  { value: "daily", label: "Quotidienne" },
  { value: "weekly", label: "Hebdomadaire" },
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
    mobility_radius_km: 50,
    mobility_modes: [],
    salary_min: undefined,
    salary_max: undefined,
    seniority_level: "",
    availability_status: "immediately",
    availability_date: null,
    job_alerts_enabled: true,
    job_alert_frequency: "weekly",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = useCallback(() => {
    if (preferences) {
      setFormData({
        contract_types: preferences.contract_types || [],
        work_types: preferences.work_types || [],
        mobility_radius_km: preferences.mobility_radius_km ?? 50,
        mobility_modes: preferences.mobility_modes || [],
        salary_min: preferences.salary_min || undefined,
        salary_max: preferences.salary_max || undefined,
        seniority_level: preferences.seniority_level || "",
        availability_status: preferences.availability_status || "immediately",
        availability_date: preferences.availability_date || null,
        job_alerts_enabled: preferences.job_alerts_enabled ?? true,
        job_alert_frequency: preferences.job_alert_frequency || "weekly",
      });
    } else {
      setFormData({
        contract_types: [],
        work_types: [],
        mobility_radius_km: 50,
        mobility_modes: [],
        salary_min: undefined,
        salary_max: undefined,
        seniority_level: "",
        availability_status: "immediately",
        availability_date: null,
        job_alerts_enabled: true,
        job_alert_frequency: "weekly",
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

  const toggleMobilityMode = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      mobility_modes: prev.mobility_modes?.includes(value)
        ? (prev.mobility_modes ?? []).filter((mode) => mode !== value)
        : [...(prev.mobility_modes ?? []), value],
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

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-medium text-slate-700">Mobilité géographique</Label>
                <p className="text-xs text-slate-500">Rayon de recherche autour de votre ville</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {formData.mobility_radius_km ?? 50} km
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={250}
              step={10}
              value={formData.mobility_radius_km ?? 50}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  mobility_radius_km: Number(event.target.value) || 50,
                }))
              }
              className="w-full accent-primary"
            />

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Modes de mobilité</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {MOBILITY_MODE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={(formData.mobility_modes ?? []).includes(option.value)}
                      onCheckedChange={() => toggleMobilityMode(option.value)}
                    />
                    <Label className="text-sm font-normal text-slate-600 cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </div>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3 block">Disponibilité</Label>
              <div className="space-y-2">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.availability_status === option.value}
                      onCheckedChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          availability_status: prev.availability_status === option.value ? "" : option.value,
                        }))
                      }
                    />
                    <Label className="text-sm font-normal text-slate-600 cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Date de disponibilité</Label>
              <Input
                type="date"
                value={formData.availability_date ? formData.availability_date.slice(0, 10) : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability_date: e.target.value ? new Date(`${e.target.value}T12:00:00`).toISOString() : null,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-medium text-slate-700">Alertes emploi</Label>
                <p className="text-xs text-slate-500">Recevoir les opportunités qui correspondent à votre profil</p>
              </div>
              <Switch
                checked={Boolean(formData.job_alerts_enabled)}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    job_alerts_enabled: Boolean(checked),
                  }))
                }
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Fréquence</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {JOB_ALERT_FREQUENCY_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.job_alert_frequency === option.value}
                      onCheckedChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          job_alert_frequency: prev.job_alert_frequency === option.value ? "weekly" : option.value,
                        }))
                      }
                    />
                    <Label className="text-sm font-normal text-slate-600 cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
          <Button size="sm" onClick={handleEditClick} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                  <span key={ct} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
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
                  <span key={wt} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {(preferences.mobility_radius_km || (preferences.mobility_modes && preferences.mobility_modes.length > 0)) && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Mobilité</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {preferences.mobility_radius_km ?? 50} km
              </span>
              {preferences.mobility_modes?.map((mode) => {
                const label = MOBILITY_MODE_OPTIONS.find((option) => option.value === mode)?.label || mode;
                return (
                  <span key={mode} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
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

        {preferences.availability_status && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Disponibilité</p>
            <p className="text-sm text-slate-600">
              {AVAILABILITY_OPTIONS.find((o) => o.value === preferences.availability_status)?.label || preferences.availability_status}
            </p>
            {preferences.availability_date && (
              <p className="mt-1 text-xs text-slate-500">
                À partir du {new Date(preferences.availability_date).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Alertes emploi</p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-sm text-slate-600">
              {preferences.job_alerts_enabled ? "Activées" : "Désactivées"}
            </span>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {JOB_ALERT_FREQUENCY_OPTIONS.find((o) => o.value === preferences.job_alert_frequency)?.label || "Hebdomadaire"}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleEditClick}
          className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
        >
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
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Préférences RH
            </CardTitle>
            <CardDescription>Disponibilité, alertes emploi, types de contrat, salaire et niveau d'expérience.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
