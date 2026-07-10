import { usePageSEO } from "@/lib/seo";

export function CandidateCreateCVPage() {
  usePageSEO({
    title: "Créer un CV - EmploiPlus Group",
    description: "Cette fonctionnalité sera bientôt disponible.",
    robots: "noindex,nofollow",
  });

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Bientot dispoible</h1>
        <p className="mt-3 text-slate-600">Cette fonctionnalité n’est pas encore disponible.</p>
      </div>
    </div>
  );
}
