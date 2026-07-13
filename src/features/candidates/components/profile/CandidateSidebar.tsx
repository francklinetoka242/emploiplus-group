import { NavLink } from "react-router-dom";
import { Home, FileText, BookOpen, Briefcase, Settings, Languages, Sparkles } from "lucide-react";

const links = [
  { to: "/candidate/dashboard", label: "Tableau de bord", icon: Home },
  { to: "/candidate/profile", label: "Profil", icon: FileText },
  { to: "/candidate/experiences", label: "Expériences", icon: Briefcase },
  { to: "/candidate/education", label: "Formations", icon: BookOpen },
  { to: "/candidate/skills", label: "Compétences", icon: Sparkles },
  { to: "/candidate/languages", label: "Langues", icon: Languages },
  { to: "/candidate/cv", label: "CV & documents", icon: FileText },
  { to: "/candidate/settings", label: "Paramètres", icon: Settings },
];

export function CandidateSidebar() {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-50 lg:flex">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Mon espace</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
