import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, UserRound } from "lucide-react";

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
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card p-6 shadow-sm sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0 border-2 border-primary/20 bg-primary/5 p-0.5 shadow-sm">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {initials || <UserRound className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{name}</h1>
              <Badge className="border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15">Profil candidat</Badge>
            </div>
            <p className="text-base font-semibold text-primary">{title || "Titre professionnel à compléter"}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {location || "Localisation à compléter"}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{summary || "Ajoutez un résumé pour mettre en valeur votre parcours."}</p>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 lg:min-w-[220px] lg:w-auto">
          <div className="mb-3 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">Complétude du profil</span>
            <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2.5" />
        </div>
      </div>
    </div>
  );
}
