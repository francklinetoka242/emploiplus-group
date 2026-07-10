import React from "react";
import { usePageSEO } from "@/lib/seo";
import { useCandidate } from "@/hooks/useCandidate";

export function CandidateCreateMotivationPage() {
  const { profile, loading } = useCandidate();

  usePageSEO({
    title: "Créer une lettre de motivation - EmploiPlus Group",
    description: "Service bientôt disponible pour rédiger et télécharger vos lettres de motivation.",
    robots: "noindex,nofollow",
  });

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Chargement...</div>;
  }

  if (!profile) {
    return (
      <div className="py-10 text-center text-slate-600">
        Veuillez vous reconnecter pour accéder à cette fonctionnalité.
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Bientôt disponible</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Vous pourrez bientôt rédiger vos lettres de motivation puis les télécharger directement depuis votre espace.
        </p>
      </div>
    </div>
  );
}
