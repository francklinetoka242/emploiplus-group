import React from "react";
import { Link } from "react-router-dom";
import { Menu, Settings, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCandidate } from "@/hooks/useCandidate";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsDropdown } from "./NotificationsDropdown";

interface CandidateMobileHeaderProps {
  title: string;
  onMenuOpen: () => void;
  onLogout: () => void;
}

export function CandidateMobileHeader({ title, onMenuOpen, onLogout }: CandidateMobileHeaderProps) {
  const { profile, logout } = useCandidate();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : "C";

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm md:hidden">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuOpen}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Page Title */}
      <div className="flex-1">
        <h1 className="truncate text-sm font-semibold text-slate-900">{title}</h1>
      </div>

      {/* Notifications & Avatar */}
      <div className="flex items-center gap-3">
        {notificationsLoading ? (
          <Button variant="ghost" size="icon" disabled className="rounded-lg p-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </Button>
        ) : (
          <NotificationsDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Ouvrir le menu du compte"
            >
              <Avatar className="h-9 w-9 border-2 border-slate-200">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile?.first_name ?? undefined} />
                )}
                <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-slate-900">
                {profile?.first_name || "Candidat"}
              </p>
              {profile?.email && <p className="text-xs text-slate-600">{profile.email}</p>}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/candidate/profile" className="cursor-pointer">
                Mon Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/candidate/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void handleLogout()} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
