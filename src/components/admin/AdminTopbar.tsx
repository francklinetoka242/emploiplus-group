import type { Session } from "@supabase/supabase-js";
import favicon from "@/assets/favicon.ico";
import { useI18n } from "@/lib/i18n";

interface AdminTopbarProps {
  session: Session | null;
}

export default AdminTopbar;

export function AdminTopbar({ session }: AdminTopbarProps) {
  const name =
    session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "Administrateur";
  const email = session.user?.email || "admin@emploiplus.group";
  const avatar =
    session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || "";

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card p-5 text-foreground shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Administration Emploi+</p>
        <h2 className="text-2xl font-semibold text-foreground">Bienvenue, {name}</h2>
        <p className="text-sm text-muted-foreground">
          Gérez vos offres, contenus et équipe depuis un espace premium.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-3xl bg-background/70 px-4 py-3 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl bg-background/90 p-1 text-foreground">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <img src={favicon} alt="Emploi+" className="h-full w-full object-contain" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
    </div>
  );
}
