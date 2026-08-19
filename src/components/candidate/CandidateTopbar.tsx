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
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Candidat";
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
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "À propos" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
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
              <Button
                variant="ghost"
                aria-label="Ouvrir le menu du compte"
                className="h-12 gap-3 rounded-2xl border border-transparent bg-transparent px-2.5 pr-3 shadow-none transition-colors hover:bg-muted data-[state=open]:border-border/70 data-[state=open]:bg-card data-[state=open]:shadow-sm data-[state=open]:hover:border-primary/25 data-[state=open]:hover:bg-primary/[0.03]"
              >
                <Avatar className="h-9 w-9 border border-primary/20 bg-primary/5">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex max-w-[190px] flex-col items-start text-left">
                  <p className="w-full truncate text-sm font-semibold text-foreground">{userName}</p>
                  {userEmail && <p className="w-full truncate text-xs text-muted-foreground">{userEmail}</p>}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-2xl border-border/80 p-2 shadow-lg">
              <DropdownMenuItem asChild>
                <Link to="/candidate/profile" className="cursor-pointer rounded-xl py-2.5">
                  <User className="mr-2 h-4 w-4 text-primary" />
                  Mon Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/candidate/settings" className="cursor-pointer rounded-xl py-2.5">
                  <Settings className="mr-2 h-4 w-4 text-primary" />
                  Compte
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer rounded-xl py-2.5 text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
