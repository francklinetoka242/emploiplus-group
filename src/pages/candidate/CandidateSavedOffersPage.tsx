import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
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
import {
  AlertCircle,
  BadgeDollarSign,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCandidate } from "@/hooks/useCandidate";
import {
  MAX_SAVED_OFFERS,
  getCandidateSavedOffers,
  unsaveJobOffer,
} from "@/features/candidates/api/savedOffersApi";
import { getCandidateApplications } from "@/features/candidates/api/applicationsApi";
import { notifySavedOfferExpirations } from "@/integrations/supabase/notifications";

interface SavedOffer {
  id: string;
  saved_at: string;
  job_offer_id: string;
  job_offers: {
    id: string;
    slug: string;
    title: string;
    company: string;
    location_city: string | null;
    location_country: string | null;
    salary: string | null;
    contract_type: string | null;
    status: string | null;
    deadline: string | null;
    expires_at: string | null;
    application_email: string | null;
    external_link: string | null;
    application_whatsapp: string | null;
  };
}

function formatStaticStatus(job: SavedOffer["job_offers"]): { label: string; tone: string } {
  const deadlineValue = job.deadline ?? job.expires_at ?? null;
  const now = Date.now();

  if (job.status === "expired" || (deadlineValue && new Date(deadlineValue).getTime() < now)) {
    return { label: "Expirée", tone: "bg-red-50 text-red-700 border-red-200" };
  }

  if (job.status === "archived") {
    return { label: "Archivée", tone: "bg-slate-100 text-slate-700 border-slate-200" };
  }

  return { label: "Active", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

export function CandidateSavedOffersPage() {
  const { profile, loading: profileLoading } = useCandidate();
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showLimitNotice, setShowLimitNotice] = useState(false);

  const isFull = savedOffers.length >= MAX_SAVED_OFFERS;

  usePageSEO({
    title: "Offres Enregistrées - EmploiPlus Group",
    description: "Consultez vos offres enregistrées",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    if (!profile?.id || profileLoading) return;

    const loadSavedOffers = async () => {
      setLoading(true);
      setError(null);

      try {
        const [savedData, applicationsData] = await Promise.all([
          getCandidateSavedOffers(profile.id),
          getCandidateApplications(profile.id),
        ]);

        const savedOffersData = savedData as SavedOffer[];
        const appliedOfferIds = new Set(
          (applicationsData ?? []).map((application) => (application as { job_offer_id?: string }).job_offer_id).filter(Boolean) as string[],
        );

        const hydratedOffers = savedOffersData.map((offer) => ({
          ...offer,
          hasApplied: appliedOfferIds.has(offer.job_offer_id || offer.job_offers?.id),
        }));

        setSavedOffers(hydratedOffers);
        void notifySavedOfferExpirations();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des offres enregistrées",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSavedOffers();
  }, [profile?.id, profile?.user_id, profileLoading]);

  const handleDelete = async (savedOfferId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre enregistrée ?")) {
      return;
    }

    setDeleting(savedOfferId);
    try {
      await unsaveJobOffer(savedOfferId);
      setSavedOffers((prev) => prev.filter((offer) => offer.id !== savedOfferId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'offre");
    } finally {
      setDeleting(null);
    }
  };

  const savedOffersWithMeta = useMemo(
    () =>
      savedOffers.map((offer) => {
        const job = offer.job_offers;
        const status = formatStaticStatus(job);
        const canApply = Boolean(
          job?.slug &&
            job.status !== "archived" &&
            job.status !== "expired" &&
            !(offer as SavedOffer & { hasApplied?: boolean }).hasApplied,
        );

        return {
          ...offer,
          canApply,
          statusLabel: status.label,
          statusTone: status.tone,
          location: [job?.location_city, job?.location_country].filter(Boolean).join(", ") || "À préciser",
          savedDate: new Date(offer.saved_at).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        };
      }),
    [savedOffers],
  );

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-sm">
        <div className="flex flex-col gap-3 bg-primary/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bookmark className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Offres enregistrées</h1>
              <p className="max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
                Gérez vos offres d'emploi favorites. Vous pouvez en enregistrer jusqu'à {MAX_SAVED_OFFERS}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFull ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Afficher les informations sur la limite d'offres enregistrées"
                aria-expanded={showLimitNotice}
                onClick={() => setShowLimitNotice((visible) => !visible)}
                className="h-9 w-9 rounded-lg border-yellow-300 bg-yellow-50 font-bold text-yellow-800 hover:bg-yellow-100"
              >
                !
              </Button>
            ) : null}
            <div className="w-fit rounded-lg border border-primary/15 bg-background px-3 py-2">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Enregistrées</span>
              <span className="block text-lg font-bold leading-tight text-primary">{savedOffers.length}/{MAX_SAVED_OFFERS}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isFull && showLimitNotice && (
        <Alert className="rounded-2xl border-yellow-200 bg-yellow-50 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-yellow-800" />
          <AlertDescription className="text-yellow-800">
            Vous ne pouvez pas enregistrer plus de {MAX_SAVED_OFFERS} offres. Veuillez supprimer des offres enregistrées afin d'en ajouter d'autres.
          </AlertDescription>
        </Alert>
      )}

      {savedOffersWithMeta.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[240px] items-center justify-center p-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Bookmark className="h-7 w-7 text-primary" />
              </div>
              <p className="text-base font-semibold text-foreground">Aucune offre enregistrée pour le moment</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Consultez les offres disponibles et enregistrez vos favorites.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-primary/15 shadow-sm">
          <CardHeader className="bg-primary/[0.03] p-5 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{savedOffersWithMeta.length} offre(s) enregistrée(s)</CardTitle>
            <CardDescription className="mt-1">Vos offres les plus récentes en premier</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Titre</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Enregistrée le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedOffersWithMeta.map((offer) => (
                    <TableRow key={offer.id} className="transition-colors hover:bg-primary/[0.03]">
                      <TableCell className="max-w-[260px] font-semibold text-foreground">
                        <div className="space-y-1">
                          <Link to={`/jobs/${offer.job_offers.slug}`} className="line-clamp-2 text-primary hover:underline">
                            {offer.job_offers.title}
                          </Link>
                          {offer.job_offers.salary ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BadgeDollarSign className="h-3.5 w-3.5 text-primary" />
                              {offer.job_offers.salary}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{offer.job_offers.company}</TableCell>
                      <TableCell className="text-muted-foreground">{offer.location}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {offer.job_offers.contract_type ? offer.job_offers.contract_type.replace(/_/g, " ") : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${offer.statusTone}`}>
                          {offer.statusLabel}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{offer.savedDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline" className="h-9 border-primary/20 text-primary hover:bg-primary/5">
                            <Link to={`/jobs/${offer.job_offers.slug}`}>Voir</Link>
                          </Button>
                          {offer.canApply ? (
                            <Button asChild size="sm" className="h-9 bg-brand text-brand-foreground hover:bg-brand/90">
                              <Link to={`/candidate/jobs/${offer.job_offers.slug}/apply`}>Postuler</Link>
                            </Button>
                          ) : (
                            <span className="inline-flex h-9 items-center rounded-lg border border-border bg-muted px-3 text-xs text-muted-foreground">
                              {offer.job_offers.status === "archived" ? "Offre fermée" : offer.job_offers.status === "expired" ? "Offre expirée" : "Déjà postulé"}
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(offer.id)}
                            disabled={deleting === offer.id}
                            className="h-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            {deleting === offer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 p-4 sm:hidden">
              {savedOffersWithMeta.map((offer) => (
                <div key={offer.id} className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/jobs/${offer.job_offers.slug}`} className="line-clamp-2 text-base font-semibold leading-tight text-foreground hover:text-primary">
                        {offer.job_offers.title}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{offer.job_offers.company}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(offer.id)}
                      disabled={deleting === offer.id}
                      aria-label={`Supprimer ${offer.job_offers.title}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      {deleting === offer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{offer.location}</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5"><BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />{offer.job_offers.contract_type?.replace(/_/g, " ") || "-"}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${offer.statusTone}`}><Clock3 className="h-3.5 w-3.5" />{offer.statusLabel}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5"><CalendarDays className="h-3.5 w-3.5 text-primary" />Enregistrée le {offer.savedDate}</span>
                    {offer.canApply ? (
                      <Button asChild size="sm" className="h-9 bg-brand text-brand-foreground hover:bg-brand/90">
                        <Link to={`/candidate/jobs/${offer.job_offers.slug}/apply`}>Postuler</Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {offer.job_offers.status === "archived" ? "Offre fermée" : offer.job_offers.status === "expired" ? "Offre expirée" : "Déjà postulé"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
