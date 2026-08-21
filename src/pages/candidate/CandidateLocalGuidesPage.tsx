import { useEffect, useMemo, useState } from "react";
import { FileText, Download, BookOpen, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchLocalGuides } from "@/features/local-guides/localGuideService";
import { ShareButtons } from "@/components/site/ShareButtons";
import type { LocalGuideRecord } from "@/features/local-guides/types";

const categoryColors: Record<string, string> = {
  Salaires: "border border-slate-200 bg-slate-100 text-slate-700",
  "Droit du travail": "border border-slate-200 bg-slate-100 text-slate-700",
  Entretien: "border border-slate-200 bg-slate-100 text-slate-700",
  default: "border border-slate-200 bg-slate-100 text-slate-700",
};

export function CandidateLocalGuidesPage() {
  const [guides, setGuides] = useState<LocalGuideRecord[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<LocalGuideRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadGuides() {
      try {
        const data = await fetchLocalGuides({ visibleOnly: true });
        if (mounted) {
          setGuides(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Impossible de charger les fiches.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadGuides();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => guides, [guides]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Fiches conseils locales</h1>
              <p className="text-sm text-muted-foreground">
                Retrouvez des ressources pratiques pour mieux préparer vos démarches.
              </p>
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Aucune fiche n’est disponible pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((guide) => (
              <article
                key={guide.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
              >
                <div className="flex h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                  {guide.image_url ? (
                    <img src={guide.image_url} alt={guide.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      <FileText className="h-7 w-7" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">{guide.title}</h2>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${categoryColors[guide.category] ?? categoryColors.default}`}
                    >
                      {guide.category}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{guide.description}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setSelectedGuide(guide)}
                    aria-label="Voir le document"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="rounded-xl">
                    <a href={guide.document_url} target="_blank" rel="noreferrer" download>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </a>
                  </Button>
                  <ShareButtons
                    url={typeof window !== "undefined" ? `${window.location.origin}/candidate/guides#${guide.slug}` : ""}
                    text={guide.title}
                    variant="compact"
                    showCopyLink={false}
                    className="!h-9 !w-9"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedGuide)} onOpenChange={(open) => !open && setSelectedGuide(null)}>
        <DialogContent className="max-w-6xl w-[min(96vw,1200px)] p-0 overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
            <div className="min-w-0 pr-4">
              <DialogTitle className="truncate text-base font-semibold text-foreground sm:text-lg">
                {selectedGuide?.title ?? "Aperçu du document"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
                Prévisualisation du PDF dans une fenêtre centrée.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              aria-label="Fermer la prévisualisation"
              onClick={() => setSelectedGuide(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedGuide && (
            <div className="bg-muted/20 p-2 sm:p-3">
              <iframe
                src={selectedGuide.document_url}
                title={selectedGuide.title}
                className="h-[75vh] w-full rounded-2xl border-0 bg-white"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
