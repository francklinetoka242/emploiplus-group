import React from "react";
import { useNavigate } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";

export default function CandidateProfileEditPage() {
  const navigate = useNavigate();

  usePageSEO({ title: "Modifier mon profil - EmploiPlus Group" });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Modifier mon profil</h1>
      <p className="text-sm text-muted-foreground mb-6">Utilisez ce formulaire pour mettre à jour votre profil.</p>
      <Button onClick={() => navigate(-1)}>Retour</Button>
    </div>
  );
}
