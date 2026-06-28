import logoMonago from "@/assets/logo-monago.jpg";
import { useI18n } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

interface AdminTopbarProps {
  session: any;
}

export default AdminTopbar;

export function AdminTopbar({ session }: AdminTopbarProps) {
  const name = session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "Administrateur";
  const email = session.user?.email || "admin@emploiplus.group";
  const avatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || "";

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-slate-950/95 p-5 text-slate-50 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Administration Emploi+</p>
        <h2 className="text-2xl font-semibold text-white">Bienvenue, {name}</h2>
        <p className="text-sm text-slate-300">Gérez vos offres, contenus et équipe depuis un espace premium.</p>
      </div>
      <div className="flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl bg-slate-800 p-1 text-slate-200">
          {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : <img src={logoMonago} alt="Emploi+" className="h-full w-full object-contain" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-slate-400">{email}</p>
        </div>
      </div>
    </div>
  );
}
