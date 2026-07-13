import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Save, User } from "lucide-react";
import type { CandidateProfile } from "@/features/candidates/api/types";
import { centralAfricaCityGroups } from "@/data/locations";

interface ProfileSectionProps {
  profile: CandidateProfile | null;
  onSave: (updates: Partial<CandidateProfile>) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const countryOptions = centralAfricaCityGroups.map((group) => group.country);

function normalizeCountryValue(value?: string | null) {
  const normalized = (value ?? "").trim().toLowerCase();
  const match = countryOptions.find((country) => country.toLowerCase() === normalized);
  if (match) return match;
  return countryOptions[0] ?? "Congo";
}

function getCitiesForCountry(country: string) {
  const group = centralAfricaCityGroups.find((g) => g.country === country);
  return group?.cities ?? [];
}

export function ProfileSection({ profile, onSave, loading, error }: ProfileSectionProps) {
  const [formData, setFormData] = useState({
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    phone: profile?.phone ?? "",
    city: profile?.location_city ?? "",
    country: normalizeCountryValue(profile?.location_country),
    dateOfBirth: profile?.date_of_birth ?? "",
  });

  useEffect(() => {
    setFormData({
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      headline: profile?.headline ?? "",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      city: profile?.location_city ?? "",
      country: normalizeCountryValue(profile?.location_country),
      dateOfBirth: profile?.date_of_birth ?? "",
    });
  }, [profile?.first_name, profile?.last_name, profile?.headline, profile?.bio, profile?.phone, profile?.location_city, profile?.location_country, profile?.date_of_birth]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const availableCities = useMemo(() => getCitiesForCountry(formData.country), [formData.country]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setSaveError(null);
    try {
      await onSave({
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        headline: formData.headline || null,
        bio: formData.bio || null,
        phone: formData.phone || null,
        location_city: formData.city || null,
        location_country: formData.country || null,
        date_of_birth: formData.dateOfBirth || null,
      });
      setSuccess("Profil mis à jour.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'enregistrer le profil.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {success ? (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 ml-2">{success}</AlertDescription>
        </Alert>
      ) : null}

      {error ? <Alert className="border-rose-200 bg-rose-50"><AlertDescription className="text-rose-800">{error}</AlertDescription></Alert> : null}
      {saveError ? <Alert className="border-rose-200 bg-rose-50"><AlertDescription className="text-rose-800">{saveError}</AlertDescription></Alert> : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-semibold text-slate-900">Informations personnelles</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input value={formData.firstName} onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={formData.lastName} onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Titre professionnel</Label>
            <Input value={formData.headline} onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input type="tel" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+242 06 123 4567" />
          </div>
          <div className="space-y-2">
            <Label>Date de naissance</Label>
            <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Pays</Label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={formData.country}
              onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value, city: "" }))}
            >
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Ville</Label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
            >
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Résumé professionnel</Label>
            <Textarea rows={4} value={formData.bio} onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
