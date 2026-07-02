import { useMemo } from "react";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationRecord } from "@/integrations/supabase/notifications";
import { Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const typeColors: Record<string, string> = {
  candidature: "bg-green-100 text-green-800",
  offre: "bg-blue-100 text-blue-800",
  evenement: "bg-orange-100 text-orange-800",
  job: "bg-blue-100 text-blue-800",
  contact: "bg-indigo-100 text-indigo-800",
  blog: "bg-purple-100 text-purple-800",
  admin: "bg-slate-100 text-slate-800",
};

const typeLabels: Record<string, string> = {
  candidature: "Candidature",
  offre: "Offre",
  evenement: "Événement",
  job: "Offre",
  contact: "Admin",
  blog: "Blog",
  admin: "Admin",
};

export function CandidateNotificationsPage() {
  const {
    notifications,
    loading,
    error: errorMessage,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  usePageSEO({
    title: "Notifications - EmploiPlus Group",
    description: "Consultez vos notifications",
    robots: "noindex,nofollow",
  });

  const notificationsList = useMemo(() => {
    return notifications.map(notif => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      description: notif.content || "Aucun détail disponible.",
      date: new Date(notif.created_at).toLocaleDateString("fr-FR"),
      fullDate: new Date(notif.created_at).toLocaleString("fr-FR"),
      read: notif.is_read,
    }));
  }, [notifications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600">
            Vous avez <strong>{unreadCount}</strong> notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {unreadCount > 0
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues."}
          </div>

          <Button
            variant="outline"
            disabled={unreadCount === 0 || loading}
            onClick={markAllAsRead}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              "Marquer tout comme lu"
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
            Chargement des notifications…
          </div>
        ) : notificationsList.map((notification) => (
          <Card
            key={notification.id}
            className={`overflow-hidden transition-all duration-200 ease-out cursor-pointer hover:shadow-md ${
              notification.read ? "opacity-75" : "border-blue-200 bg-blue-50 hover:bg-blue-100"
            }`}
            onClick={() => {
              if (!notification.read) {
                markAsRead(notification.id);
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={typeColors[notification.type] || typeColors.admin}>
                      {typeLabels[notification.type] || "Admin"}
                    </Badge>
                    {!notification.read ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        Non lu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Lu
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-slate-900">{notification.title}</h2>
                  <p className="text-sm text-slate-600 mt-2">{notification.description}</p>
                  <p className="text-xs text-slate-500 mt-3" title={notification.fullDate}>
                    Reçue le {notification.date}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="self-start text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  aria-label={`Supprimer la notification ${notification.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && notificationsList.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
            Aucune notification à afficher.
          </div>
        )}
      </div>
    </div>
  );
}
