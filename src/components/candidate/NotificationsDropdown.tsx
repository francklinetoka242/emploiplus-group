import React from "react";
import { Link } from "react-router-dom";
import { Bell, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationRecord } from "@/integrations/supabase/notifications";

interface NotificationsDropdownProps {
  notifications: NotificationRecord[];
  unreadCount: number;
  loading?: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  candidature: "Candidature",
  offre: "Offre",
  evenement: "Événement",
  job: "Offre",
  contact: "Admin",
  blog: "Blog",
  admin: "Admin",
};

const typeColors: Record<string, string> = {
  candidature: "bg-green-100 text-green-800",
  offre: "bg-blue-100 text-blue-800",
  evenement: "bg-orange-100 text-orange-800",
  job: "bg-blue-100 text-blue-800",
  contact: "bg-indigo-100 text-indigo-800",
  blog: "bg-purple-100 text-purple-800",
  admin: "bg-slate-100 text-slate-800",
};

export function NotificationsDropdown({
  notifications,
  unreadCount,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationsDropdownProps) {
  const recentNotifications = notifications.slice(0, 5);
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600 hover:text-slate-900"
        >
          <Bell className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              <Check className="w-3 h-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {loading ? (
            <div className="px-4 py-8 text-center text-slate-500">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">Aucune notification</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {notification.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${typeColors[notification.type] || typeColors.admin}`}
                        >
                          {typeLabels[notification.type] || "Admin"}
                        </Badge>
                      </div>
                      {notification.content && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="w-8 h-8 p-0"
                        >
                          <Check className="w-4 h-4 text-slate-400" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(notification.id)}
                        className="w-8 h-8 p-0 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link
                to="/candidate/notifications"
                className="flex items-center justify-center py-2 text-slate-600 hover:text-slate-900"
              >
                Voir toutes les notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
