import { Navigate } from "react-router-dom";
import { usePageSEO } from "@/features/seo";

export function CandidateCreateCVEditorPage() {
  usePageSEO({
    title: "Mon profil - EmploiPlus Group",
    description: "Accédez à votre profil candidat pour gérer vos informations professionnelles.",
    robots: "noindex,nofollow",
  });

  return <Navigate to="/candidate/profile?tab=presentation" replace />;
}
