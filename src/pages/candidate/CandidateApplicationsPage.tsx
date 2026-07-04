import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePageSEO } from "@/lib/seo";
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
import { CandidateAuthService } from "@/integrations/supabase/candidate-auth";


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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageSEO({
    title: "Mes Candidatures - EmploiPlus Group",
    description: "Suivez vos candidatures",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    if (!profile?.id || profileLoading) return;

    const loadApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await CandidateAuthService.getCandidateApplications(profile.id);
        setApplications(data || []);
      } catch (err) {
        console.error("Error loading applications:", err);
        setError("Impossible de charger vos candidatures. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    void loadApplications();
  }, [profile?.id, profileLoading]);

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir retirer cette candidature ?")) {
      return;
    }

    try {
      await CandidateAuthService.withdrawApplication(applicationId);
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (err) {
      console.error("Error withdrawing application:", err);
      setError("Impossible de retirer la candidature. Veuillez réessayer.");
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 text-center text-slate-600">
        Chargement de vos candidatures...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tableau de mes candidatures</CardTitle>
          <CardDescription>
            {applications.length} candidature{applications.length !== 1 ? "s" : ""} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10 text-slate-600">
              <p className="mb-4">Vous n'avez pas encore de candidatures.</p>
              <p className="text-sm">Parcourez les offres d'emploi et postulez pour commencer.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold">Offre</TableHead>
                    <TableHead className="font-semibold">Entreprise</TableHead>
                    <TableHead className="font-semibold">Localisation</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{app.job_offers?.title || "—"}</TableCell>
                      <TableCell className="text-slate-600">{app.job_offers?.company || "—"}</TableCell>
                      <TableCell className="text-slate-600">{app.job_offers?.location_city || "—"}</TableCell>
                      <TableCell className="text-slate-600">
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString("fr-FR") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(app.status)}>
                          {getStatusLabel(app.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:text-slate-700 gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </Button>
                          {app.status !== "withdrawn" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleWithdraw(app.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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

      {applications.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 Vous avez candidaté à <strong>{applications.length} offre{applications.length !== 1 ? "s" : ""}</strong>. Consultez régulièrement cette page pour suivre l'avancement de vos candidatures.
          </p>
        </div>
      )}
    </div>
  );
}
