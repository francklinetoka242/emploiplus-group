import React from "react";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCandidate } from "@/hooks/useCandidate";
import { useNotifications } from "@/hooks/useNotifications.ts";

interface CandidateMobileHeaderProps {
  title: string;
  onMenuOpen: () => void;
  onLogout: () => void;
}

export function CandidateMobileHeader({ title, onMenuOpen, onLogout }: CandidateMobileHeaderProps) {
  const { profile } = useCandidate();
  const { unreadCount } = useNotifications();

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : "C";

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
        {/* Notification Badge */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-slate-200">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile?.first_name} />}
          <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-600">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
