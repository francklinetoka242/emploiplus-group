import React from "react";
import { Eye, Ban, CheckCircle2, Trash2 } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { BASE_URL } from "@/lib/seo";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type CandidateRow = Database["public"]["Tables"]["candidates"]["Row"];
type CandidateStatus = CandidateRow["status"];

const statusStyles: Record<CandidateStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-amber-100 text-amber-700",
  archived: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<CandidateStatus, string> = {
  active: "admin.candidates.status.active",
  inactive: "admin.candidates.status.inactive",
  archived: "admin.candidates.status.archived",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminCandidatesPage() {
  const { t } = useI18n();
  const [candidates, setCandidates] = React.useState<CandidateRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = React.useState<CandidateRow | null>(null);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const loadCandidates = React.useCallback(async () => {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setCandidates((data ?? []) as CandidateRow[]);
  }, []);

  React.useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  const candidateStats = React.useMemo(
    () => ({
      active: candidates.filter((candidate) => candidate.status === "active").length,
      inactive: candidates.filter((candidate) => candidate.status === "inactive").length,
      archived: candidates.filter((candidate) => candidate.status === "archived").length,
    }),
    [candidates],
  );

  const handleToggleStatus = async (candidate: CandidateRow) => {
    const nextStatus: CandidateStatus = candidate.status === "active" ? "inactive" : "active";
    setActionLoadingId(candidate.id);
    setMessage(null);

    const { error } = await supabase
      .from("candidates")
      .update({ status: nextStatus })
      .eq("id", candidate.id);

    setActionLoadingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({
      type: "success",
      text: t("admin.candidates.updateSuccess") || "Statut du candidat mis à jour.",
    });
    void loadCandidates();
  };

  const handleDeleteCandidate = async (candidate: CandidateRow) => {
    const confirmed = window.confirm(
      t("admin.candidates.confirmDelete") || "Supprimer définitivement ce candidat ?",
    );
    if (!confirmed) {
      return;
    }

    setActionLoadingId(candidate.id);
    setMessage(null);

    const { error } = await supabase.from("candidates").delete().eq("id", candidate.id);

    setActionLoadingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({
      type: "success",
      text: t("admin.candidates.deleteSuccess") || "Candidat supprimé.",
    });
    void loadCandidates();
  };

  const pageTitle = t("admin.candidates.title") || "Gestion des utilisateurs";
  const pageDescription =
    t("admin.candidates.description") ||
    "Gérez les profils des candidats enregistrés et leurs statuts.";

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={`${BASE_URL}/admin/candidates`}
        robots="noindex,nofollow"
      />
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Administration</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">{pageTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">{pageDescription}</p>
            </div>
            <div className="grid gap-3 sm:auto-cols-min sm:grid-flow-col">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {candidateStats.active} {t("admin.candidates.counts.active") || "Actifs"}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {candidateStats.inactive} {t("admin.candidates.counts.inactive") || "Inactifs"}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {candidateStats.archived} {t("admin.candidates.counts.archived") || "Archivé"}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-3xl border px-4 py-4 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="overflow-hidden rounded-[2rem] border border-border bg-background p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {t("admin.candidates.title") || pageTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {t("admin.candidates.description") || pageDescription}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {loading
                ? "Chargement..."
                : `${candidates.length} ${candidates.length > 1 ? "candidats" : "candidat"}`}
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Chargement des candidats...
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              {t("admin.candidates.noCandidates") || "Aucun candidat n'a été trouvé."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.candidates.table.name") || "Nom"}</TableHead>
                  <TableHead>{t("admin.candidates.table.email") || "Email"}</TableHead>
                  <TableHead>{t("admin.candidates.table.phone") || "Téléphone"}</TableHead>
                  <TableHead>{t("admin.candidates.table.status") || "Statut"}</TableHead>
                  <TableHead>{t("admin.candidates.table.joined") || "Inscrit le"}</TableHead>
                  <TableHead>{t("admin.candidates.table.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">
                          {candidate.first_name} {candidate.last_name}
                        </span>
                        <span className="text-xs text-slate-500">{candidate.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.phone || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[candidate.status]}`}
                      >
                        {t(statusLabels[candidate.status]) || candidate.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(candidate.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          {t("admin.candidates.actions.view") || "Voir les informations"}
                        </Button>
                        <Button
                          variant={candidate.status === "active" ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => void handleToggleStatus(candidate)}
                          disabled={actionLoadingId === candidate.id}
                          className="gap-2"
                        >
                          {candidate.status === "active" ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          {candidate.status === "active"
                            ? t("admin.candidates.actions.block") || "Bloquer"
                            : t("admin.candidates.actions.unblock") || "Débloquer"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleDeleteCandidate(candidate)}
                          disabled={actionLoadingId === candidate.id}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("admin.candidates.actions.delete") || "Supprimer"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog
          open={Boolean(selectedCandidate)}
          onOpenChange={(open) => !open && setSelectedCandidate(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {t("admin.candidates.detail.title") || "Détails du candidat"}
              </DialogTitle>
            </DialogHeader>
            {selectedCandidate ? (
              <div className="space-y-4 py-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      {t("admin.candidates.table.name") || "Nom"}
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedCandidate.first_name} {selectedCandidate.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      {t("admin.candidates.table.email") || "Email"}
                    </p>
                    <p className="mt-1 text-sm text-slate-900">{selectedCandidate.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Téléphone</p>
                    <p className="mt-1 text-sm text-slate-900">{selectedCandidate.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Statut</p>
                    <p
                      className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedCandidate.status]}`}
                    >
                      {t(statusLabels[selectedCandidate.status]) || selectedCandidate.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Inscrit le</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {formatDate(selectedCandidate.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Ville</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedCandidate.location_city || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Pays</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedCandidate.location_country || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Titre professionnel</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedCandidate.headline || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Date de naissance</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedCandidate.date_of_birth || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600">Bio</p>
                  <p className="mt-1 text-sm text-slate-900 whitespace-pre-line">
                    {selectedCandidate.bio || "-"}
                  </p>
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button onClick={() => setSelectedCandidate(null)}>{t("common.cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
