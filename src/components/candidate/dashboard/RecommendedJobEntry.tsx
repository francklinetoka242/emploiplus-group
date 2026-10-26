import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/features/jobs/components";
import { saveJobOffer } from "@/features/candidates/api/savedOffersApi";
import type { RecommendedJob } from "@/services/aiMatchingService";
import { toast } from "sonner";
import { DashboardIcon } from "./DashboardIcon";

interface RecommendedJobEntryProps {
  offer: RecommendedJob;
  index: number;
  candidateId: string | null;
  saved: boolean;
  onSaved: () => Promise<void>;
}

export function RecommendedJobEntry({
  offer,
  index,
  candidateId,
  saved,
  onSaved,
}: RecommendedJobEntryProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const location = [offer.location_city ?? "", offer.location_country ?? ""]
    .filter(Boolean)
    .join(" • ");
  const previewText = (offer.description || offer.requirements || "").replace(/\s+/g, " ").trim();
  const deadlineValue = offer.deadline ?? offer.expires_at ?? null;
  const isExpired = Boolean(deadlineValue && new Date(deadlineValue).getTime() < Date.now());
  const matchScore =
    typeof offer.score === "number" ? Math.round(Math.max(0, Math.min(100, offer.score))) : null;

  const handleSave = async () => {
    if (!candidateId || saved || saving) return;
    setSaving(true);
    try {
      await saveJobOffer(candidateId, offer.id);
      toast.success("Offre enregistrée.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’enregistrer cette offre.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <JobCard
      job={{
        slug: offer.slug,
        title: offer.title,
        company: offer.company,
        application_email: offer.application_email ?? null,
        external_link: offer.external_link ?? null,
        salary: offer.salary ?? null,
      }}
      location={location}
      previewText={previewText}
      contractLabel={offer.contract_type ?? null}
      tags={(offer.tags || []).filter(Boolean).slice(0, 3)}
      deadlineValue={deadlineValue}
      isExpired={isExpired}
      index={index}
      shadowless
      editorial
      onApplyClick={() => navigate(`/candidate/jobs/${offer.slug}/apply`)}
      headerActions={
        <div className="flex shrink-0 items-center gap-2">
          {matchScore !== null && (
            <span
              role="img"
              aria-label={`Compatibilité avec votre profil : ${matchScore} %`}
              className="relative flex size-11 items-center justify-center"
            >
              <svg
                viewBox="0 0 44 44"
                className="absolute inset-0 size-full -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - matchScore / 100)}
                  className="text-primary"
                />
              </svg>
              <span className="text-[10px] font-semibold tabular-nums text-foreground">
                {matchScore}%
              </span>
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!candidateId || saved || saving}
            onClick={() => void handleSave()}
            aria-label={saved ? "Offre déjà enregistrée" : `Enregistrer ${offer.title}`}
            title={saved ? "Offre déjà enregistrée" : "Enregistrer l’offre"}
          >
            <DashboardIcon name="BookmarkSimple" size={19} weight={saved ? "fill" : "duotone"} />
          </Button>
        </div>
      }
    />
  );
}
