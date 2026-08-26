import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
import {
  completeCandidateOnboarding,
  getOrInitializeCandidateOnboarding,
  updateCandidateOnboarding,
} from "@/features/candidates/api/candidateOnboardingApi";
import image1 from "@/assets/onboarding/onboarding-step-01.svg";
import image2 from "@/assets/onboarding/onboarding-step-02.svg";
import image3 from "@/assets/onboarding/onboarding-step-03.svg";
import image4 from "@/assets/onboarding/onboarding-step-04.svg";
import image5 from "@/assets/onboarding/onboarding-step-05.svg";

const onboardingImages = [image1, image2, image3, image4, image5];

const onboardingSteps = [
  {
    eyebrow: "Étape 1",
    title: "Trouvez des offres qui vous correspondent",
    description:
      "Accédez à une recherche ciblée et découvrez des opportunités alignées avec votre profil et vos critères.",
    items: [
      "Recevoir des offres recommandées",
      "Faire des recherches avancées (filtres)",
      "Trouver une offre adaptée à votre profil",
    ],
  },
  {
    eyebrow: "Étape 2",
    title: "Complétez votre profil en quelques minutes",
    description:
      "Renseignez vos compétences, votre expérience et vos préférences pour renforcer votre visibilité auprès des recruteurs.",
    items: [
      "Compléter votre profil",
      "Ajouter vos compétences",
      "Définir vos préférences",
    ],
  },
  {
    eyebrow: "Étape 3",
    title: "Téléchargez votre CV et vos documents",
    description:
      "Gérez vos fichiers et ajoutez les pièces utiles à votre candidature pour présenter votre profil de façon claire.",
    items: [
      "Ajouter un CV",
      "Joindre une lettre de motivation",
      "Gérer vos documents",
    ],
  },
  {
    eyebrow: "Étape 4",
    title: "Suivez votre match avec les offres",
    description:
      "Interprétez votre score de compatibilité et identifiez les points forts à valoriser ainsi que les axes à renforcer.",
    items: [
      "Voir votre score de matching",
      "Découvrir vos points forts",
      "Améliorer vos faiblesses",
    ],
  },
  {
    eyebrow: "Étape 5",
    title: "Postulez directement depuis votre espace",
    description:
      "Envoyez votre candidature en quelques clics et suivez le statut de chacune de vos demandes.",
    items: [
      "Candidater directement en ligne",
      "Suivre l’avancement",
      "Gérer vos candidatures",
    ],
  },
];

export function CandidateOnboardingPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useCandidate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [onboardingReady, setOnboardingReady] = useState(false);

  useEffect(() => {
    if (profileLoading || !profile?.id) return;

    let isMounted = true;
    const loadOnboarding = async () => {
      try {
        const onboarding = await getOrInitializeCandidateOnboarding(profile.id);
        if (onboarding.completed) {
          navigate("/candidate/dashboard", { replace: true });
          return;
        }

        if (isMounted) {
          setActiveIndex(Math.min(onboarding.current_step, onboardingImages.length - 1));
          setOnboardingReady(true);
        }
      } catch (error) {
        console.error("Candidate onboarding state loading failed:", error);
      }
    };

    void loadOnboarding();
    return () => {
      isMounted = false;
    };
  }, [navigate, profile?.id, profileLoading]);

  useEffect(() => {
    if (!onboardingReady || !profile?.id) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((previousIndex) => (previousIndex + 1) % onboardingImages.length);
    }, 2800);

    return () => window.clearInterval(intervalId);
  }, [onboardingReady, profile?.id]);

  useEffect(() => {
    if (!onboardingReady || !profile?.id) return;
    void updateCandidateOnboarding(profile.id, { current_step: activeIndex }).catch((error) => {
      console.error("Candidate onboarding progress update failed:", error);
    });
  }, [activeIndex, onboardingReady, profile?.id]);

  const currentStep = onboardingSteps[activeIndex];

  const handleStart = async () => {
    if (!profile?.id) return;
    try {
      await completeCandidateOnboarding(profile.id);
      navigate("/candidate/dashboard", { replace: true });
    } catch (error) {
      console.error("Candidate onboarding completion failed:", error);
    }
  };

  if (!onboardingReady) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef1f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-100">
          <div className="grid min-h-[520px] lg:grid-cols-[1.12fr_0.88fr]">
            <div className="relative min-h-[280px] overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 lg:min-h-full lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,0,158,0.08),_transparent_35%)]" />
              <div className="relative h-full w-full p-4 sm:p-5 lg:p-6">
                <div className="relative h-full min-h-[250px] overflow-hidden rounded-[24px] bg-white shadow-inner ring-1 ring-slate-200">
                  {onboardingImages.map((image, index) => (
                    <img
                      key={image}
                      src={image}
                      alt={`Illustration onboarding ${index + 1}`}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                        index === activeIndex
                          ? "translate-x-0 opacity-100 scale-100"
                          : "translate-x-4 opacity-0 scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-5 sm:p-7 lg:p-9">
              <div className="w-full max-w-[440px]">
                <div className="mb-4 inline-flex items-center rounded-full border border-[#00009e]/15 bg-[#00009e]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#00009e]">
                  {currentStep.eyebrow}
                </div>

                <div className="text-left">
                  <h1 className="text-[clamp(1.8rem,2.4vw,3rem)] font-bold leading-[1.08] tracking-[-0.04em] text-slate-900">
                    {currentStep.title}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                    {currentStep.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 text-left">
                  {currentStep.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700 sm:text-[0.98rem]">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00009e]/10 text-[#00009e]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex items-center justify-center gap-2.5 lg:justify-start" aria-label="Indicateurs du carrousel">
                  {onboardingImages.map((_, index) => (
                    <span
                      key={`indicator-${index}`}
                      className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                        index === activeIndex ? "w-8 bg-[#00009e]" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-8 flex justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="w-full max-w-[220px] rounded-full bg-[#00009e] px-6 py-6 text-base font-semibold text-white shadow-[0_18px_35px_rgba(0,0,158,0.25)] transition hover:bg-[#0000b8]"
                    onClick={handleStart}
                  >
                    Commencer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
