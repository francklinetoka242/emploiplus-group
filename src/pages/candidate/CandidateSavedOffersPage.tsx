import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const data = await CandidateAuthService.getCandidateSavedOffers(profile.id);
        setSavedOffers(data || []);
      } catch (err) {
        console.error("Error loading saved offers:", err);
        setError("Impossible de charger vos offres enregistrées. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    void loadSavedOffers();
  }, [profile?.id, profileLoading]);

  const handleUnsave = async (savedOfferId: string) => {
    try {
      await CandidateAuthService.unsaveJobOffer(savedOfferId);
      setSavedOffers((prev) => prev.filter((offer) => offer.id !== savedOfferId));
    } catch (err) {
      console.error("Error removing saved offer:", err);
      setError("Impossible de retirer l'offre enregistrée. Veuillez réessayer.");
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 text-center text-slate-600">
        Chargement de vos offres enregistrées...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Offres Enregistrées</h1>
        <p className="text-slate-600">Consultez les offres que vous avez enregistrées</p>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tableau de mes offres enregistrées</CardTitle>
          <CardDescription>
            {savedOffers.length} offre{savedOffers.length !== 1 ? "s" : ""} enregistrée{savedOffers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedOffers.length === 0 ? (
            <div className="text-center py-10 text-slate-600">
              <p className="mb-4">Vous n'avez pas encore d'offres enregistrées.</p>
              <p className="text-sm">Parcourez les offres d'emploi et enregistrez les offres qui vous intéressent.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold">Offre</TableHead>
                    <TableHead className="font-semibold">Entreprise</TableHead>
                    <TableHead className="font-semibold">Localisation</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Salaire</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedOffers.map((offer) => (
                    <TableRow key={offer.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{offer.job_offers?.title || "—"}</TableCell>
                      <TableCell className="text-slate-600">{offer.job_offers?.company || "—"}</TableCell>
                      <TableCell className="text-slate-600">{offer.job_offers?.location_city || "—"}</TableCell>
                      <TableCell className="text-slate-600">{offer.job_offers?.contract_type || "—"}</TableCell>
                      <TableCell className="text-slate-600">{offer.job_offers?.salary || "À négocier"}</TableCell>
                      <TableCell className="text-slate-600">
                        {offer.saved_at ? new Date(offer.saved_at).toLocaleDateString("fr-FR") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-brand text-brand-foreground hover:bg-brand/90 text-white"
                          >
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleUnsave(offer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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
      {savedOffers.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            ❤️ Vous avez enregistré <strong>{savedOffers.length} offre{savedOffers.length !== 1 ? "s" : ""}</strong>. Consultez-les régulièrement pour ne rien manquer!
          </p>
        </div>
      )}
    </div>
  );
}
