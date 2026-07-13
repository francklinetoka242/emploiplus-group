import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
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
import {
  AlertCircle,
  Camera,
  Save,
  X,
  User,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCandidate } from "@/hooks/useCandidate";
import type { CandidateProfile } from "@/features/candidates/api/types";
import { centralAfricaCityGroups } from "@/data/locations";
import {
  SaasCard,
  SaasCardHeader,
  SaasCardContent,
  SaasCardFooter,
} from "@/components/candidate/SaasCard";
import { SaasGrid } from "@/components/candidate/SaasLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { candidateProfileSchema, type CandidateProfileFormValues } from "@/features/forms/schemas/profile.schemas";

const countryOptions = centralAfricaCityGroups.map((group) => group.country);

const normalizeCountryValue = (value?: string | null) => {
  const normalized = (value ?? "").trim().toLowerCase();
  const match = countryOptions.find((country) => country.toLowerCase() === normalized);
  if (match) return match;
  return (
    countryOptions.find((country) => country.toLowerCase().includes("congo")) ??
    countryOptions[0] ??
    "Congo"
  );
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
  const { profile, updateProfile } = useCandidate();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<CandidateProfileFormValues>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      headline: "",
      dateOfBirth: "",
      nationality: "",
      city: "",
      about: "",
      avatar: null,
    },
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
    const city = cities.includes(profile.location_city ?? "") ? (profile.location_city ?? "") : "";
    const phoneCode = getCountryPhoneCode(nationality);

    form.reset({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone?.trim() ? profile.phone : phoneCode,
      headline: profile.headline ?? "",
      dateOfBirth: profile.date_of_birth ?? "",
      nationality,
      city,
      about: profile.bio ?? "",
      avatar: profile.avatar_url ?? null,
    });
  }, [form, profile]);

  const handlePhoneNumberChange = (value: string) => {
    const normalized = value.replace(/\D/g, "");
    const currentNationality = form.getValues("nationality");
    const nextCode = getCountryPhoneCode(currentNationality);
    form.setValue("phone", `${nextCode}${normalized}`);
  };

  const handleNationalityChange = (value: string) => {
    form.setValue("nationality", value);
    form.setValue("city", "");
    const nextCode = getCountryPhoneCode(value);
    const currentPhone = form.getValues("phone");
    form.setValue(
      "phone",
      nextCode
        ? `${nextCode}${currentPhone ? currentPhone.replace(new RegExp(`^\\+?${nextCode}`), "") : ""}`
        : currentPhone,
    );
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      form.setValue("avatar", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (values: CandidateProfileFormValues) => {
    if (!profile) {
      setSaveError("Impossible de sauvegarder : profil non chargé.");
      return;
    }

    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const updates: Partial<CandidateProfile> = {
        first_name: values.firstName || null,
        last_name: values.lastName || null,
        phone: values.phone || null,
        headline: values.headline || null,
        date_of_birth: values.dateOfBirth || null,
        location_country: values.nationality || null,
        location_city: values.city || null,
        bio: values.about || null,
        avatar_url: values.avatar || null,
      };

      await updateProfile(updates);
      setSaveSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue";
      setSaveError(message);
      console.error("Error saving profile:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const availableCities = getCitiesForCountry(form.watch("nationality"));

  const initials = `${form.watch("firstName")?.[0] || ""}${form.watch("lastName")?.[0] || ""}`.toUpperCase();

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
          <AlertDescription className="text-rose-800">{saveError}</AlertDescription>
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
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={form.watch("firstName")} />
                )}
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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Jean" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Nom</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Dupont" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                  </FormControl>
                  <p className="text-xs text-slate-500 mt-1">Email non modifiable</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Téléphone</FormLabel>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="px-3 py-2.5 text-sm font-medium text-slate-600 border-r border-slate-200">
                      +{getCountryPhoneCode(form.watch("nationality")) || ""}
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="numero"
                        value={field.value?.replace(new RegExp(`^\\+?${getCountryPhoneCode(form.watch("nationality"))}`), "") || ""}
                        onChange={(e) => handlePhoneNumberChange(e.target.value)}
                        className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                      />
                    </FormControl>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Le code du pays est défini automatiquement selon votre pays.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Titre professionnel</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Chef de projet junior" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Date de naissance</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Pays</FormLabel>
                  <Select value={field.value} onValueChange={handleNationalityChange}>
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Ville</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700 mb-2 block">Votre profil</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Décrivez votre parcours professionnel, vos compétences clés et vos objectifs..."
                    rows={5}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                  />
                </FormControl>
                <p className="text-xs text-slate-500 mt-2">Partagez une brève description de votre profil professionnel.</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </SaasCardContent>
      </SaasCard>

      {/* Save Button */}
      <form onSubmit={form.handleSubmit(handleSave)}>
        <div className="flex gap-3 justify-end sticky bottom-4 z-10">
          <Button
            type="submit"
            disabled={!profile || saveLoading}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {saveLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
