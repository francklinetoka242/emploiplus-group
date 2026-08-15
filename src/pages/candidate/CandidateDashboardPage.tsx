import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/features/jobs/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SaasCard, SaasCardHeader, SaasCardContent } from "@/components/candidate/SaasCard";
import { SaasGrid } from "@/components/candidate/SaasLayout";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  BookOpen,
  Target,
  Send,
} from "lucide-react";
import { JobCard } from "@/features/jobs/components";
import { getRecommendedJobs, RecommendedJob } from "@/services/aiMatchingService";
import { supabase } from "@/integrations/supabase/client";
import { CANDIDATE_DOCUMENTS_BUCKET } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileCompletion } from "@/features/profile/hooks/useProfileCompletion";
import { useCandidateProfileData } from "@/features/candidates/hooks/useCandidateProfileData";
import { diagnosticLogger } from "@/services/diagnosticLogger";
import { isMobileApp } from "@/lib/isMobileApp";

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
  const mobileApp = isMobileApp();

  // Unified candidate profile data loader (coordinated loading)
  const {
    profile,
    educations,
    skills,
    languages,
    preferences,
    experiences,
    isLoading: profileDataLoading,
    isReady: profileDataReady,
    error: profileDataError,
    refetch,
  } = useCandidateProfileData();
  
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [isCompletionCollapsed, setIsCompletionCollapsed] = useState(true);
  
  // Diagnostic: Track renders
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  diagnosticLogger.log('COMPONENT_RENDER', {
    renderCount: renderCountRef.current,
    profileId: profile?.id,
    profileDataReady,
    profileDataLoading,
    timestamp: new Date().toISOString(),
  }, 'CandidateDashboardPage');

  const jobFilters = useMemo(
    () => ({ status: "published", limit: 3, orderBy: "published_at", order: "desc" }),
    [],
  );

  const { offers: publishedOffers, loading: publishedOffersLoading } = useJobs(jobFilters);
  const [candidateDocuments, setCandidateDocuments] = useState<{
    cv: { url?: string | null } | null;
    documents: Array<{ url?: string | null }>;
  }>({ cv: null, documents: [] });
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [hasMoreRecommendedJobs, setHasMoreRecommendedJobs] = useState(false);
  const RECOMMENDED_JOBS_PAGE_SIZE = 3;
  const recommendationContextSignature = useMemo(
    () => `${profile?.id ?? "unknown"}:${profile?.cv_text ?? ""}:${String(profile?.embedding_vector ?? "")}`,
    [profile?.id, profile?.cv_text, profile?.embedding_vector],
  );
  const lastRecommendationContextRef = useRef<string | null>(null);

  usePageSEO({
    title: "Tableau de bord - EmploiPlus Group",
    description: "Accédez à votre tableau de bord candidat",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    diagnosticLogger.log('EFFECT_START', {
      effectName: 'publishedOffers',
      offersCount: publishedOffers.length,
      loading: publishedOffersLoading,
    }, 'CandidateDashboardPage');
    
    setOffersLoading(publishedOffersLoading);
    diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setOffersLoading', publishedOffersLoading);
    
    setOffers(
      publishedOffers.map((offer) => ({
        id: offer.id,
        slug: offer.slug ?? offer.id,
        title: offer.title ?? "Offre à découvrir",
        company: offer.company ?? "Entreprise",
        location: offer.location_city ?? "À distance",
        postedDate: offer.publish_at ? new Date(offer.publish_at).toLocaleDateString("fr-FR") : "—",
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

  // Fonction helper pour recharger les documents du localStorage
  const reloadCandidateDocuments = useCallback(async () => {
    diagnosticLogger.log('RELOAD_DOCS_START', {
      profileId: profile?.id,
      hasProfile: !!profile,
    }, 'CandidateDashboardPage');
    
    if (!profile?.id) {
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setCandidateDocuments', 'empty');
      setCandidateDocuments({ cv: null, documents: [] });
      return;
    }

    try {
      const raw = localStorage.getItem(`emploiplus-candidate-documents-${profile.id}`);
      if (!raw) {
        // Fallback: if server knows the cv_url, hydrate local state from profile
        const serverCvUrl = profile?.cv_url as string | undefined;
        if (serverCvUrl) {
          let resolved = serverCvUrl;
          if (!serverCvUrl.startsWith("http")) {
            try {
              const { data: signed, error } = await supabase.storage
                .from(CANDIDATE_DOCUMENTS_BUCKET)
                .createSignedUrl(serverCvUrl, 60 * 60);
              if (!error && signed?.signedUrl) resolved = signed.signedUrl;
            } catch (e) {
              console.debug("Failed to generate signed URL for dashboard CV", e);
            }
          }
          diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setCandidateDocuments', 'from-server');
          setCandidateDocuments({
            cv: {
              id: `cv-server-${profile.id}`,
              name: "CV",
              displayName: "Mon CV",
              date: new Date().toISOString(),
              size: "",
              url: resolved,
            },
            documents: [],
          });
          return;
        }

        setCandidateDocuments({ cv: null, documents: [] });
        return;
      }

      const parsed = JSON.parse(raw) as {
        cv?: { url?: string | null } | null;
        documents?: Array<{ url?: string | null }>;
      };

      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setCandidateDocuments', 'from-storage');
      setCandidateDocuments({
        cv: parsed.cv ?? null,
        documents: parsed.documents ?? [],
      });
    } catch (error) {
      console.error("Unable to restore candidate documents for dashboard", error);
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setCandidateDocuments', 'empty-error');
      setCandidateDocuments({ cv: null, documents: [] });
    }
  }, [profile?.id]);

  // Charger les documents au démarrage
  useEffect(() => {
    diagnosticLogger.log('EFFECT_START', {
      effectName: 'reloadCandidateDocuments',
    }, 'CandidateDashboardPage');
    reloadCandidateDocuments();
  }, [reloadCandidateDocuments]);

  // Écouter l'événement de téléversement de CV pour se re-synchroniser
  useEffect(() => {
    const handleCvUploaded = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { candidateId } = customEvent.detail || {};

      // Vérifier que c'est pour ce candidat
      if (candidateId === profile?.id) {
        console.debug("[Dashboard] CV uploaded event detected, reloading documents and profile...");
        // Re-charger les documents du localStorage
        reloadCandidateDocuments();
        // Forcer un refresh du profil pour récupérer cv_text mis à jour
        if (refetch) {
          void refetch();
        }
      }
    };

    window.addEventListener("cv-uploaded", handleCvUploaded);
    return () => {
      window.removeEventListener("cv-uploaded", handleCvUploaded);
    };
  }, [profile?.id, reloadCandidateDocuments, refetch]);

  useEffect(() => {
    diagnosticLogger.log('EFFECT_START', {
      effectName: 'loadRecommendedJobs',
      profileId: profile?.id,
      hasProfile: !!profile,
      hasCvUrlInDocuments: !!candidateDocuments.cv?.url,
      cvText: !!profile?.cv_text,
      embedding: !!profile?.embedding_vector,
      recommendedPage,
    }, 'CandidateDashboardPage');
    
    if (!profile?.id) {
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedJobs', 'empty');
      setRecommendedJobs([]);
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedLoading', false);
      setRecommendedLoading(false);
      return;
    }

    const candidateCvText = profile?.cv_text;
    const candidateEmbedding = profile?.embedding_vector;
    const hasCvUploaded = Boolean(
      candidateDocuments.cv?.url || candidateCvText || candidateEmbedding,
    );

    console.debug("[Dashboard] Preparing recommended jobs", {
      candidateId: profile.id,
      hasCvUploaded,
      candidateDocuments,
      cv_text: candidateCvText,
      embedding: candidateEmbedding ? "present" : "absent",
    });

    if (!hasCvUploaded) {
      diagnosticLogger.log('RECOMMENDED_JOBS_SKIPPED', {
        reason: 'no-cv-uploaded',
        hasCvUrl: !!candidateDocuments.cv?.url,
        hasCvText: !!candidateCvText,
        hasEmbedding: !!candidateEmbedding,
      }, 'CandidateDashboardPage');
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedJobs', 'empty');
      setRecommendedJobs([]);
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedLoading', false);
      setRecommendedLoading(false);
      return;
    }

    let mounted = true;
    const loadRecommended = async () => {
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedLoading', true);
      setRecommendedLoading(true);
      try {
        console.debug(
          `[Dashboard] Calling getRecommendedJobs for candidate ${profile.id}, page ${recommendedPage}`,
        );
        const jobs = await getRecommendedJobs(
          profile.id,
          0.0,
          RECOMMENDED_JOBS_PAGE_SIZE,
          (recommendedPage - 1) * RECOMMENDED_JOBS_PAGE_SIZE,
        );
        console.debug(
          `[Dashboard] getRecommendedJobs returned ${Array.isArray(jobs) ? jobs.length : 0} jobs`,
          {
            candidateId: profile.id,
            requestedCount: RECOMMENDED_JOBS_PAGE_SIZE,
            page: recommendedPage,
            jobs,
          },
        );
        if (!mounted) return;
        diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedJobs', jobs?.length ?? 0);
        setRecommendedJobs(jobs || []);
        diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setHasMoreRecommendedJobs', (jobs?.length ?? 0) === RECOMMENDED_JOBS_PAGE_SIZE);
        setHasMoreRecommendedJobs((jobs?.length ?? 0) === RECOMMENDED_JOBS_PAGE_SIZE);
      } catch (error) {
        console.error("Unable to load recommended jobs:", error, { candidateId: profile.id });
        if (mounted) {
          diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedJobs', 'empty-error');
          setRecommendedJobs([]);
        }
        if (mounted) {
          diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setHasMoreRecommendedJobs', false);
          setHasMoreRecommendedJobs(false);
        }
      } finally {
        if (mounted) {
          diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedLoading', false);
          setRecommendedLoading(false);
        }
      }
    };

    void loadRecommended();
    return () => {
      mounted = false;
    };
  }, [
    profile?.id,
    candidateDocuments.cv?.url,
    profile?.cv_text,
    profile?.embedding_vector,
    recommendedPage,
  ]);

  useEffect(() => {
    const nextContext = profile?.id ? recommendationContextSignature : "empty";

    if (lastRecommendationContextRef.current === nextContext) {
      return;
    }

    lastRecommendationContextRef.current = nextContext;

    diagnosticLogger.log('EFFECT_RESET_PAGE', {
      effectName: 'resetRecommendedPage',
      newPage: 1,
      profileId: profile?.id,
      recommendationContextSignature,
      hasCvText: !!profile?.cv_text,
      hasEmbedding: !!profile?.embedding_vector,
    }, 'CandidateDashboardPage');
    diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedPage', 1);
    setRecommendedPage(1);
  }, [profile?.id, profile?.cv_text, profile?.embedding_vector, recommendationContextSignature]);

  // Use the exact same completion rule as the candidate profile page.
  // The loading skeleton should protect the UI, not change the calculation logic.
  const completion = useProfileCompletion({
    profile,
    experiences,
    educations,
    skills,
    languages,
    preferences,
  });

  const profileCompletion = profileDataLoading ? 0 : completion.completionPercentage;

  const firstName = profile?.first_name || "Candidat";
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Jean Dupont";
  const email = profile?.email || "jean.dupont@example.com";

  return (
    <div className={mobileApp ? "space-y-4 pt-0" : "space-y-8"}>
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

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <button
            type="button"
            className="flex items-center justify-between gap-4 text-left"
            onClick={() => setIsCompletionCollapsed((prev) => !prev)}
            aria-expanded={!isCompletionCollapsed}
            disabled={profileDataLoading}
          >
            <div>
              <CardTitle>Complétude de votre profil</CardTitle>
              <CardDescription>Complétez votre profil pour augmenter vos chances</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex min-w-[120px] flex-col items-end gap-1">
                {profileDataLoading ? (
                  <>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-1.5 w-full" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{profileCompletion}%</p>
                    <Progress value={profileCompletion} className="h-1.5 w-full" />
                  </>
                )}
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
            {profileDataLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
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
            )}
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
                  <CardContent className={`py-4 bg-gradient-to-br ${action.bgGradient}`}>
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2.5 bg-card rounded-lg shadow-sm border border-border">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">
                          {action.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600">{action.description}</p>
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
      {/* Recommended Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-foreground" />
              <CardTitle>Offres recommandées pour votre profil</CardTitle>
            </div>
            <CardDescription>
              Suggestions automatiques basées sur votre CV et votre profil
            </CardDescription>
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
            {recommendedLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            ) : recommendedJobs.length > 0 ? (
              <>
                {recommendedJobs.map((offer, index) => {
                  const location = [offer.location_city ?? "", offer.company ?? ""]
                    .filter(Boolean)
                    .join(" • ");
                  const previewText = (offer.description || offer.requirements || "")
                    .replace(/\s+/g, " ")
                    .trim();
                  const contractLabel = offer.contract_type ?? null;
                  const tags = (offer.tags || []).filter(Boolean).slice(0, 3);
                  const deadlineValue = offer.deadline ?? offer.expires_at ?? null;
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
                        application_email: offer.application_email ?? null,
                        external_link: offer.external_link ?? null,
                        salary: offer.salary ?? null,
                      }}
                      location={location}
                      previewText={previewText}
                      contractLabel={contractLabel}
                      tags={tags}
                      deadlineValue={deadlineValue}
                      isExpired={isExpired}
                      index={index}
                      matchScore={typeof offer.score === "number" ? offer.score : undefined}
                      onApplyClick={() => navigate(`/candidate/jobs/${offer.slug}/apply`)}
                    />
                  );
                })}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    disabled={recommendedPage <= 1}
                    onClick={() => setRecommendedPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Button>
                  <p className="text-sm text-slate-600">Page {recommendedPage}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    disabled={!hasMoreRecommendedJobs}
                    onClick={() => setRecommendedPage((prev) => prev + 1)}
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                {profile?.id && !(candidateDocuments.cv?.url || profile?.cv_text) ? (
                  <div>
                    Vous n'avez pas encore téléversé de CV. Téléversez un CV pour obtenir des
                    recommandations personnalisées.
                  </div>
                ) : (
                  <div>Aucune recommandation disponible pour le moment.</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
