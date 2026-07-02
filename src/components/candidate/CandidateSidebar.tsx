import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Star,
  Globe,
  Target,
  Send,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CandidateSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogout?: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: Home, href: "/candidate/dashboard" },
  { id: "profile", label: "Mon profil", icon: User, href: "/candidate/profile" },
  { id: "cv", label: "Mon CV", icon: FileText, href: "/candidate/cv" },
  { id: "experience", label: "Expériences professionnelles", icon: Briefcase, href: "/candidate/experience" },
  { id: "education", label: "Formations", icon: GraduationCap, href: "/candidate/education" },
  { id: "skills", label: "Compétences", icon: Star, href: "/candidate/skills" },
  { id: "languages", label: "Langues", icon: Globe, href: "/candidate/languages" },
  { id: "preferences", label: "Préférences d'emploi", icon: Target, href: "/candidate/preferences" },
  { id: "applications", label: "Mes candidatures", icon: Send, href: "/candidate/applications" },
  { id: "saved", label: "Offres enregistrées", icon: Heart, href: "/candidate/saved-offers" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/candidate/notifications" },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/candidate/settings" },
];

export function CandidateSidebar({ open = true, onOpenChange, onLogout }: CandidateSidebarProps) {
  const location = useLocation();
  
  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <aside
      className={cn(
        "h-screen bg-slate-900 text-white transition-all duration-300 overflow-y-auto",
        open ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-lg bg-white/10 shadow-sm">
          <img src="/src/assets/favicon.ico" alt="EmploiPlus Group" className="h-8 w-8 object-contain" />
        </div>
        {open && <span className="ml-2 font-bold text-lg">EmploiPlus</span>}
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.id === "logout") {
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-800",
                  active && "bg-slate-800 text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", open ? "mr-3" : "")} />
                {open && item.label}
              </Button>
            );
          }

          return (
            <Link key={item.id} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-800",
                  active && "bg-slate-800 text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", open ? "mr-3" : "")}
                  />
                {open && item.label}
              </Button>
            </Link>
          );
        })}

        {/* Divider */}
        {open && <div className="my-4 border-t border-slate-800" />}

        {/* Logout */}
        {open && (
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </Button>
        )}
      </nav>
    </aside>
  );
}
