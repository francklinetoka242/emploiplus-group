import { useEffect, useRef } from "react";
import type { CandidateProfile, CandidatePreferences } from "@/features/candidates/types";
import type { ProfileCompletionResult } from "@/features/profile/types";
import { createUniqueNotification } from "@/integrations/supabase/notifications";

interface UseCandidateDashboardEffectsInput {
  profile: CandidateProfile | null;
  profileLoading: boolean;
  profileReady: boolean;
  profileCompletion: number;
  completion: ProfileCompletionResult;
  preferences: CandidatePreferences | null;
  refetchProfile: () => Promise<unknown> | void;
  retryRecommendations: () => void;
}

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

export function useCandidateDashboardEffects({
  profile,
  profileLoading,
  profileReady,
  profileCompletion,
  completion,
  preferences,
  refetchProfile,
  retryRecommendations,
}: UseCandidateDashboardEffectsInput): void {
  const hasCreatedProfileCompletionAlertRef = useRef(false);
  const hasCreatedJobAlertSetupRef = useRef(false);

  useEffect(() => {
    const handleCvUploaded = (event: Event) => {
      const customEvent = event as CustomEvent<{ candidateId?: string }>;
      if (customEvent.detail?.candidateId === profile?.id) {
        void refetchProfile();
        retryRecommendations();
      }
    };
    window.addEventListener("cv-uploaded", handleCvUploaded);
    return () => window.removeEventListener("cv-uploaded", handleCvUploaded);
  }, [profile?.id, refetchProfile, retryRecommendations]);

  useEffect(() => {
    if (
      !profile?.id ||
      !profile.user_id ||
      !profile.cv_last_updated_at ||
      hasCreatedProfileCompletionAlertRef.current
    ) {
      return;
    }
    const cvLastUpdatedAt = new Date(profile.cv_last_updated_at).getTime();
    if (Date.now() - cvLastUpdatedAt > 1000 * 60 * 60 * 24 * 180) {
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
    if (
      !profile?.id ||
      !profile.user_id ||
      profileLoading ||
      !profileReady ||
      profileCompletion >= 100 ||
      hasCreatedProfileCompletionAlertRef.current
    ) {
      return;
    }
    const missingItem = completion.missingItems[0];
    const missingLabel = missingItem ?? "votre profil";
    const route = completionItemRoutes[missingItem] ?? "/candidate/profile";
    hasCreatedProfileCompletionAlertRef.current = true;
    void createUniqueNotification({
      title: `Votre profil est à ${profileCompletion} %. Ajoutez votre ${missingLabel.toLowerCase()} pour améliorer vos recommandations.`,
      content:
        "Complétez les informations manquantes pour maximiser la qualité des recommandations.",
      type: "offre",
      user_id: profile.user_id,
      status: "active",
      is_read: false,
      link: route,
    });
  }, [
    completion.missingItems,
    profile?.id,
    profile?.user_id,
    profileCompletion,
    profileLoading,
    profileReady,
  ]);

  useEffect(() => {
    if (!profile?.user_id || !preferences || hasCreatedJobAlertSetupRef.current) return;
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
  }, [preferences, profile?.user_id]);
}
