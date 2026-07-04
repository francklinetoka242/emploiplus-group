import React, { useEffect, useState } from "react";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save } from "lucide-react";
import { CandidateAuthService, CandidatePreferences } from "@/integrations/supabase/candidate-auth";
import { useCandidate } from "@/hooks/useCandidate";

const contractOptions = [
  { id: "cdi", label: "CDI" },
  { id: "cdd", label: "CDD" },
  { id: "freelance", label: "Freelance" },
  { id: "stage", label: "Stage" },
];

const workOptions = [
  { id: "fulltime", label: "Temps plein" },
  { id: "parttime", label: "Temps partiel" },
  { id: "remote", label: "Télétravail" },
  { id: "hybrid", label: "Hybride" },
];

const seniorityOptions = [
  { value: "junior", label: "Junior (0-2 ans)" },
  { value: "confirmed", label: "Confirmé (2-5 ans)" },
  { value: "senior", label: "Senior (5+ ans)" },
  { value: "expert", label: "Expert (10+ ans)" },
];

export function CandidatePreferencesPage() {
  const { profile } = useCandidate();
  const [preferences, setPreferences] = useState({
    contracts: [] as string[],
    workTypes: [] as string[],
    salaryMin: 0,
    salaryMax: 0,
    seniority: "confirmed",
  });
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CandidateAuthService.getCandidatePreferences(profile.id);

        if (data) {
          setPreferences({
            contracts: data.contract_types || [],
            workTypes: data.work_types || [],
            salaryMin: data.salary_min || 0,
            salaryMax: data.salary_max || 0,
            seniority: data.seniority_level || "confirmed",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les préférences.");
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [profile]);

  usePageSEO({
    title: "Préférences d'emploi - EmploiPlus Group",
    description: "Gérez vos préférences d'emploi",
    robots: "noindex,nofollow",
  });

  const togglePreference = (field: string, value: string) => {
    setPreferences((prev) => {
      const fieldArray = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: fieldArray.includes(value)
          ? fieldArray.filter((item) => item !== value)
          : [...fieldArray, value],
      };
    });
  };

  const handleSave = async () => {
    if (!profile) {
      setError("Profil candidat non chargé.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await CandidateAuthService.saveCandidatePreferences(profile.id, {
        contract_types: preferences.contracts,
        work_types: preferences.workTypes,
        salary_min: preferences.salaryMin,
        salary_max: preferences.salaryMax,
        seniority_level: preferences.seniority,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer les préférences.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Préférences d'emploi</h1>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {showSuccess && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="text-emerald-900">
            Vos préférences ont bien été enregistrées.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-900">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Type de contrat</CardTitle>
          <CardDescription>Choisissez les contrats qui vous intéressent.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {contractOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <Checkbox
                  checked={preferences.contracts.includes(option.id)}
                  onCheckedChange={() => togglePreference("contracts", option.id)}
                />
                <span className="text-sm font-medium text-slate-800">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Type de travail</CardTitle>
          <CardDescription>Choisissez vos modes de travail préférés.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {workOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <Checkbox
                  checked={preferences.workTypes.includes(option.id)}
                  onCheckedChange={() => togglePreference("workTypes", option.id)}
                />
                <span className="text-sm font-medium text-slate-800">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salaire souhaité</CardTitle>
          <CardDescription>Définissez votre fourchette salariale annuelle.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="salaryMin">Minimum</Label>
              <Input
                id="salaryMin"
                type="number"
                value={preferences.salaryMin}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    salaryMin: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Maximum</Label>
              <Input
                id="salaryMax"
                type="number"
                value={preferences.salaryMax}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    salaryMax: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Niveau d'expérience</CardTitle>
          <CardDescription>Choisissez votre niveau d'expérience.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.seniority}
            onValueChange={(value) => setPreferences((prev) => ({ ...prev, seniority: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seniorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand text-brand-foreground hover:bg-brand/90 text-white gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer les préférences"}
        </Button>
      </div>
    </div>
  );
}
