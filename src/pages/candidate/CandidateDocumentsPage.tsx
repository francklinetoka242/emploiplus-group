import { useMemo } from "react";
import { useCandidate } from "@/hooks/useCandidate";
import { useCandidateDocuments } from "@/features/candidates/hooks/useCandidateDocuments";
import { DocumentsSection } from "@/features/profile/components/sections/DocumentsSection";
import { usePageSEO } from "@/features/seo";

export function CandidateDocumentsPage() {
  const { profile, loading } = useCandidate();
  const { cv, documents, loading: documentsLoading, deleteDocument, addDocument } = useCandidateDocuments(profile?.id);

  usePageSEO({
    title: "Documents - EmploiPlus Group",
    description: "Gérez vos documents importants pour votre candidature.",
    robots: "noindex,nofollow",
  });

  const content = useMemo(() => {
    if (loading) {
      return <p className="text-sm text-slate-500">Chargement de vos documents...</p>;
    }

    if (!profile) {
      return <p className="text-sm text-slate-500">Veuillez vous reconnecter pour accéder à vos documents.</p>;
    }

    return (
      <DocumentsSection
        cv={cv}
        documents={documents}
        loading={documentsLoading}
        candidateId={profile.id}
        serverCvUrl={profile?.cv_url}
        onDeleteDocument={deleteDocument}
        onAddDocument={addDocument}
      />
    );
  }, [loading, profile, cv, documents, documentsLoading, deleteDocument, addDocument]);

  return <div className="space-y-6">{content}</div>;
}
