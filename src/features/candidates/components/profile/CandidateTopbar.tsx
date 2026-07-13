import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";

export function CandidateTopbar() {
  const navigate = useNavigate();
  const { profile, logout } = useCandidate();

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Espace candidat</p>
        <p className="text-sm text-slate-500">{profile?.first_name ?? "Profil"}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => void logout().finally(() => navigate("/candidate/login"))}>
        <LogOut className="h-4 w-4" />
        Déconnexion
      </Button>
    </div>
  );
}
