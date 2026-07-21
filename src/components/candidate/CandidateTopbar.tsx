import React, { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
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
import { cn } from "@/lib/utils";

interface CandidateTopbarProps {
  onMenuToggle?: () => void;
  onLogout?: () => Promise<void> | void;
}

export function CandidateTopbar({ onMenuToggle }: CandidateTopbarProps) {
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
    return (profile.first_name || "").trim() || "Candidat";
  }, [profile]);

  const userEmail = useMemo(() => {
    return profile?.email || "";
  }, [profile]);

  const avatarUrl = useMemo(() => {
    return profile?.avatar_url || "";
  }, [profile]);

  const initials = useMemo(() => {
    const first = profile?.first_name?.trim() || userName || "C";
    return first.slice(0, 2).toUpperCase();
  }, [profile, userName]);

  const publicLinks = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
    { to: "/jobs", label: "Emplois" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
    { to: "/about", label: "À propos" },
    { to: "/contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="hidden md:flex bg-background border-b border-border px-6 py-4 w-full">
      <div className="flex items-center justify-between max-w-full w-full">
        {/* Left: Menu Toggle and public links */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {onMenuToggle && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <nav className="flex items-center gap-1.5">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          {notificationsLoading ? (
            <Button variant="ghost" size="icon" disabled className="text-muted-foreground">
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
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
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
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-red-600">
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
