import React, { useState } from "react";
import { usePageSEO } from "@/features/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, CalendarDays, ClipboardList, Eye, MapPin, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const { profile, loading: profileLoading } = useCandidate();
  usePageSEO({
    title: "Mes Candidatures - EmploiPlus Group",
    description: "Suivez vos candidatures",
    robots: "noindex,nofollow",
  });

  const { applications, loading, withdrawApplication } = useCandidateApplications();

  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  const openDetails = (application: any) => {
    setSelectedApplication(application);
  };

  const closeDetails = () => {
    setSelectedApplication(null);
  };

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
    <div className="mx-auto min-w-0 w-full max-w-5xl space-y-4 overflow-x-hidden pb-8 md:pb-12">
      <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-sm">
        <div className="flex flex-col gap-2 bg-primary/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Mes candidatures</h1>
              <p className="max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
                Récapitulatif des offres auxquelles vous avez postulé. Les candidatures sont conservées pendant 30 jours.
              </p>
            </div>
          </div>
          {applications.length > 0 ? (
            <div className="w-fit rounded-lg border border-primary/15 bg-background px-2.5 py-1.5">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Total</span>
              <span className="block text-base font-bold leading-tight text-primary">{applications.length}</span>
            </div>
          ) : null}
        </div>
      </div>

      <Card className="min-w-0 w-full overflow-hidden border-primary/15 bg-card shadow-sm">
        <CardHeader className="bg-primary/[0.03] p-5 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{applications.length} candidature(s)</CardTitle>
          <CardDescription className="mt-1">Vos candidatures les plus récentes en premier</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 p-0">
          {applications.length === 0 ? (
            <Alert className="m-4 border-primary/20 bg-primary/5 sm:m-6">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertDescription>
                <span className="font-semibold text-foreground">Aucune candidature pour le moment</span>
                <span className="mt-1 block text-muted-foreground">
                  Vos candidatures apparaîtront ici dès que vous postulerez à une offre.
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Desktop / tablet: table */}
              <div className="hidden min-w-0 max-w-full overflow-x-auto sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
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
                      <TableRow key={app.id} className="group transition-colors hover:bg-primary/[0.03]">
                        <TableCell className="max-w-[240px] font-semibold text-foreground">
                          <span className="line-clamp-2">{app.job_offers?.title || "-"}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{app.job_offers?.company || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{app.job_offers?.location_city || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{app.job_offers?.contract_type || "-"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(app.status)}`}>
                            {getStatusLabel(app.status)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {new Date(app.applied_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openDetails(app)} className="gap-2 text-primary hover:bg-primary/10 hover:text-primary">
                              <Eye className="h-4 w-4" />
                              Détails
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(app.id)} className="gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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

              {/* Mobile: stacked cards */}
              <div className="block space-y-4 p-4 sm:hidden">
                {applications.map((app: any) => (
                  <Card key={app.id} className="border-border/80 shadow-sm">
                    <CardHeader className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">{app.job_offers?.title || "-"}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">{app.job_offers?.company || "-"}</span>
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{app.job_offers?.location_city || "-"}</span>
                        <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-primary" />{new Date(app.applied_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex gap-2 border-t border-border/70 p-4 pt-3">
                      <Button variant="outline" size="sm" onClick={() => openDetails(app)} className="flex-1 gap-2 border-primary/25 text-primary hover:bg-primary/5 hover:text-primary">
                        <Eye className="h-4 w-4" />
                        Voir les détails
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(app.id)} className="px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Supprimer la candidature">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedApplication)} onOpenChange={(open) => { if (!open) closeDetails(); }}>
        <DialogContent className="w-[min(calc(100%-2rem),28rem)] sm:w-[min(calc(100%-3rem),32rem)] rounded-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4 pt-4">
              <div className="grid gap-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Offre</p>
                  <p className="text-sm font-semibold">{selectedApplication.job_offers?.title || "-"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Entreprise</p>
                  <p className="text-sm">{selectedApplication.job_offers?.company || "-"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Localisation</p>
                  <p className="text-sm">{selectedApplication.job_offers?.location_city || "-"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Type</p>
                  <p className="text-sm">{selectedApplication.job_offers?.contract_type || "-"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${getStatusBadgeColor(selectedApplication.status)}`}>
                    {getStatusLabel(selectedApplication.status)}
                  </span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Date</p>
                  <p className="text-sm">
                    {new Date(selectedApplication.applied_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => selectedApplication && handleDelete(selectedApplication.id)}>
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
