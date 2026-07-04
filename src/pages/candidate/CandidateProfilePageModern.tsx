import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Camera, Save, X, User, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCandidate } from "@/hooks/useCandidate";
import { CandidateProfile } from "@/integrations/supabase/candidate-auth";
import { centralAfricaCityGroups } from "@/lib/centralAfricaCities";
import { SaasCard, SaasCardHeader, SaasCardContent, SaasCardFooter } from "@/components/candidate/SaasCard";
import { SaasGrid } from "@/components/candidate/SaasLayout";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  city: string;
  about: string;
  avatar: string | null;
}

const countryOptions = centralAfricaCityGroups.map((group) => group.country);

const normalizeCountryValue = (value?: string | null) => {
  const normalized = (value ?? "").trim().toLowerCase();
  const match = countryOptions.find((country) => country.toLowerCase() === normalized);
  if (match) return match;
  return countryOptions.find((country) => country.toLowerCase().includes("congo")) ?? countryOptions[0] ?? "Congo";
};

const getCitiesForCountry = (country: string) => {
  const group = centralAfricaCityGroups.find((g) => g.country === country);
  return group?.cities ?? [];
};

const getCountryPhoneCode = (country: string) => {
  const group = centralAfricaCityGroups.find((g) => g.country === country);
  return group?.countryCode?.replace("+", "") ?? "";
};

export function CandidateProfilePageModern() {
  const { profile, updateProfile, avatarUrl } = useCandidate();
  const { translate } = useI18n();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    city: "",
    about: "",
    avatar: null,
  });

  usePageSEO({
    title: "Mon Profil - EmploiPlus Group",
    description: "Gérez vos informations de profil candidat",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    if (!profile) return;

    const nationality = normalizeCountryValue(profile.location_country);
    const cities = getCitiesForCountry(nationality);
    const city = cities.includes(profile.location_city ?? "") ? profile.location_city ?? "" : "";
    const phoneCode = getCountryPhoneCode(nationality);

    setFormData({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone?.trim() ? profile.phone : phoneCode,
      dateOfBirth: profile.date_of_birth ?? "",
      nationality,
      city,
      about: profile.bio ?? "",
      avatar: profile.avatar_url ?? null,
    });
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneNumberChange = (value: string) => {
    const normalized = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone: `${getCountryPhoneCode(prev.nationality)}${normalized}` }));
  };

  const handleNationalityChange = (value: string) => {
    handleInputChange("nationality", value);
    handleInputChange("city", "");
    const nextCode = getCountryPhoneCode(value);
    setFormData((prev) => ({
      ...prev,
      phone: nextCode ? `${nextCode}${prev.phone ? prev.phone.replace(new RegExp(`^\\+?${nextCode}`), "") : ""}` : prev.phone,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) {
      setSaveError("Impossible de sauvegarder : profil non chargé.");
      return;
    }

    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const updates: Partial<CandidateProfile> = {
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        phone: formData.phone || null,
        date_of_birth: formData.dateOfBirth || null,
        location_country: formData.nationality || null,
        location_city: formData.city || null,
        bio: formData.about || null,
        avatar_url: formData.avatar || null,
      };

      await updateProfile(updates);
      setSaveSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue";
      setSaveError(message);
      console.error('Error saving profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const availableCities = getCitiesForCountry(formData.nationality);

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
    

      {/* Alerts */}
      {saveSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 ml-2">
            Vos informations ont été mises à jour avec succès.
          </AlertDescription>
        </Alert>
      )}
      {saveError && (
        <Alert className="border-rose-200 bg-rose-50">
          <AlertDescription className="text-rose-800">
            {saveError}
          </AlertDescription>
        </Alert>
      )}

      {/* Avatar Section */}
      <SaasCard>
        <SaasCardHeader
          title="Photo de profil"
          subtitle="Ajoutez une photo professionnelle pour améliorer votre visibilité"
          icon={<User className="w-5 h-5" />}
        />
        <SaasCardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-16 h-16 border border-slate-200">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={formData.firstName} />}
                <AvatarFallback className="bg-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-center">
                  {initials || "C"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Cette fonctionnalité sera bientôt disponible.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Vous pourrez bientôt ajouter une photo professionnelle depuis cette section.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Formats acceptés: JPG, PNG. Taille max: 5MB
                </p>
              </div>
              <div>
                <Button disabled className="bg-slate-200 text-slate-400 border-slate-200">
                  Sélectionner une photo (Bientôt)
                </Button>
              </div>
            </div>
          </div>
        </SaasCardContent>
      </SaasCard>

      {/* Contact Information */}
      <SaasCard>
        <SaasCardHeader
          title="Informations de contact"
          subtitle="Vos coordonnées personnelles et professionnelles"
          icon={<Mail className="w-5 h-5" />}
        />
        <SaasCardContent>
          <SaasGrid columns="2" gap="4">
            {/* First Name */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Prénom</Label>
              <Input
                type="text"
                placeholder="Jean"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Nom</Label>
              <Input
                type="text"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Email</Label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email non modifiable</p>
            </div>

            {/* Phone */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Téléphone</Label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <span className="px-3 py-2.5 text-sm font-medium text-slate-600 border-r border-slate-200">
                  +{getCountryPhoneCode(formData.nationality) || ""}
                </span>
                <Input
                  type="tel"
                  placeholder="numero"
                  value={
                    formData.phone
                      ? formData.phone.replace(new RegExp(`^\\+?${getCountryPhoneCode(formData.nationality)}`), "")
                      : ""
                  }
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Le code du pays est défini automatiquement selon votre pays.</p>
            </div>
          </SaasGrid>
        </SaasCardContent>
      </SaasCard>

      {/* Personal Information */}
      <SaasCard>
        <SaasCardHeader
          title="Informations personnelles"
          subtitle="Complétez votre profil avec vos données"
          icon={<User className="w-5 h-5" />}
        />
        <SaasCardContent>
          <SaasGrid columns="2" gap="4">
            {/* Date of Birth */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Date de naissance</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          </SaasGrid>
        </SaasCardContent>
      </SaasCard>

      {/* Location Information */}
      <SaasCard>
        <SaasCardHeader
          title="Localisation"
          subtitle="Votre lieu de résidence et localisation géographique"
          icon={<MapPin className="w-5 h-5" />}
        />
        <SaasCardContent>
          <SaasGrid columns="2" gap="4">
            {/* Nationality */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Pays</Label>
              <Select value={formData.nationality} onValueChange={handleNationalityChange}>
                <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Ville</Label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SaasGrid>
        </SaasCardContent>
      </SaasCard>

      {/* About Section - Professional Summary */}
      <SaasCard>
        <SaasCardHeader
          title="À propos"
          subtitle="Présentez-vous et décrivez votre expérience professionnelle"
          icon={<User className="w-5 h-5" />}
        />
        <SaasCardContent>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Votre profil</Label>
            <Textarea
              placeholder="Décrivez votre parcours professionnel, vos compétences clés et vos objectifs..."
              value={formData.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">Partagez une brève description de votre profil professionnel.</p>
          </div>
        </SaasCardContent>
      </SaasCard>

      {/* Save Button */}
      <div className="flex gap-3 justify-end sticky bottom-4 z-10">
        <Button
          type="button"
          onClick={handleSave}
          disabled={!profile || saveLoading}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {saveLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
