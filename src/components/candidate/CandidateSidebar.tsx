import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
  Menu,
  X,
} from "lucide-react";

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
        "fixed left-0 top-0 z-40 h-screen bg-slate-950 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300",
        open ? "w-72" : "w-20"
      )}
      style={{ minWidth: open ? 288 : 80 }}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <img src="/Logo.png" alt="EmploiPlus Group" className="h-7 w-7 object-contain" />
            </div>
            {open && (
              <div>
                <p className="text-sm font-semibold tracking-[0.02em] text-white">EmploiPlus Group</p>
                <p className="text-xs text-slate-300">Espace Candidat</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange?.(!open)}
            className="rounded-xl p-2 text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label={open ? "Replier le menu" : "Déplier le menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const itemContent = (
                <div
                  className={cn(
                    "group flex items-center rounded-2xl px-3 py-3 transition-all duration-200",
                    active
                      ? "bg-secondary text-slate-950 shadow-[0_8px_20px_rgba(232,169,0,0.18)]"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", active ? "bg-white text-secondary" : "bg-slate-900 text-slate-300 group-hover:bg-white/10 group-hover:text-white")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {open && (
                    <span className="ml-3 text-sm font-medium leading-none">{item.label}</span>
                  )}
                </div>
              );

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Link to={item.href} className="block">
                      {itemContent}
                    </Link>
                  </TooltipTrigger>
                  {!open && (
                    <TooltipContent side="right" align="center">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="rounded-2xl bg-slate-900/80 p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-100">Espace Candidat</p>
            <p className="mt-2 leading-relaxed text-slate-400">Tableau de bord conçu pour optimiser votre expérience de candidature.</p>
          </div>
          {open && (
            <Button
              variant="ghost"
              onClick={onLogout}
              className="mt-4 w-full justify-start rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 text-sm text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Déconnexion
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
