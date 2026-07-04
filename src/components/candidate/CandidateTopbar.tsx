import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, ChevronDown, Menu, Loader2, User } from "lucide-react";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { useCandidate } from "@/hooks/useCandidate";

interface CandidateTopbarProps {
  onMenuToggle?: () => void;
}

export function CandidateTopbar({
  onMenuToggle,
}: CandidateTopbarProps) {
  const { profile, logout } = useCandidate();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const userName = useMemo(() => {
    if (!profile) return "Candidat";
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Candidat";
  }, [profile]);

  const userEmail = useMemo(() => {
    return profile?.email || "";
  }, [profile]);

  const avatarUrl = useMemo(() => {
    return profile?.avatar_url || "";
  }, [profile]);

  const initials = useMemo(() => {
    return userName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [userName]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="hidden md:flex bg-white border-b border-slate-200 px-6 py-4 w-full">
      <div className="flex items-center justify-between max-w-full w-full">
        {/* Left: Menu Toggle */}
        <div className="flex items-center">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Right: Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          {notificationsLoading ? (
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="text-slate-600"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
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


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback className="bg-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  {userEmail && (
                    <p className="text-xs text-slate-600">{userEmail}</p>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                {userEmail && (
                  <p className="text-xs text-slate-600">{userEmail}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/candidate/profile" className="cursor-pointer">
                  Mon Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/candidate/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={handleLogout}
                className="cursor-pointer text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
