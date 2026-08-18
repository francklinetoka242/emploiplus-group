import React, { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
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
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCandidate } from "@/hooks/useCandidate";
import { getCandidateSavedOffers, unsaveJobOffer } from "@/features/candidates/api/savedOffersApi";

interface SavedOffer {
  id: string;
  saved_at: string;
  job_offers: {
    id: string;
    title: string;
    company: string;
    location_city: string;
    salary: string | null;
    contract_type: string | null;
  };
}

export function CandidateSavedOffersPage() {
  const { t } = useI18n();
  const { profile, loading: profileLoading } = useCandidate();
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const MAX_SAVED_OFFERS = 5;
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
        const data = await getCandidateSavedOffers(profile.id);
        setSavedOffers(data as SavedOffer[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des offres enregistrées"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSavedOffers();
  }, [profile?.id, profileLoading]);

  const handleDelete = async (savedOfferId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre enregistrée ?")) {
      return;
    }

    setDeleting(savedOfferId);
    try {
      await unsaveJobOffer(savedOfferId);
      setSavedOffers((prev) => prev.filter((offer) => offer.id !== savedOfferId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression de l'offre"
      );
    } finally {
      setDeleting(null);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Offres Enregistrées</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos offres d'emploi favorites. Vous pouvez en enregistrer jusqu'à {MAX_SAVED_OFFERS}.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isFull && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-800" />
          <AlertDescription className="text-yellow-800">
            Vous ne pouvez pas enregistrer plus de {MAX_SAVED_OFFERS} offres. Veuillez supprimer des
            offres enregistrées afin d'en ajouter d'autres.
          </AlertDescription>
        </Alert>
      )}

      {savedOffers.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Aucune offre enregistrée pour le moment.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Consultez les offres disponibles et enregistrez vos favorites.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{savedOffers.length} offre(s) enregistrée(s)</CardTitle>
            <CardDescription>
              Vos offres les plus récentes en premier
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Type de contrat</TableHead>
                  <TableHead>Salaire</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.job_offers.title}</TableCell>
                    <TableCell>{offer.job_offers.company}</TableCell>
                    <TableCell>{offer.job_offers.location_city || "-"}</TableCell>
                    <TableCell className="capitalize">
                      {offer.job_offers.contract_type
                        ? offer.job_offers.contract_type.replace(/_/g, " ")
                        : "-"}
                    </TableCell>
                    <TableCell>{offer.job_offers.salary || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(offer.id)}
                        disabled={deleting === offer.id}
                      >
                        {deleting === offer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
