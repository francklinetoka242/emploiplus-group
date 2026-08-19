import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CandidateAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
}

export function CandidateAvatar({ name, avatarUrl, className }: CandidateAvatarProps) {
  const initials = (name ?? "C")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "C";

  return (
    <Avatar className={cn("border-2 border-primary/20 bg-primary/5", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name ?? "Profil candidat"} /> : null}
      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
