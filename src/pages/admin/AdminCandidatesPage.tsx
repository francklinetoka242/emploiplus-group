import React from "react";
import { Eye, Ban, CheckCircle2, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { BASE_URL } from "@/features/seo";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { PaginationNav } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

type CandidateRow = Database["public"]["Tables"]["candidates"]["Row"];
type CandidateStatus = CandidateRow["status"];

const PAGE_SIZE = 10;

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
  const { confirm, confirmationDialog } = useConfirmDialog();
  const { t } = useI18n();
  const [candidates, setCandidates] = React.useState<CandidateRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = React.useState<CandidateRow | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalCandidates, setTotalCandidates] = React.useState(0);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const totalPages = Math.max(1, Math.ceil(totalCandidates / PAGE_SIZE));

  const loadCandidates = React.useCallback(
    async (nextPage = page) => {
      setLoading(true);
      setMessage(null);

      const offset = (nextPage - 1) * PAGE_SIZE;

      const [{ data, error }, { count, error: countError }] = await Promise.all([
        supabase
          .from("candidates")
          .select(
            "id, user_id, first_name, last_name, email, phone, avatar_url, headline, location_city, location_country, date_of_birth, status, created_at, updated_at",
            { count: "exact" },
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1),
        supabase.from("candidates").select("id", { count: "exact", head: true }),
      ]);

      setLoading(false);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      if (countError) {
        setMessage({ type: "error", text: countError.message });
        return;
      }

      setCandidates((data ?? []) as CandidateRow[]);
      setTotalCandidates(count ?? 0);
    },
    [page],
  );

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setPage(safePage);
  };

  React.useEffect(() => {
    void loadCandidates(page);
  }, [loadCandidates, page]);

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
    const confirmed = await confirm(
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
      {confirmationDialog}
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={`${BASE_URL}/admin/candidates`}
        robots="noindex,nofollow"
      />
      <div className="space-y-4">
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
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
              <span className="rounded-full bg-slate-900 px-2.5 py-1.5 text-white">
                {totalCandidates} Total
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                {candidateStats.active} Actifs
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1.5 text-amber-700">
                {candidateStats.inactive} Inactifs
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-700">
                {candidateStats.archived} Archivé
              </span>
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
            <>
              <div className="space-y-3">
                {candidates.map((candidate) => {
                  const initials = `${candidate.first_name?.charAt(0) ?? "C"}${candidate.last_name?.charAt(0) ?? "A"}`.toUpperCase();
                  const fullName = `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim() || "Candidat";
                  const isExpanded = expandedCandidateId === candidate.id;

                  return (
                    <div
                      key={candidate.id}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 text-sm font-semibold text-white shadow-inner">
                            {initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="truncate text-base font-semibold text-slate-900">{fullName}</p>
                              <span
                                className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusStyles[candidate.status]}`}
                              >
                                {t(statusLabels[candidate.status]) || candidate.status}
                              </span>
                            </div>

                            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="truncate">{candidate.email}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{candidate.phone || "Téléphone non renseigné"}</span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setExpandedCandidateId(isExpanded ? null : candidate.id)}
                              className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                              aria-label={isExpanded ? "Réduire les détails" : "Afficher plus de détails"}
                              title={isExpanded ? "Réduire les détails" : "Afficher plus de détails"}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedCandidate(candidate)}
                              className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                              aria-label={t("admin.candidates.actions.view") || "Voir les informations"}
                              title={t("admin.candidates.actions.view") || "Voir les informations"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant={candidate.status === "active" ? "secondary" : "outline"}
                              size="icon"
                              onClick={() => void handleToggleStatus(candidate)}
                              disabled={actionLoadingId === candidate.id}
                              className="h-9 w-9 rounded-full shadow-sm"
                              aria-label={
                                candidate.status === "active"
                                  ? t("admin.candidates.actions.block") || "Bloquer"
                                  : t("admin.candidates.actions.unblock") || "Débloquer"
                              }
                              title={
                                candidate.status === "active"
                                  ? t("admin.candidates.actions.block") || "Bloquer"
                                  : t("admin.candidates.actions.unblock") || "Débloquer"
                              }
                            >
                              {candidate.status === "active" ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => void handleDeleteCandidate(candidate)}
                              disabled={actionLoadingId === candidate.id}
                              className="h-9 w-9 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                              aria-label={t("admin.candidates.actions.delete") || "Supprimer"}
                              title={t("admin.candidates.actions.delete") || "Supprimer"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                            <div className="grid gap-3 text-xs text-slate-600 md:grid-cols-3">
                              <div className="min-w-0 rounded-xl bg-white p-2.5">
                                <p className="font-medium text-slate-500">Ville / Pays</p>
                                <p className="mt-1 truncate text-slate-800">
                                  {candidate.location_city || "-"}
                                  {candidate.location_city && candidate.location_country ? ", " : ""}
                                  {candidate.location_country || ""}
                                </p>
                              </div>
                              <div className="min-w-0 rounded-xl bg-white p-2.5">
                                <p className="font-medium text-slate-500">Inscription</p>
                                <p className="mt-1 text-slate-800">{formatDate(candidate.created_at)}</p>
                              </div>
                              <div className="min-w-0 rounded-xl bg-white p-2.5">
                                <p className="font-medium text-slate-500">Profil</p>
                                <p className="mt-1 truncate text-slate-800">
                                  {candidate.headline || "Profil incomplet"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <PaginationNav
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={loading}
                className="mt-5 border-t border-slate-200 pt-4"
              />
            </>
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
