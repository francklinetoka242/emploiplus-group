import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateExperience } from "@/features/candidates/api/types";
import { getCandidateExperiences } from "@/features/candidates/api/experiencesApi";
import { useCandidate } from "@/hooks/useCandidate";
import { useJobs } from "@/features/jobs/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SaasCard, SaasCardHeader, SaasCardContent } from "@/components/candidate/SaasCard";
import { SaasGrid } from "@/components/candidate/SaasLayout";
import {
  ArrowRight,
  Briefcase,
  Heart,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Send,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { JobCard } from "@/features/jobs/components";
import { useProfileCompletion } from "@/features/profile/hooks/useProfileCompletion";
import { useCandidateEducation } from "@/features/profile/hooks/useCandidateEducation";
import { useCandidateLanguages } from "@/features/profile/hooks/useCandidateLanguages";
import { useCandidatePreferences } from "@/features/profile/hooks/useCandidatePreferences";
import { useCandidateSkills } from "@/features/profile/hooks/useCandidateSkills";

type DashboardOffer = {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  type: string;
  salary: string;
  description?: string | null;
  requirements?: string | null;
  tags?: string[];
  deadline?: string | null;
};

const quickActions = [
  {
    id: 1,
    title: "Compléter mon profil",
    description: "Remplissez vos informations personnelles",
    icon: CheckCircle2,
    href: "/candidate/profile",
    borderColor: "border-blue-500",
    bgGradient: "from-blue-50 to-blue-100",
  },
  {
    id: 2,
    title: "Consulter les guides",
    description: "Découvrez les fiches conseils utiles pour vos démarches",
    icon: BookOpen,
    href: "/candidate/guides",
    borderColor: "border-emerald-500",
    bgGradient: "from-emerald-50 to-emerald-100",
  },
  {
    id: 3,
    title: "Voir mes candidatures",
    description: "Suivez le statut de vos candidatures",
    icon: Send,
    href: "/candidate/applications",
    borderColor: "border-purple-500",
    bgGradient: "from-purple-50 to-purple-100",
  },
];

export function CandidateDashboardPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useCandidate();
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [isCompletionCollapsed, setIsCompletionCollapsed] = useState(true);
  const { offers: publishedOffers, loading: publishedOffersLoading } = useJobs({
    status: "published",
    limit: 3,
    orderBy: "published_at",
    order: "desc",
  });
  const [experienceEntries, setExperienceEntries] = useState<CandidateExperience[]>([]);
  const { educations } = useCandidateEducation(profile?.id);
  const { skills } = useCandidateSkills(profile?.id);
  const { languages } = useCandidateLanguages(profile?.id);
  const { preferences } = useCandidatePreferences(profile?.id);
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
    setOffersLoading(publishedOffersLoading);
    setOffers(
      publishedOffers.map((offer) => ({
        id: offer.id,
        slug: offer.slug ?? offer.id,
        title: offer.title ?? "Offre à découvrir",
        company: offer.company ?? "Entreprise",
        location: offer.location_city ?? "À distance",
        postedDate: offer.publish_at
          ? new Date(offer.publish_at).toLocaleDateString("fr-FR")
          : "—",
        type: offer.contract_type ?? "CDI",
        salary: offer.salary ?? "Salaire à négocier",
        description: offer.description ?? null,
        requirements: offer.requirements ?? null,
        tags: offer.tags ?? [],
        deadline: offer.deadline ?? offer.expires_at ?? null,
        application_email: offer.application_email ?? null,
        external_link: offer.external_link ?? null,
      })),
    );
  }, [publishedOffers, publishedOffersLoading]);

  useEffect(() => {
    if (!profile?.id) {
      setExperienceEntries([]);
      return;
    }

    const loadExperiences = async () => {
      try {
        const data = await getCandidateExperiences(profile.id);
        setExperienceEntries(data || []);
      } catch (error) {
        console.error("Unable to load candidate experiences for dashboard", error);
        setExperienceEntries([]);
      }
    };

    void loadExperiences();
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
      console.error("Unable to restore candidate documents for dashboard", error);
      setCandidateDocuments({ cv: null, documents: [] });
    }
  }, [profile?.id]);

  const completion = useProfileCompletion({
    profile,
    experiences: experienceEntries,
    educations,
    skills,
    languages,
    preferences,
  });

  const profileCompletion = completion.completionPercentage;

  const stats = useMemo(
    () => [
      {
        label: "Candidatures",
        value: 0,
        icon: Send,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        label: "Offres enregistrées",
        value: 0,
        icon: Heart,
        color: "text-red-600",
        bgColor: "bg-red-50",
        comingSoon: true,
      },
      {
        label: "Vues de profil",
        value: 0,
        icon: Eye,
        color: "text-green-600",
        bgColor: "bg-green-50",
        comingSoon: true,
      },
      {
        label: "Entretiens",
        value: 0,
        icon: Briefcase,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        comingSoon: true,
      },
    ],
    [],
  );

  const firstName = profile?.first_name || "Candidat";
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Jean Dupont";
  const email = profile?.email || "jean.dupont@example.com";

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bienvenue, {firstName}!</h1>
              <p className="text-slate-300">
                Bienvenue dans votre espace de candidat. Trouvez le poste idéal et suivez vos
                candidatures.
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-slate-700 rounded-full opacity-50">
              <Briefcase className="w-12 h-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold text-foreground ${stat.comingSoon ? "text-base font-semibold" : ""}`}>
                      {stat.comingSoon ? "Fonctionnalite bientot disponible" : stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`${stat.color} w-6 h-6`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <button
            type="button"
            className="flex items-center justify-between gap-4 text-left"
            onClick={() => setIsCompletionCollapsed((prev) => !prev)}
            aria-expanded={!isCompletionCollapsed}
          >
            <div>
              <CardTitle>Complétude de votre profil</CardTitle>
              <CardDescription>Complétez votre profil pour augmenter vos chances</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex min-w-[120px] flex-col items-end gap-1">
                <p className="text-2xl font-bold text-foreground">{profileCompletion}%</p>
                <Progress value={profileCompletion} className="h-1.5 w-full" />
              </div>
              {isCompletionCollapsed ? (
                <ChevronRight className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </button>
        </CardHeader>
        {!isCompletionCollapsed ? (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {completion.completionItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${item.isCompleted ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}
                >
                  {item.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        ) : null}
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.id} to={action.href}>
                <Card
                  className={`border-2 ${action.borderColor} hover:shadow-lg transition-all h-full`}
                >
                  <CardContent className={`pt-6 bg-gradient-to-br ${action.bgGradient}`}>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-card rounded-lg shadow-sm border border-border">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{action.title}</h3>
                        <p className="text-sm text-slate-600">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Offers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dernières offres publiées</CardTitle>
            <CardDescription>Les 3 dernières offres d'emploi</CardDescription>
          </div>
          <Link to="/jobs">
            <Button variant="outline" size="sm">
              Voir toutes les offres
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offersLoading ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Chargement des offres…
              </div>
            ) : offers.length > 0 ? (
              offers.map((offer, index) => {
                const location = [offer.location, offer.company].filter(Boolean).join(" • ");
                const previewText = (offer.description || offer.requirements || "")
                  .replace(/\s+/g, " ")
                  .trim();
                const contractLabel = offer.type ?? null;
                const tags = (offer.tags || []).filter(Boolean).slice(0, 3);
                const deadlineValue = offer.deadline ?? null;
                const isExpired = Boolean(
                  deadlineValue && new Date(deadlineValue).getTime() < Date.now(),
                );
                return (
                  <JobCard
                    key={offer.id}
                    job={{
                      slug: offer.slug,
                      title: offer.title,
                      company: offer.company,
                      application_email: offer.application_email,
                      external_link: offer.external_link,
                      salary: offer.salary,
                    }}
                    location={location}
                    previewText={previewText}
                    contractLabel={contractLabel}
                    tags={tags}
                    deadlineValue={deadlineValue}
                    isExpired={isExpired}
                    index={index}
                    onApplyClick={() => navigate(`/candidate/jobs/${offer.slug}/apply`)}
                  />
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Aucune offre publiée pour le moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
