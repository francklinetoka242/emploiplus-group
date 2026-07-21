import { useEffect, useMemo, useState } from "react";
import { FileText, Download, BookOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchLocalGuides } from "@/features/local-guides/localGuideService";
import { ShareButtons } from "@/components/site/ShareButtons";
import type { LocalGuideRecord } from "@/features/local-guides/types";

const categoryColors: Record<string, string> = {
  Salaires: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Droit du travail": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Entretien: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  default: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

export function CandidateLocalGuidesPage() {
  const [guides, setGuides] = useState<LocalGuideRecord[]>([]);
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
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
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Aucune fiche n’est disponible pour le moment.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((guide) => (
            <article key={guide.id} className="group overflow-visible rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20">
                {guide.image_url ? (
                  <img src={guide.image_url} alt={guide.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <FileText className="h-12 w-12 text-slate-600 dark:text-slate-200" />
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[guide.category] ?? categoryColors.default}`}>
                    {guide.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{guide.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{guide.description}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild className="w-full rounded-2xl">
                    <a href={guide.document_url} target="_blank" rel="noreferrer" aria-label="Voir le document">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-2xl">
                    <a href={guide.document_url} target="_blank" rel="noreferrer" download>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </a>
                  </Button>
                  <div className="ml-auto">
                    <ShareButtons
                      url={typeof window !== "undefined" ? `${window.location.origin}/candidate/guides#${guide.slug}` : ""}
                      text={guide.title}
                      variant="compact"
                      showCopyLink={false}
                      className="!h-9 !w-9"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
