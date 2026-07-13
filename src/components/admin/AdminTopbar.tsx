import type { Session } from "@supabase/supabase-js";
import favicon from "@/assets/favicon.ico";
import { useI18n } from "@/i18n";

interface AdminTopbarProps {
  session: Session | null;
}

export default function AdminTopbar({ session }: AdminTopbarProps) {
  const name =
    session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "Administrateur";
  const email = session.user?.email || "admin@emploiplus.group";
  const avatar =
    session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || "";

  return (
    <div className="flex flex-col gap-3 sm:gap-4 rounded-xl sm:rounded-[2rem] border border-border bg-card p-3 sm:p-5 text-foreground shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 sm:space-y-2 min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground truncate">Administration Emploi+</p>
        <h2 className="text-lg sm:text-2xl font-semibold text-foreground truncate">Bienvenue, {name}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          Gérez vos offres, contenus et équipe depuis un espace premium.
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-background/70 px-3 sm:px-4 py-2 sm:py-3 shadow-sm flex-shrink-0">
        <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl bg-background/90 p-1 text-foreground flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <img src={favicon} alt="Emploi+" className="h-full w-full object-contain" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
      </div>
    </div>
  );
}
