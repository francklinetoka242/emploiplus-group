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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border border-slate-200">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback className="bg-slate-100 text-slate-700">
              {initials || <UserRound className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
              <Badge variant="secondary">Profil candidat</Badge>
            </div>
            <p className="text-base font-medium text-slate-700">{title || "Titre professionnel à compléter"}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {location || "Localisation à compléter"}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">{summary || "Ajoutez un résumé pour mettre en valeur votre parcours."}</p>
          </div>
        </div>

        <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Complétude du profil</span>
            <span className="font-semibold text-slate-900">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>
    </div>
  );
}
