import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { PaginationNav } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SaasCard, SaasCardHeader, SaasCardContent } from "@/components/candidate/SaasCard";
import { SaasGrid } from "@/components/candidate/SaasLayout";
import {
  ArrowRightIcon as ArrowRight,
  CaretLeftIcon as ChevronLeft,
  TrendUpIcon as TrendingUp,
  CalendarBlankIcon as Calendar,
  MapPinIcon as MapPin,
  CurrencyDollarIcon as DollarSign,
  TargetIcon as Target,
} from "@phosphor-icons/react";
import { JobCard } from "@/features/jobs/components";
import { getRecommendedJobsWithStatus, RecommendedJob } from "@/services/aiMatchingService";
import { getCandidateCvAnalysisState, hasAnalyzableCandidateCv, hasCandidateCv } from "@/features/candidates/api/cvApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileCompletion } from "@/features/profile/hooks/useProfileCompletion";
import { useCandidateProfileData } from "@/features/candidates/hooks/useCandidateProfileData";
import { diagnosticLogger } from "@/services/diagnosticLogger";
import { isMobileApp } from "@/lib/isMobileApp";
import { createUniqueNotification } from "@/integrations/supabase/notifications";

const quickActions = [
  {
    id: 1,
    title: "Compléter mon profil",
    description: "Remplissez vos informations personnelles",
    href: "/candidate/profile",
  },
  {
    id: 2,
    title: "Consulter les guides",
    description: "Découvrez les fiches conseils utiles pour vos démarches",
    href: "/candidate/guides",
  },
  {
    id: 3,
    title: "Voir mes candidatures",
    description: "Suivez le statut de vos candidatures",
    href: "/candidate/applications",
  },
];

const completionItemRoutes: Record<string, string> = {
  "Nom complet": "/candidate/profile?tab=profile",
  "Titre professionnel": "/candidate/profile?tab=profile",
  Localisation: "/candidate/profile?tab=profile",
  "Résumé professionnel": "/candidate/profile?tab=presentation",
  "Expérience professionnelle": "/candidate/profile?tab=experience",
  Formation: "/candidate/profile?tab=education",
  Compétence: "/candidate/profile?tab=skills",
  Langue: "/candidate/profile?tab=languages",
  "Préférences RH": "/candidate/profile?tab=preferences",
  CV: "/candidate/profile?tab=documents",
};

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

  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [recommendedStatus, setRecommendedStatus] = useState<"no_cv" | "cv_processing" | "cv_analysis_failed" | "success" | "no_results" | "error">("no_cv");
  const [recommendedError, setRecommendedError] = useState<string | null>(null);
  const [hasMoreRecommendedJobs, setHasMoreRecommendedJobs] = useState(false);
  const hasCreatedProfileCompletionAlertRef = useRef(false);
  const hasCreatedJobAlertSetupRef = useRef(false);
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
    const handleCvUploaded = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { candidateId } = customEvent.detail || {};

      // Vérifier que c'est pour ce candidat
      if (candidateId === profile?.id) {
        console.debug("[Dashboard] CV uploaded event detected, reloading documents and profile...");
        if (refetch) {
          void refetch();
        }
      }
    };

    window.addEventListener("cv-uploaded", handleCvUploaded);
    return () => {
      window.removeEventListener("cv-uploaded", handleCvUploaded);
    };
  }, [profile?.id, refetch]);

  useEffect(() => {
    diagnosticLogger.log('EFFECT_START', {
      effectName: 'loadRecommendedJobs',
      profileId: profile?.id,
      hasProfile: !!profile,
      cvText: !!profile?.cv_text,
      embedding: !!profile?.embedding_vector,
      recommendedPage,
    }, 'CandidateDashboardPage');
    
    if (!profile?.id) {
      if (!profileDataReady && !profileDataError) {
        setRecommendedStatus('cv_processing');
        setRecommendedLoading(true);
        return;
      }

      if (profileDataError) {
        setRecommendedStatus('error');
        setRecommendedError(profileDataError);
        setRecommendedJobs([]);
        setHasMoreRecommendedJobs(false);
        setRecommendedLoading(false);
        return;
      }

      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedJobs', 'empty');
      setRecommendedJobs([]);
      setRecommendedStatus('no_cv');
      setRecommendedError(null);
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedLoading', false);
      setRecommendedLoading(false);
      return;
    }

    if (!profileDataReady) {
      setRecommendedStatus('cv_processing');
      setRecommendedLoading(true);
      return;
    }

    if (profileDataError) {
      setRecommendedStatus('error');
      setRecommendedError(profileDataError);
      setRecommendedJobs([]);
      setHasMoreRecommendedJobs(false);
      setRecommendedLoading(false);
      return;
    }

    const candidateCvText = profile?.cv_text;
    const candidateEmbedding = profile?.embedding_vector;
    const cvState = getCandidateCvAnalysisState(profile);
    const hasCvUploaded = hasCandidateCv(profile);
    const hasAnalyzableCv = hasAnalyzableCandidateCv(profile);

    console.debug("[Dashboard] Preparing recommended jobs", {
      candidateId: profile.id,
      hasCvUploaded,
      cv_text: candidateCvText,
      embedding: candidateEmbedding ? "present" : "absent",
      cvStatus: cvState.status,
    });

    if (!hasCvUploaded) {
      diagnosticLogger.log('RECOMMENDED_JOBS_SKIPPED', {
        reason: 'no-cv-uploaded',
        hasCvText: !!candidateCvText,
        hasEmbedding: !!candidateEmbedding,
      }, 'CandidateDashboardPage');
      setRecommendedStatus('no_cv');
      setRecommendedError(null);
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedJobs', 'empty');
      setRecommendedJobs([]);
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedLoading', false);
      setRecommendedLoading(false);
      return;
    }

    if (!hasAnalyzableCv) {
      const nextStatus = cvState.status === 'cv_processing' ? 'cv_processing' : 'cv_analysis_failed';
      diagnosticLogger.log('RECOMMENDED_JOBS_SKIPPED', {
        reason: nextStatus,
        hasCvText: !!candidateCvText,
        hasEmbedding: !!candidateEmbedding,
      }, 'CandidateDashboardPage');
      setRecommendedStatus(nextStatus);
      setRecommendedError(null);
      setRecommendedJobs([]);
      setRecommendedLoading(false);
      return;
    }

    let mounted = true;
    const loadRecommended = async () => {
      diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedLoading', true);
      setRecommendedLoading(true);
      setRecommendedError(null);
      try {
        console.debug(
          `[Dashboard] Calling getRecommendedJobs for candidate ${profile.id}, page ${recommendedPage}`,
        );
        const result = await getRecommendedJobsWithStatus(
          profile.id,
          0.0,
          RECOMMENDED_JOBS_PAGE_SIZE,
          (recommendedPage - 1) * RECOMMENDED_JOBS_PAGE_SIZE,
        );
        console.debug(
          `[Dashboard] getRecommendedJobsWithStatus returned ${result.status}`,
          {
            candidateId: profile.id,
            requestedCount: RECOMMENDED_JOBS_PAGE_SIZE,
            page: recommendedPage,
            result,
          },
        );
        if (!mounted) return;
        setRecommendedStatus(result.status);
        setRecommendedError(result.error ?? null);
        setRecommendedJobs(result.jobs || []);
        setHasMoreRecommendedJobs(result.status === 'success' && (result.jobs?.length ?? 0) === RECOMMENDED_JOBS_PAGE_SIZE);
      } catch (error) {
        console.error("Unable to load recommended jobs:", error, { candidateId: profile.id });
        if (mounted) {
          setRecommendedStatus('error');
          setRecommendedError(error instanceof Error ? error.message : 'Impossible de charger les recommandations.');
          setRecommendedJobs([]);
        }
        if (mounted) {
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
    profile?.cv_text,
    profile?.embedding_vector,
    profile?.cv_last_updated_at,
    recommendedPage,
    profileDataReady,
    profileDataError,
  ]);

  useEffect(() => {
    if (!profile?.id || !profile?.user_id || !profile?.cv_last_updated_at || hasCreatedProfileCompletionAlertRef.current) {
      return;
    }

    const cvLastUpdatedAt = new Date(profile.cv_last_updated_at).getTime();
    const staleMs = 1000 * 60 * 60 * 24 * 180;
    if (Date.now() - cvLastUpdatedAt > staleMs) {
      void createUniqueNotification({
        title: "Votre CV est ancien.",
        content: "Mettez à jour votre CV pour améliorez vos recommandations et votre visibilité.",
        type: "offre",
        user_id: profile.user_id,
        status: "active",
        is_read: false,
        link: "/candidate/profile?tab=documents",
      });
    }
  }, [profile?.id, profile?.user_id, profile?.cv_last_updated_at]);

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

  const profileCompletion = profileDataLoading || !profileDataReady ? 0 : completion.completionPercentage;
  const [animatedProfileCompletion, setAnimatedProfileCompletion] = useState(0);

  useEffect(() => {
    if (!profile?.id || !profile?.user_id || profileDataLoading || !profileDataReady || profileCompletion >= 100 || hasCreatedProfileCompletionAlertRef.current) {
      return;
    }

    const missingItem = completion.missingItems[0];
    const missingLabel = missingItem ?? "votre profil";
    const route = completionItemRoutes[missingItem] ?? "/candidate/profile";

    hasCreatedProfileCompletionAlertRef.current = true;
    void createUniqueNotification({
      title: `Votre profil est à ${profileCompletion} %. Ajoutez votre ${missingLabel.toLowerCase()} pour améliorer vos recommandations.`,
      content: "Complétez les informations manquantes pour maximiser la qualité des recommandations.",
      type: "offre",
      user_id: profile.user_id,
      status: "active",
      is_read: false,
      link: route,
    });
  }, [completion.missingItems, profile?.id, profile?.user_id, profileCompletion, profileDataLoading, profileDataReady]);

  useEffect(() => {
    if (profileDataLoading) {
      setAnimatedProfileCompletion(0);
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      setAnimatedProfileCompletion(profileCompletion);
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [profileCompletion, profileDataLoading]);

  useEffect(() => {
    if (!profile?.user_id || !preferences || hasCreatedJobAlertSetupRef.current) {
      return;
    }

    if (preferences.job_alerts_enabled) {
      hasCreatedJobAlertSetupRef.current = true;
      void createUniqueNotification({
        title: "Vos alertes emploi sont actives.",
        content: "Vous recevrez des offres correspondant à votre profil et à votre disponibilité.",
        type: "offre",
        user_id: profile.user_id,
        status: "active",
        is_read: false,
        link: "/candidate/profile?tab=preferences",
      });
    }
  }, [preferences?.job_alerts_enabled, profile?.user_id]);

  const firstName = profile?.first_name || "Candidat";
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Jean Dupont";
  const email = profile?.email || "jean.dupont@example.com";

  return (
    <div className={mobileApp ? "space-y-4 pt-0" : "space-y-8"}>
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-white">
        <CardContent className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <span className="welcome-ring welcome-ring-one" />
            <span className="welcome-ring welcome-ring-two" />
            <span className="welcome-ring welcome-ring-three" />
            <span className="welcome-ring welcome-ring-four" />
            <span className="welcome-ring welcome-ring-five" />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-6">
            <div className="min-w-0 max-w-2xl space-y-3">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Bienvenue, {firstName} !</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Bienvenue dans votre espace de candidat. Trouvez le poste idéal et suivez vos
                candidatures.
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="Complétude du profil"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={profileCompletion}
              aria-valuetext={`${profileCompletion}%`}
              aria-busy={profileDataLoading || !profileDataReady}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-white/20"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - animatedProfileCompletion / 100)}
                    className="text-primary transition-[stroke-dashoffset] duration-700 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-white sm:text-base">
                  {profileDataLoading || !profileDataReady ? "…" : `${profileCompletion}%`}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-200">Complétude</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4 md:text-2xl">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            return (
              <Link
                key={action.id}
                to={action.href}
                className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Card
                  className="h-full min-h-32 border-border/70 bg-card shadow-none transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-none"
                >
                  <CardContent className="flex h-full min-h-32 items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-tight text-foreground">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {action.description}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        Accéder
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
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
      <Card className="overflow-hidden border-0 bg-transparent shadow-none">
        <CardHeader className="flex flex-col gap-4 bg-transparent sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Offres recommandées pour votre profil</CardTitle>
                <CardDescription className="mt-1">
                  Suggestions automatiques basées sur votre CV et votre profil
                </CardDescription>
              </div>
            </div>
          </div>
          <Link to="/jobs#recommended-for-you" className="shrink-0">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Voir toutes les offres
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
            {recommendedLoading ? (
              <div className="space-y-4">
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
                <PaginationNav
                  currentPage={recommendedPage}
                  totalPages={recommendedPage + (hasMoreRecommendedJobs ? 1 : 0)}
                  onPageChange={setRecommendedPage}
                  className="justify-center rounded-2xl border border-primary/10 bg-primary/[0.03] p-2"
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                {recommendedStatus === 'no_cv' && profile?.id ? (
                  <div>
                    Ajoutez votre CV pour recevoir des recommandations personnalisées.
                  </div>
                ) : recommendedStatus === 'cv_processing' ? (
                  <div>Analyse de votre CV en cours...</div>
                ) : recommendedStatus === 'cv_analysis_failed' ? (
                  <div>Votre CV n'a pas pu être analysé. Veuillez le téléverser à nouveau.</div>
                ) : recommendedStatus === 'error' ? (
                  <div>Impossible de charger les recommandations. Réessayez.</div>
                ) : (
                  <div>Aucune recommandation disponible pour le moment.</div>
                )}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
