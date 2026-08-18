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
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2.5 text-foreground shadow-soft sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Administration Emploi+
        </p>
        <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">Bienvenue, {name}</h2>
        <p className="line-clamp-2 text-[11px] text-muted-foreground sm:text-xs">
          Gérez vos offres, contenus et équipe depuis un espace premium.
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 rounded-2xl bg-background/70 px-2.5 py-2 shadow-sm sm:gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-background/90 p-1 text-foreground sm:h-10 sm:w-10">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <img src={favicon} alt="Emploi+" className="h-full w-full object-contain" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{name}</p>
          <p className="truncate text-[10px] text-muted-foreground">{email}</p>
        </div>
      </div>
    </div>
  );
}
