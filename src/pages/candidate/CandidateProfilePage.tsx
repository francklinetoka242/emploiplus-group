import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Camera, Save, X, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCandidate } from "@/hooks/useCandidate";
import { CandidateProfile } from "@/integrations/supabase/candidate-auth";
import { centralAfricaCityGroups } from "@/lib/centralAfricaCities";

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
  if (["recent-graduate", "jeune diplômé", "jeune diplome", "jeune diplômé(e)", "jeune diplome(e)"].includes(normalized)) return "recent-graduate";
  if (["employed", "salarié", "salarie"].includes(normalized)) return "employed";
  if (["unemployed", "sans emploi"].includes(normalized)) return "unemployed";
  if (["freelance", "freelance"].includes(normalized)) return "freelance";
  if (["entrepreneur"].includes(normalized)) return "entrepreneur";

  return "other";
};

const createProfileFormData = (profile: CandidateProfile | null): ProfileFormData => ({
  firstName: profile?.first_name ?? "",
  lastName: profile?.last_name ?? "",
  email: profile?.email ?? "",
  phone: profile?.phone ?? "",
  dateOfBirth: profile?.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
  gender: "male",
  nationality: normalizeCountryValue(profile?.location_country),
  address: "",
  city: profile?.location_city ?? "",
  zipCode: "",
  about: profile?.bio ?? "",
  professionalStatus: normalizeProfessionalStatus(profile?.headline),
  avatar: profile?.avatar_url ?? null,
});

const professionalStatusOptions = [
  { value: "student", label: "Étudiant" },
  { value: "recent-graduate", label: "Jeune diplômé" },
  { value: "employed", label: "Salarié" },
  { value: "unemployed", label: "Sans emploi" },
  { value: "freelance", label: "Freelance" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "other", label: "Autre" },
];

const genderOptions = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
];

const countryOptionItems = countryOptions.map((country) => ({ value: country, label: country }));

export function CandidateProfilePage() {
  const { t } = useI18n();
  const { profile, loading, error, updateProfile } = useCandidate();
  const [formData, setFormData] = useState<ProfileFormData>(createProfileFormData(null));
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  usePageSEO({
    title: "Mon Profil - EmploiPlus Group",
    description: "Gérez votre profil candidat",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    setFormData(createProfileFormData(profile));
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSaveError("");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSaveError("");
  };

  const handleSave = async () => {
    if (!profile) {
      setSaveError("Veuillez vous reconnecter pour modifier votre profil.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await updateProfile({
        first_name: formData.firstName.trim() || profile.first_name,
        last_name: formData.lastName.trim() || profile.last_name,
        email: formData.email.trim() || profile.email,
        phone: formData.phone.trim() || profile.phone,
        location_city: formData.city.trim() || null,
        location_country: formData.nationality || null,
        date_of_birth: formData.dateOfBirth || null,
        bio: formData.about.trim() || null,
        headline: formData.professionalStatus === "other" ? null : formData.professionalStatus,
        avatar_url: formData.avatar || null,
      });

      setEditMode(false);
      setSuccessMessage("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de mettre à jour votre profil.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(createProfileFormData(profile));
    setEditMode(false);
    setSaveError("");
  };

  const getInitials = () => {
    const firstInitial = formData.firstName?.trim()?.[0] ?? "";
    const lastInitial = formData.lastName?.trim()?.[0] ?? "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getProfessionalStatusLabel = () => {
    return (
      professionalStatusOptions.find((opt) => opt.value === formData.professionalStatus)
        ?.label || "Non spécifié"
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-slate-600">
        Chargement de votre profil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-slate-600">
        Veuillez vous reconnecter pour consulter votre profil.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-600">Gérez vos informations personnelles</p>
        </div>
        {!editMode && (
          <Button
            onClick={() => setEditMode(true)}
            className="bg-brand text-brand-foreground hover:bg-brand/90 text-white"
          >
            Modifier
          </Button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Avatar Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={formData.avatar ?? undefined} alt={formData.firstName || "Candidat"} />
                <AvatarFallback className="bg-slate-200 text-slate-500 text-2xl font-semibold flex items-center justify-center">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <button className="absolute bottom-0 right-0 p-2 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-shadow">
                  <Camera className="w-5 h-5 text-slate-600" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {formData.firstName || "Prénom"} {formData.lastName || "Nom"}
              </h2>
              <p className="text-slate-600">{formData.email || "Aucune adresse email"}</p>
              <p className="text-sm text-slate-500 mt-2">
                Situation: <span className="font-medium text-slate-900">{getProfessionalStatusLabel()}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos données personnelles de base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="prenom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="nom"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre.email@exemple.cg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700">
                    Téléphone
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center rounded-md border border-slate-300 px-3 py-2 bg-slate-50 min-w-fit">
                      <span className="text-sm font-medium text-slate-600">
                        {centralAfricaCityGroups.find((g) => g.country === formData.nationality)?.countryCode || "+242"}
                      </span>
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="000 00 00"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-slate-700">
                    Date de naissance
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-slate-700">
                    Sexe
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nationality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="text-slate-700">
                    Pays
                  </Label>
                  <Select
                    value={formData.nationality}
                    onValueChange={(value) => {
                      handleSelectChange("nationality", value);
                      handleSelectChange("city", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptionItems.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700">
                  Adresse
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Avenue du Commerce"
                />
              </div>

              {/* City and Zip Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-slate-700">
                    Ville
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleSelectChange("city", value)}
                    disabled={!formData.nationality}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {(centralAfricaCityGroups.find((group) => group.country === formData.nationality)?.cities ?? []).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-slate-700">
                    Code postal
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="001"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600">Prénom</p>
                  <p className="font-medium text-slate-900">{formData.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Nom</p>
                  <p className="font-medium text-slate-900">{formData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Téléphone</p>
                  <p className="font-medium text-slate-900">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date de naissance</p>
                  <p className="font-medium text-slate-900">{formData.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Sexe</p>
                  <p className="font-medium text-slate-900">
                    {genderOptions.find((o) => o.value === formData.gender)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pays</p>
                  <p className="font-medium text-slate-900">{formData.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ville</p>
                  <p className="font-medium text-slate-900">{formData.city}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Adresse</p>
                <p className="font-medium text-slate-900">{formData.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Situation */}
      <Card>
        <CardHeader>
          <CardTitle>Situation professionnelle</CardTitle>
          <CardDescription>Votre statut professionnel actuel</CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="professionalStatus" className="text-slate-700">
                  Sélectionnez votre situation
                </Label>
                <Select
                  value={formData.professionalStatus}
                  onValueChange={(value) =>
                    handleSelectChange("professionalStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600">Situation actuelle</p>
                <p className="font-medium text-slate-900">
                  {getProfessionalStatusLabel()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>À propos</CardTitle>
          <CardDescription>
            Parlez un peu de vous
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-2">
              <Label htmlFor="about" className="text-slate-700">
                Biographie
              </Label>
              <Textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Décrivez votre profil, vos compétences et vos aspirations..."
                rows={4}
              />
            </div>
          ) : (
            <div>
              <p className="text-slate-700 whitespace-pre-wrap">{formData.about}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {editMode && (
        <div className="flex gap-4 justify-end pb-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand text-brand-foreground hover:bg-brand/90 text-white gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      )}
    </div>
  );
}
