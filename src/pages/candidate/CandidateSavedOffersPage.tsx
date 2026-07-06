import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCandidate } from "@/hooks/useCandidate";
import { CandidateAuthService } from "@/integrations/supabase/candidate-auth";

interface SavedOffer {
  id: string;
  job_offers: {
    id: string;
    title: string;
    company: string;
    location_city: string;
    salary: string | null;
    contract_type: string | null;
  };
  saved_at: string;
}

export function CandidateSavedOffersPage() {
  const { t } = useI18n();
  const { profile, loading: profileLoading } = useCandidate();

  usePageSEO({
    title: "Offres Enregistrées - EmploiPlus Group",
    description: "Consultez vos offres enregistrées",
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
