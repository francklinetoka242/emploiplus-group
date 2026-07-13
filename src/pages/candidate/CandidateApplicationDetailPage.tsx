import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";

export default function CandidateApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  usePageSEO({ title: `Candidature ${id} - EmploiPlus Group` });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Détails de la candidature</h1>
      <p className="text-sm text-muted-foreground mb-6">ID: {id}</p>
      <Button onClick={() => navigate(-1)}>Retour</Button>
    </div>
  );
}
