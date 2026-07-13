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
  Send,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import { JobCard } from "@/features/jobs/components";

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
    title: "Voir mes candidatures",
    description: "Suivez le statut de vos candidatures",
    icon: Send,
    href: "/candidate/applications",
    borderColor: "border-purple-500",
    bgGradient: "from-purple-50 to-purple-100",
  },
  {
    id: 3,
    title: "Modifier mon profil",
    description: "Mettez à jour vos informations",
    icon: Briefcase,
    href: "/candidate/profile",
    borderColor: "border-orange-500",
    bgGradient: "from-orange-50 to-orange-100",
  },
];

export function CandidateDashboardPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useCandidate();
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const { offers: publishedOffers, loading: publishedOffersLoading } = useJobs({
    status: "published",
    limit: 3,
    orderBy: "published_at",
    order: "desc",
  });
  const [experienceEntries, setExperienceEntries] = useState<CandidateExperience[]>([]);
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

  const profileChecks = useMemo(() => {
    if (!profile) {
      return {
        personalInfoCompleted: false,
        experienceCompleted: false,
      };
    }

    const personalInfoCompleted = Boolean(
      profile.first_name &&
      profile.last_name &&
      profile.email &&
      profile.phone &&
      profile.location_city &&
      profile.location_country,
    );
    const experienceCompleted = experienceEntries.length > 0;

    return {
      personalInfoCompleted,
      experienceCompleted,
    };
  }, [profile, experienceEntries]);

  const profileCompletion = useMemo(() => {
    const checks = [
      profileChecks.personalInfoCompleted,
      profileChecks.experienceCompleted,
    ];
    const completedCount = checks.filter(Boolean).length;
    return Math.round((completedCount / checks.length) * 100);
  }, [profileChecks]);

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Complétude de votre profil</CardTitle>
              <CardDescription>Complétez votre profil pour augmenter vos chances</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{profileCompletion}%</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={profileCompletion} className="h-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-3 rounded-lg border ${profileChecks.personalInfoCompleted ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
            >
              <p
                className={`text-sm font-medium ${profileChecks.personalInfoCompleted ? "text-green-900" : "text-yellow-900"}`}
              >
                {profileChecks.personalInfoCompleted ? "Complété ✓" : "À compléter"}
              </p>
              <p
                className={`text-xs ${profileChecks.personalInfoCompleted ? "text-green-700" : "text-yellow-700"}`}
              >
                Informations personnelles
              </p>
            </div>
            <div
              className={`p-3 rounded-lg border ${profileChecks.experienceCompleted ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
            >
              <p
                className={`text-sm font-medium ${profileChecks.experienceCompleted ? "text-green-900" : "text-yellow-900"}`}
              >
                {profileChecks.experienceCompleted ? "Complété ✓" : "À compléter"}
              </p>
              <p
                className={`text-xs ${profileChecks.experienceCompleted ? "text-green-700" : "text-yellow-700"}`}
              >
                Expériences professionnelles
              </p>
            </div>
          </div>
        </CardContent>
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
