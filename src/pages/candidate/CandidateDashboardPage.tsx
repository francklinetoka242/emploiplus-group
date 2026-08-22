import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SaasCard, SaasCardHeader, SaasCardContent } from "@/components/candidate/SaasCard";
import { SaasGrid } from "@/components/candidate/SaasLayout";
import {
  ArrowRight,
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
import { createUniqueNotification } from "@/integrations/supabase/notifications";

const quickActions = [
  {
    id: 1,
    title: "Compléter mon profil",
    description: "Remplissez vos informations personnelles",
    icon: CheckCircle2,
    href: "/candidate/profile",
    accentColor: "text-primary",
    accentBackground: "bg-primary/10",
    accentBorder: "border-primary/30",
  },
  {
    id: 2,
    title: "Consulter les guides",
    description: "Découvrez les fiches conseils utiles pour vos démarches",
    icon: BookOpen,
    href: "/candidate/guides",
    accentColor: "text-primary",
    accentBackground: "bg-primary/10",
    accentBorder: "border-primary/30",
  },
  {
    id: 3,
    title: "Voir mes candidatures",
    description: "Suivez le statut de vos candidatures",
    icon: Send,
    href: "/candidate/applications",
    accentColor: "text-primary",
    accentBackground: "bg-primary/10",
    accentBorder: "border-primary/30",
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

  const [candidateDocuments, setCandidateDocuments] = useState<{
    cv: { url?: string | null } | null;
    documents: Array<{ url?: string | null }>;
  }>({ cv: null, documents: [] });
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [hasMoreRecommendedJobs, setHasMoreRecommendedJobs] = useState(false);
  const hasCreatedRecommendationAlertRef = useRef(false);
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
    if (!profile?.id || !profile?.user_id || !recommendedJobs.length || hasCreatedRecommendationAlertRef.current) {
      return;
    }

    hasCreatedRecommendationAlertRef.current = true;
    void createUniqueNotification({
      title: "Une nouvelle offre correspond à votre profil.",
      content: "Découvrez les offres recommandées qui correspondent le mieux à votre profil.",
      type: "offre",
      user_id: profile.user_id,
      status: "active",
      is_read: false,
      link: recommendedJobs[0].slug ? `/jobs/${recommendedJobs[0].slug}` : "/jobs#recommended-for-you",
    });
  }, [profile?.id, profile?.user_id, recommendedJobs]);

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

  const profileCompletion = profileDataLoading ? 0 : completion.completionPercentage;
  const [animatedProfileCompletion, setAnimatedProfileCompletion] = useState(0);

  const nextAction = useMemo(() => {
    if (profileDataLoading) {
      return {
        title: "Préparation de votre tableau de bord",
        description: "Nous calculons votre prochaine étape personnalisée.",
        href: "/candidate/profile",
      };
    }

    const cvLastUpdatedAt = profile?.cv_last_updated_at ? new Date(profile.cv_last_updated_at).getTime() : null;
    const cvIsStale = Boolean(profile?.cv_text) && (!cvLastUpdatedAt || Date.now() - cvLastUpdatedAt > 1000 * 60 * 60 * 24 * 180);

    if (cvIsStale) {
      return {
        title: "Mettre à jour votre CV",
        description: "Votre CV n'a pas été mis à jour depuis plusieurs mois. Actualisez-le pour améliorer la qualité des recommandations.",
        href: "/candidate/profile?tab=documents",
      };
    }

    if (completion.missingItems.length > 0) {
      const missingLabel = completion.missingItems[0];
      return {
        title: "Compléter votre profil",
        description: `Ajoutez votre ${missingLabel.toLowerCase()} pour améliorer vos recommandations et gagner en visibilité.`,
        href: completionItemRoutes[missingLabel] ?? "/candidate/profile",
      };
    }

    if (preferences?.job_alerts_enabled === false) {
      return {
        title: "Activer les alertes emploi",
        description: "Recevez les offres correspondantes à votre profil sans chercher activement.",
        href: "/candidate/profile?tab=preferences",
      };
    }

    if (preferences?.availability_status === "not_available") {
      return {
        title: "Mettre à jour votre disponibilité",
        description: "Indiquez votre date de disponibilité pour aider les recruteurs à vous contacter au bon moment.",
        href: "/candidate/profile?tab=preferences",
      };
    }

    return {
      title: "Consulter les offres recommandées",
      description: "Explorez les opportunités qui correspondent le mieux à votre profil et à votre disponibilité.",
      href: "/jobs#recommended-for-you",
    };
  }, [completion.missingItems, preferences?.job_alerts_enabled, preferences?.availability_status, profile?.cv_text, profile?.cv_last_updated_at, profileDataLoading]);

  const actionCompletionLevel = profileDataLoading ? 0 : profileCompletion;
  const nextActionSuccess = actionCompletionLevel >= 80 || !completion.missingItems.length;
  const nextActionMode = profileDataLoading ? "loading" : nextActionSuccess ? "success" : "active";

  useEffect(() => {
    if (!profile?.id || !profile?.user_id || profileDataLoading || profileCompletion >= 100 || hasCreatedProfileCompletionAlertRef.current) {
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
  }, [completion.missingItems, profile?.id, profile?.user_id, profileCompletion, profileDataLoading]);

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
          <div className="relative z-10 flex items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                Espace candidat
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bienvenue, {firstName} !</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Bienvenue dans votre espace de candidat. Trouvez le poste idéal et suivez vos
                candidatures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`next-action-card border-primary/15 shadow-sm ${
          nextActionMode === "success"
            ? "bg-gradient-to-r from-primary/10 via-emerald-50 to-amber-50"
            : nextActionMode === "active"
              ? "bg-gradient-to-r from-primary/5 via-white to-primary/10"
              : "bg-gradient-to-r from-slate-100 via-white to-slate-50"
        }`}
      >
        <CardContent className="relative overflow-hidden p-5 sm:p-6">
          {nextActionMode === "success" ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, index) => (
                <span
                  key={index}
                  className="petal"
                  style={{
                    left: `${10 + index * 9}%`,
                    top: `${18 + (index % 3) * 22}%`,
                    animationDelay: `${index * 120}ms`,
                    animationDuration: `${2400 + index * 180}ms`,
                    transform: `rotate(${index * 36}deg)`,
                  }}
                />
              ))}
            </div>
          ) : null}

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Ma prochaine action</p>
                {nextActionMode === "success" ? (
                  <span className="inline-flex items-center rounded-full border border-secondary/40 bg-secondary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
                    Réussite
                  </span>
                ) : null}
              </div>
              <h2 className="text-xl font-bold text-foreground">{nextAction.title}</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">{nextAction.description}</p>
            </div>

            <Link to={nextAction.href ?? "/candidate/profile"}>
              <Button
                variant="default"
                className={`whitespace-nowrap transition-all duration-500 ${
                  nextActionMode === "success" ? "shadow-lg shadow-emerald-200/80" : ""
                }`}
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card className="overflow-hidden border-primary/15 shadow-sm">
        <CardHeader className="bg-primary/[0.03] pb-5">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setIsCompletionCollapsed((prev) => !prev)}
            aria-expanded={!isCompletionCollapsed}
            disabled={profileDataLoading}
          >
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Complétude de votre profil</CardTitle>
              <CardDescription className="mt-1 max-w-xl text-xs sm:text-sm">
                Complétez votre profil pour augmenter vos chances
              </CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex w-[132px] items-center gap-2 sm:w-[188px]">
                {profileDataLoading ? (
                  <>
                    <Skeleton className="h-1.5 flex-1 sm:h-2" />
                    <Skeleton className="h-7 w-12 sm:h-8 sm:w-14" />
                  </>
                ) : (
                  <>
                    <Progress
                      value={animatedProfileCompletion}
                      className="h-1.5 flex-1 [&>div]:duration-[2200ms] [&>div]:ease-out sm:h-2"
                    />
                    <p className="text-[0.875rem] font-bold tabular-nums leading-none text-primary sm:text-[1.05rem]">
                      {profileCompletion}%
                    </p>
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
          <CardContent className="space-y-4 pt-5">
            {profileDataLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {completion.completionItems.map((item) => (
                  <Link
                    key={item.label}
                    to={completionItemRoutes[item.label] ?? "/candidate/profile?tab=profile"}
                    className={`group flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-sm ${item.isCompleted ? "border-primary/20 bg-primary/5 text-foreground" : "border-border bg-muted/40 text-muted-foreground"}`}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground/60" />
                    )}
                    <span className="flex-1 font-medium">{item.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        ) : null}
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.href}
                className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Card
                  className={`h-full border ${action.accentBorder} bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg`}
                >
                  <CardContent className="flex h-full items-center gap-4 p-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.accentBackground}`}>
                      <Icon className={`h-6 w-6 ${action.accentColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-tight text-foreground">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Offers */}
      {/* Recommended Jobs */}
      <Card className="overflow-hidden border-primary/15 shadow-sm">
        <CardHeader className="flex flex-col gap-4 bg-primary/[0.03] sm:flex-row sm:items-center sm:justify-between">
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
                <nav
                  aria-label="Pagination des offres recommandées"
                  className="flex items-center justify-between gap-2 rounded-2xl border border-primary/10 bg-primary/[0.03] p-2 sm:gap-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-xl border-primary/15 bg-background px-3 text-sm shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 sm:px-4"
                    disabled={recommendedPage <= 1}
                    onClick={() => setRecommendedPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <span className="min-w-[76px] rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary sm:text-sm">
                    Page {recommendedPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-xl border-primary/15 bg-background px-3 text-sm shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 sm:px-4"
                    disabled={!hasMoreRecommendedJobs}
                    onClick={() => setRecommendedPage((prev) => prev + 1)}
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </nav>
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
        </CardContent>
      </Card>
    </div>
  );
}
