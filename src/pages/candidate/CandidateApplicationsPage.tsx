import React, { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { usePageSEO } from "@/features/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCandidate } from "@/hooks/useCandidate";

interface Application {
  id: string;
  job_offers: {
    id: string;
    title: string;
    company: string;
    location_city: string;
    contract_type: string;
  };
  status: string;
  applied_at: string;
  updated_at: string;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "reviewed":
      return "bg-purple-50 text-purple-800 border-purple-200";
    case "shortlisted":
      return "bg-green-50 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-50 text-red-800 border-red-200";
    case "accepted":
      return "bg-green-50 text-green-800 border-green-200";
    case "withdrawn":
      return "bg-gray-50 text-gray-800 border-gray-200";
    default:
      return "bg-slate-50 text-slate-800 border-slate-200";
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    submitted: "Envoyée",
    reviewed: "Examinée",
    shortlisted: "Pré-sélectionnée",
    rejected: "Rejetée",
    accepted: "Acceptée",
    withdrawn: "Retirée",
  };
  return labels[status] || status;
};

export function CandidateApplicationsPage() {
  const { t } = useI18n();
  const { profile, loading: profileLoading } = useCandidate();

  usePageSEO({
    title: "Mes Candidatures - EmploiPlus Group",
    description: "Suivez vos candidatures",
    robots: "noindex,nofollow",
  });

  if (profileLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[320px] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl border border-border bg-card shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Fonctionnalite bientot disponible</CardTitle>
          <CardDescription>
            Cette section sera bientôt accessible depuis votre espace candidat.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Merci pour votre patience.
        </CardContent>
      </Card>
    </div>
  );
}
