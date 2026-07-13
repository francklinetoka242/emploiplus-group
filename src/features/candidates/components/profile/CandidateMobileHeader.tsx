import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

export function CandidateMobileHeader() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <Link to="/candidate/dashboard" className="text-sm font-semibold text-slate-900">
        Espace candidat
      </Link>
      <button className="rounded-lg border border-slate-200 p-2">
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}
