import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BriefcaseIcon as Briefcase, CheckCircleIcon as CheckCircle2, MapPinIcon as MapPin } from "@phosphor-icons/react";
import { CandidateAvatar } from "@/components/candidate/CandidateAvatar";

interface ProfileHeaderProps {
  name: string;
  title: string;
  location: string;
  summary: string;
  completionPercentage: number;
  avatarUrl?: string | null;
}

export function ProfileHeader({
  name,
  title,
  location,
  summary,
  completionPercentage,
  avatarUrl,
}: ProfileHeaderProps) {
  const hasCompleteProfile = completionPercentage >= 100;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card p-5 sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <div className="shrink-0 rounded-full bg-primary/5 p-1">
            <CandidateAvatar name={name} avatarUrl={avatarUrl} className="h-16 w-16 border-0 bg-card sm:h-[4.5rem] sm:w-[4.5rem]" />
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{name}</h1>
              <Badge variant="secondary" className="rounded-full border border-primary/15 bg-primary/5 px-2.5 font-medium text-primary hover:bg-primary/10">
                Profil candidat
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-2 font-semibold text-primary">
                <Briefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
                {title || "Titre professionnel à compléter"}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {location || "Localisation à compléter"}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {summary || "Ajoutez un résumé pour mettre en valeur votre parcours."}
            </p>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-primary/10 bg-primary/[0.04] p-4 lg:w-56 lg:shrink-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">Complétude du profil</span>
            <span className="inline-flex items-center gap-1 text-base font-bold tabular-nums text-primary">
              {hasCompleteProfile ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
              {completionPercentage}%
            </span>
          </div>
          <Progress
            value={completionPercentage}
            aria-label="Complétude du profil"
            className="h-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {hasCompleteProfile ? "Votre profil est prêt à être consulté." : "Complétez votre profil pour gagner en visibilité."}
          </p>
        </div>
      </div>
    </div>
  );
}
