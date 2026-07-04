import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  CandidateAuthService,
  CandidateExperience,
  CandidateEducation,
  CandidateSkill,
  CandidateLanguage,
  CandidatePreferences,
} from "@/integrations/supabase/candidate-auth";
import { useCandidate } from "@/hooks/useCandidate";
import { SaasCard, SaasCardHeader, SaasCardContent, SaasCardFooter } from "@/components/candidate/SaasCard";
import { SaasGrid } from "@/components/candidate/SaasLayout";
import {
  ArrowRight,
  Briefcase,
  Heart,
  CheckCircle2,
  FileText,
  Send,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";

type DashboardOffer = {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  type: string;
  salary: string;
};

const quickActions = [
  {
    id: 1,
    title: "Mon profil",
    description: "Complétez vos informations",
    icon: CheckCircle2,
    href: "/candidate/profile",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: 2,
    title: "Mon CV",
    description: "Déposez votre CV",
    icon: FileText,
    href: "/candidate/cv",
    color: "from-emerald-600 to-emerald-700",
  },
  {
    id: 3,
    title: "Candidatures",
    description: "Suivez vos applications",
    icon: Send,
    href: "/candidate/applications",
    color: "from-purple-600 to-purple-700",
  },
  {
    id: 4,
    title: "Préférences",
    description: "Configurez vos critères",
    icon: Briefcase,
    href: "/candidate/preferences",
    color: "from-orange-600 to-orange-700",
  },
];

export function CandidateDashboardPageModern() {
  const { profile, loading: profileLoading } = useCandidate();
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [experienceEntries, setExperienceEntries] = useState<CandidateExperience[]>([]);
  const [educationEntries, setEducationEntries] = useState<CandidateEducation[]>([]);
  const [skillEntries, setSkillEntries] = useState<CandidateSkill[]>([]);
  const [languageEntries, setLanguageEntries] = useState<CandidateLanguage[]>([]);
  const [preferencesEntry, setPreferencesEntry] = useState<CandidatePreferences | null>(null);
  const [candidateDocuments, setCandidateDocuments] = useState<{
    cv: { url?: string | null } | null;
    documents: Array<{ url?: string | null }>;
  }>({ cv: null, documents: [] });

  usePageSEO({
    title: "Tableau de bord - EmploiPlus Group",
    description: "Accédez à votre tableau de bord candidat",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    const loadOffers = async () => {
      setOffersLoading(true);
      const { data, error } = await supabase
        .from("job_offers")
        .select("id, title, company, location_city, contract_type, salary, published_at, status")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        setOffers(
          data.map((offer) => ({
            id: offer.id,
            title: offer.title ?? "Offre à découvrir",
            company: offer.company ?? "Entreprise",
            location: offer.location_city ?? "À distance",
            postedDate: offer.published_at ? new Date(offer.published_at).toLocaleDateString("fr-FR") : "—",
            type: offer.contract_type ?? "CDI",
            salary: offer.salary ?? "Salaire à négocier",
          }))
        );
      }
      setOffersLoading(false);
    };

    void loadOffers();
  }, []);

  useEffect(() => {
    if (!profile?.id) {
      setExperienceEntries([]);
      return;
    }

    const loadExperiences = async () => {
      try {
        const data = await CandidateAuthService.getCandidateExperiences(profile.id);
        setExperienceEntries(data || []);
      } catch (error) {
        console.error("Unable to load candidate experiences", error);
        setExperienceEntries([]);
      }
    };

    void loadExperiences();
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) {
      setEducationEntries([]);
      return;
    }

    const loadEducations = async () => {
      try {
        const data = await CandidateAuthService.getCandidateEducations(profile.id);
        setEducationEntries(data || []);
      } catch (error) {
        console.error("Unable to load candidate educations", error);
        setEducationEntries([]);
      }
    };

    void loadEducations();
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) {
      setSkillEntries([]);
      setLanguageEntries([]);
      setPreferencesEntry(null);
      return;
    }

    const loadExtras = async () => {
      try {
        const skills = await CandidateAuthService.getCandidateSkills(profile.id);
        setSkillEntries(skills || []);
      } catch (error) {
        console.error("Unable to load candidate skills", error);
        setSkillEntries([]);
      }

      try {
        const langs = await CandidateAuthService.getCandidateLanguages(profile.id);
        setLanguageEntries(langs || []);
      } catch (error) {
        console.error("Unable to load candidate languages", error);
        setLanguageEntries([]);
      }

      try {
        const prefs = await CandidateAuthService.getCandidatePreferences(profile.id);
        setPreferencesEntry(prefs ?? null);
      } catch (error) {
        console.error("Unable to load candidate preferences", error);
        setPreferencesEntry(null);
      }
    };

    void loadExtras();
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) {
      setCandidateDocuments({ cv: null, documents: [] });
      return;
    }

    try {
      const raw = localStorage.getItem(`emploiplus-candidate-documents-${profile.id}`);
      if (!raw) {
        setCandidateDocuments({ cv: null, documents: [] });
        return;
      }

      const parsed = JSON.parse(raw) as {
        cv?: { url?: string | null } | null;
        documents?: Array<{ url?: string | null }>;
      };

      setCandidateDocuments({
        cv: parsed.cv ?? null,
        documents: parsed.documents ?? [],
      });
    } catch (error) {
      console.error("Unable to restore candidate documents", error);
      setCandidateDocuments({ cv: null, documents: [] });
    }
  }, [profile?.id]);

  const profileChecks = useMemo(() => {
    if (!profile) {
      return {
        personalInfoCompleted: false,
        experienceCompleted: false,
        cvCompleted: false,
      };
    }

    const personalInfoCompleted = Boolean(
      profile.first_name &&
      profile.last_name &&
      profile.email &&
      profile.phone &&
      profile.location_city &&
      profile.location_country
    );
    const experienceCompleted = experienceEntries.length > 0;
    const educationCompleted = educationEntries.length > 0;
    const skillsCompleted = skillEntries.length > 0;
    const languagesCompleted = languageEntries.length > 0;
    const preferencesCompleted = Boolean(
      preferencesEntry && (
        (preferencesEntry.contract_types && preferencesEntry.contract_types.length > 0) ||
        (preferencesEntry.work_types && preferencesEntry.work_types.length > 0) ||
        preferencesEntry.seniority_level
      )
    );
    const cvCompleted = Boolean(
      candidateDocuments.cv?.url || candidateDocuments.documents.some((document) => Boolean(document.url))
    );

    return {
      personalInfoCompleted,
      experienceCompleted,
      cvCompleted,
    };
  }, [profile, experienceEntries, candidateDocuments]);
  // SECTION WEIGHTS (sum must be 100)
  const SECTION_WEIGHTS: Record<string, number> = {
    profile: 40,
    cv: 20,
    experience: 10,
    education: 8,
    skills: 8,
    languages: 7,
    preferences: 7,
  };

  const perSectionPercents = useMemo(() => {
    return {
      profile: profileChecks.personalInfoCompleted ? SECTION_WEIGHTS.profile : 0,
      cv: profileChecks.cvCompleted ? SECTION_WEIGHTS.cv : 0,
      experience: profileChecks.experienceCompleted ? SECTION_WEIGHTS.experience : 0,
      education: profileChecks.educationCompleted ? SECTION_WEIGHTS.education : 0,
      skills: profileChecks.skillsCompleted ? SECTION_WEIGHTS.skills : 0,
      languages: profileChecks.languagesCompleted ? SECTION_WEIGHTS.languages : 0,
      preferences: profileChecks.preferencesCompleted ? SECTION_WEIGHTS.preferences : 0,
    };
  }, [profileChecks]);

  const profileCompletion = useMemo(() => {
    return Math.round(Object.values(perSectionPercents).reduce((s, v) => s + v, 0));
  }, [perSectionPercents]);

  const completionItems = [
    { key: 'profile', label: 'Informations personnelles', href: '/candidate/profile', completed: profileChecks.personalInfoCompleted, percent: perSectionPercents.profile },
    { key: 'cv', label: 'Mon CV', href: '/candidate/cv', completed: profileChecks.cvCompleted, percent: perSectionPercents.cv },
    { key: 'experience', label: 'Expériences', href: '/candidate/experience', completed: profileChecks.experienceCompleted, percent: perSectionPercents.experience },
    { key: 'education', label: 'Formations', href: '/candidate/education', completed: profileChecks.educationCompleted, percent: perSectionPercents.education },
    { key: 'skills', label: 'Compétences', href: '/candidate/skills', completed: profileChecks.skillsCompleted, percent: perSectionPercents.skills },
    { key: 'languages', label: 'Langues', href: '/candidate/languages', completed: profileChecks.languagesCompleted, percent: perSectionPercents.languages },
    { key: 'preferences', label: "Préférences d'emploi", href: '/candidate/preferences', completed: profileChecks.preferencesCompleted, percent: perSectionPercents.preferences },
  ];

  const stats = [
    { label: "Candidatures", value: 0, icon: Send, color: "from-blue-500 to-blue-600" },
    { label: "Offres enregistrées", value: 0, icon: Heart, color: "from-red-500 to-red-600" },
    { label: "Vues de profil", value: 0, icon: Eye, color: "from-green-500 to-green-600" },
    { label: "Notifications", value: 0, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
  ];

  const firstName = profile?.first_name || "Candidat";
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Jean Dupont";

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Bienvenue, {firstName}!
        </h1>
        <p className="text-lg text-slate-600">
          Retrouvez toutes les offres d'emploi qui correspondent à votre profil et suivez vos candidatures.
        </p>
      </div>

      {/* Stats Grid */}
      <SaasGrid columns="4" gap="6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <SaasCard key={stat.label} hoverable gradient>
              <div className="px-6 py-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
              </div>
            </SaasCard>
          );
        })}
      </SaasGrid>

      {/* Profile Completion Card */}
      <SaasCard>
        <SaasCardHeader
          title="Complétude de votre profil"
          subtitle="Complétez votre profil pour augmenter vos chances de réussite"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SaasCardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Progression</span>
              <span className="text-sm font-bold text-primary">{profileCompletion}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          <SaasGrid columns="3" gap="4">
            {completionItems.map((item) => (
              <div
                key={item.key}
                className={`p-3 rounded-lg border transition-all ${
                  item.completed
                    ? "bg-emerald-50/60 border-emerald-200/70"
                    : "bg-slate-50/60 border-slate-200/70"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {item.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    <a href={item.href} className={`text-xs font-medium ${item.completed ? "text-emerald-900" : "text-slate-600"}`}>
                      {item.completed ? "Complété" : "À compléter"}
                    </a>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{item.percent}%</div>
                </div>
                <p className={`text-xs ${item.completed ? "text-emerald-700" : "text-slate-500"}`}>
                  {item.label}
                </p>
              </div>
            ))}
          </SaasGrid>
        </SaasCardContent>
      </SaasCard>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Actions rapides</h2>
        <SaasGrid columns="4" gap="6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.id} to={action.href}>
                <SaasCard hoverable className="h-full">
                  <div className="px-6 py-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{action.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                      </div>
                      <div className="pt-2">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </SaasCard>
              </Link>
            );
          })}
        </SaasGrid>
      </div>

      {/* Recent Offers Section */}
      {!offersLoading && offers.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Offres récentes</h2>
          <SaasGrid columns="1" gap="4">
            {offers.map((offer) => (
              <SaasCard key={offer.id} hoverable>
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{offer.title}</h3>
                          <p className="text-sm text-slate-600 truncate">{offer.company}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{offer.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{offer.postedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{offer.type}</Badge>
                        <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {offer.salary}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        Voir <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SaasCard>
            ))}
          </SaasGrid>
        </div>
      )}
    </div>
  );
}
