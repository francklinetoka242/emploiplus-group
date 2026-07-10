import { useParams, useLocation } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";
import { getCvTemplateById } from "@/data/cvTemplates";

export function CandidateCreateCVEditorPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const location = useLocation();
  const state = (location.state || {}) as { openPreview?: boolean };
  const openPreview = Boolean(state.openPreview);
  const template = getCvTemplateById(templateId);

  usePageSEO({
    title: `Éditeur CV ${template.name} - EmploiPlus Group`,
    description: `Créez votre CV ${template.name.toLowerCase()} avec prévisualisation en temps réel.`,
    robots: "noindex,nofollow",
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="w-full mt-4 grid grid-cols-1 gap-4 px-3 pb-8 sm:mt-6 sm:px-4 lg:gap-6 lg:px-6 xl:px-8">
        <div className="min-w-0 w-full">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-3 lg:p-4">
            <p className="text-sm text-muted-foreground">La génération de CV a été retirée de l’application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
