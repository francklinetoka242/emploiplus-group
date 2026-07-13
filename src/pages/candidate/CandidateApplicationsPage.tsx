import React from "react";
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
import { useCandidateApplications } from "@/features/candidates/hooks/useCandidateApplications";

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

  const { applications, loading, withdrawApplication } = useCandidateApplications();

  const handleDelete = async (applicationId: string) => {
    // confirmation
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Confirmez-vous la suppression de cette candidature ?")) return;
    try {
      await withdrawApplication(applicationId);
      // simple refresh to reload applications
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("Impossible de supprimer la candidature.");
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <Card className="w-full max-w-4xl mx-auto border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Mes candidatures</CardTitle>
          <CardDescription>Récapitulatif des offres auxquelles vous avez postulé.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <Alert>
              <AlertDescription>Vous n'avez encore postulé à aucune offre.</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offre</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app: any) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        {app.job_offers?.title || "-"}
                      </TableCell>
                      <TableCell>{app.job_offers?.company || "-"}</TableCell>
                      <TableCell>{app.job_offers?.location_city || "-"}</TableCell>
                      <TableCell>{app.job_offers?.contract_type || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${getStatusBadgeColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(app.applied_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(app.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
