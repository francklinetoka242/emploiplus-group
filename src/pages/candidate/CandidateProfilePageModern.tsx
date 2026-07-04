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
  gender: string;
  nationality: string;
  address: string;
  city: string;
  zipCode: string;
  about: string;
  professionalStatus: string;
  avatar: string | null;
}

const countryOptions = centralAfricaCityGroups.map((group) => group.country);

const normalizeCountryValue = (value?: string | null) => {
  const normalized = (value ?? "").trim().toLowerCase();
  const match = countryOptions.find((country) => country.toLowerCase() === normalized);
  if (match) return match;
  return countryOptions.find((country) => country.toLowerCase().includes("congo")) ?? countryOptions[0] ?? "Congo";
};

const normalizeProfessionalStatus = (value?: string | null) => {
  const normalized = (value ?? "").trim().toLowerCase();
  if (["student", "étudiant", "etudiant"].includes(normalized)) return "student";
  if (["recent-graduate", "jeune diplômé", "jeune diplome"].includes(normalized)) return "recent-graduate";
  if (["employed", "salarié", "salarie"].includes(normalized)) return "employed";
  if (["unemployed", "sans emploi"].includes(normalized)) return "unemployed";
  if (["freelance"].includes(normalized)) return "freelance";
  if (["entrepreneur"].includes(normalized)) return "entrepreneur";
  return "other";
};

const getCitiesForCountry = (country: string) => {
  const group = centralAfricaCityGroups.find((g) => g.country === country);
  return group?.cities ?? [];
};

export function CandidateProfilePageModern() {
  const { profile, updateProfile, avatarUrl, loading, saveLoading, setProfileSaveSuccess, saveSuccess } = useCandidate();
  const { translate } = useI18n();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    address: "",
    city: "",
    zipCode: "",
    about: "",
    professionalStatus: "other",
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

    setFormData({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      dateOfBirth: profile.date_of_birth ?? "",
      gender: profile.gender ?? "",
      nationality,
      address: profile.address ?? "",
      city,
      zipCode: profile.zip_code ?? "",
      about: profile.bio ?? "",
      professionalStatus: normalizeProfessionalStatus(profile.professional_status),
      avatar: profile.avatar_url ?? null,
    });
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNationalityChange = (value: string) => {
    handleInputChange("nationality", value);
    handleInputChange("city", "");
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
    if (!profile) return;

    await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationality: formData.nationality,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
      bio: formData.about,
      professionalStatus: formData.professionalStatus,
      avatarUrl: formData.avatar,
    });
  };

  const availableCities = getCitiesForCountry(formData.nationality);

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mon Profil</h1>
        <p className="text-slate-600">Complétez vos informations personnelles pour optimiser votre visibilité</p>
      </div>

      {/* Alerts */}
      {saveSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 ml-2">
            Vos informations ont été mises à jour avec succès.
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
              <Avatar className="w-24 h-24 border-4 border-slate-100">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={formData.firstName} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-lg font-bold">
                  {initials || "C"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {isEditingAvatar && (
              <div className="flex-1">
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Sélectionner une photo
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Formats acceptés: JPG, PNG. Taille max: 5MB
                </p>
              </div>
            )}
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
              <Input
                type="tel"
                placeholder="+243..."
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
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

            {/* Gender */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Genre</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Professional Status */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Statut professionnel</Label>
              <Select value={formData.professionalStatus} onValueChange={(value) => handleInputChange("professionalStatus", value)}>
                <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Étudiant(e)</SelectItem>
                  <SelectItem value="recent-graduate">Jeune diplômé(e)</SelectItem>
                  <SelectItem value="employed">En emploi</SelectItem>
                  <SelectItem value="unemployed">Demandeur d'emploi</SelectItem>
                  <SelectItem value="freelance">Freelancer</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur(e)</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Address */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Adresse</Label>
              <Input
                type="text"
                placeholder="123 Rue..."
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>

            {/* ZIP Code */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Code postal</Label>
              <Input
                type="text"
                placeholder="00000"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          </SaasGrid>
        </SaasCardContent>
      </SaasCard>

      {/* About Section */}
      <SaasCard>
        <SaasCardHeader
          title="À propos"
          subtitle="Décrivez-vous en quelques mots pour les recruteurs"
        />
        <SaasCardContent>
          <Textarea
            placeholder="Parlez de vos passions, vos motivations et vos objectifs professionnels..."
            value={formData.about}
            onChange={(e) => handleInputChange("about", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors min-h-[120px] resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">{formData.about.length}/500 caractères</p>
        </SaasCardContent>
      </SaasCard>

      {/* Save Button */}
      <div className="flex gap-3 justify-end sticky bottom-4 z-10">
        <Button
          onClick={handleSave}
          disabled={saveLoading}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {saveLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
