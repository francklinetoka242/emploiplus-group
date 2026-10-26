import { getDayOfYear } from "date-fns";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { LocalGuideRecord } from "@/features/local-guides/types";
import type { AsyncMetric } from "@/features/candidates/dashboard/dashboardTypes";
import { DashboardIcon } from "./DashboardIcon";
import { DashboardSection } from "./DashboardSection";
import { openMaelise } from "./openMaelise";

interface DashboardAdviceProps {
  guides: AsyncMetric<LocalGuideRecord[]>;
  onRetry: () => void;
}

const suggestionKeys = [
  "maelise.suggestion.jobs",
  "maelise.suggestion.cv",
  "maelise.suggestion.application",
] as const;

export function DashboardAdvice({ guides, onRetry }: DashboardAdviceProps) {
  const { t } = useI18n();
  const dailyGuide =
    guides.data.length > 0 ? guides.data[getDayOfYear(new Date()) % guides.data.length] : undefined;

  return (
    <DashboardSection
      eyebrow="Pour avancer"
      title="Un conseil pour avancer"
      description="Des ressources utiles et des questions pour votre recherche."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:divide-x lg:divide-border">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Posez une question à Maelise
          </h3>
          <div className="flex flex-col items-start gap-2">
            {suggestionKeys.map((key) => (
              <Button
                key={key}
                type="button"
                variant="link"
                size="sm"
                onClick={() => openMaelise(t(key))}
                className="h-auto whitespace-normal px-0 text-left"
              >
                {t(key)}
              </Button>
            ))}
          </div>
        </div>
        <div className="lg:pl-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <DashboardIcon name="FileText" size={17} className="text-muted-foreground" />
            <span>Conseil du jour</span>
          </div>
          {guides.loading ? (
            <div
              className="mt-3 space-y-2"
              role="status"
              aria-label="Chargement du conseil du jour"
            >
              <Skeleton className="h-5 w-3/4 rounded-sm" />
              <Skeleton className="h-12 w-full rounded-sm" />
            </div>
          ) : guides.error ? (
            <div className="mt-3" role="alert">
              <p className="text-sm text-destructive">{guides.error}</p>
              <Button variant="ghost" size="sm" onClick={onRetry} className="mt-1 px-0">
                Réessayer
              </Button>
            </div>
          ) : dailyGuide ? (
            <>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {dailyGuide.category}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-foreground">{dailyGuide.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm leading-5 text-muted-foreground">
                {dailyGuide.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={dailyGuide.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Lire la fiche
                </a>
                <Link
                  to="/candidate/guides"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Toutes les fiches
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Aucune fiche conseil n’est disponible pour le moment.{" "}
              <Link
                to="/candidate/guides"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Consulter les fiches
              </Link>
            </p>
          )}
        </div>
      </div>
    </DashboardSection>
  );
}
