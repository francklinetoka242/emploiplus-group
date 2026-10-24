import React, { useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GearIcon as Settings,
  SignOutIcon as LogOut,
  CaretDownIcon as ChevronDown,
  ListIcon as Menu,
  CircleNotchIcon as Loader2,
  UserIcon as User,
} from "@phosphor-icons/react";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { CandidateAvatar } from "./CandidateAvatar";
import { useNotifications } from "@/hooks/useNotifications";
import { useCandidate } from "@/hooks/useCandidate";
import { cn } from "@/lib/utils";

interface CandidateTopbarProps {
  onMenuToggle?: () => void;
  onMaeliseToggle?: () => void;
  isMaeliseCollapsed?: boolean;
  onLogout?: () => Promise<void> | void;
}

export function CandidateTopbar({
  onMenuToggle,
  onMaeliseToggle,
  isMaeliseCollapsed = false,
}: CandidateTopbarProps) {
  const location = useLocation();
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

  const publicLinks = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "À propos" },
    { to: "/faq", label: "FAQ" },
  ];
  const serviceLinks = [
    { to: "/services/mise-disposition-rh", label: "Mise à disposition" },
    { to: "/services/recrutement", label: "Recrutement" },
    { to: "/services/externalisation", label: "Externalisation" },
    { to: "/services/conseil-formation", label: "Formation & Conseil" },
  ];
  const isServicesActive = location.pathname.startsWith("/services");

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="hidden w-full bg-slate-100 px-6 py-2 dark:bg-slate-900 md:flex">
      <div className="flex items-center justify-between max-w-full w-full">
        {/* Left: Menu Toggle and public links */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {onMenuToggle && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <nav className="flex items-center gap-1.5">
            {publicLinks.map((link) =>
              link.to === "/services" ? (
                <DropdownMenu key={link.to}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-auto rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        isServicesActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                    {serviceLinks.map((service) => (
                      <DropdownMenuItem key={service.to} asChild>
                        <Link to={service.to} className="cursor-pointer rounded-lg py-2.5">
                          {service.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>
        </div>

        {/* Right: Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {onMaeliseToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMaeliseToggle}
              aria-label={isMaeliseCollapsed ? "Ouvrir Maélise" : "Fermer Maélise"}
              title={isMaeliseCollapsed ? "Ouvrir Maélise" : "Fermer Maélise"}
              className="size-10 text-muted-foreground hover:text-foreground"
            >
              <img
                src="/robot-maélise-IA.png"
                alt=""
                className="h-7 w-7 object-contain"
              />
            </Button>
          )}
          {/* Notifications Dropdown */}
          {notificationsLoading ? (
            <Button variant="ghost" size="icon" disabled className="text-muted-foreground">
              <Loader2 className="size-7 animate-spin" />
            </Button>
          ) : (
            <NotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              iconClassName="size-7"
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
                <CandidateAvatar name={userName} avatarUrl={avatarUrl} className="h-7 w-7 border" />
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
