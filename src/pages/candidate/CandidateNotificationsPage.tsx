import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TrashIcon as Trash2,
  CheckCircleIcon as CheckCircle2,
  ArrowRightIcon as ArrowRight,
} from "@phosphor-icons/react";
import { useNotifications } from "@/hooks/useNotifications";
import { CandidateAccountPageSkeleton } from "@/components/candidate/CandidateAccountPageSkeleton";

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
    deleteNotifications,
  } = useNotifications();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  usePageSEO({
    title: "Notifications - EmploiPlus Group",
    description: "Consultez vos notifications",
    robots: "noindex,nofollow",
  });

  const notificationsList = useMemo(() => {
    return notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      description: notif.content || "Aucun détail disponible.",
      date: new Date(notif.created_at).toLocaleDateString("fr-FR"),
      fullDate: new Date(notif.created_at).toLocaleString("fr-FR"),
      read: notif.is_read,
      link: notif.link ?? null,
    }));
  }, [notifications]);

  const selectedNotificationIds = notificationsList
    .filter((notification) => selectedIds.has(notification.id))
    .map((notification) => notification.id);
  const allNotificationsSelected =
    notificationsList.length > 0 && selectedNotificationIds.length === notificationsList.length;

  const toggleNotificationSelection = (notificationId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(notificationId);
      } else {
        next.delete(notificationId);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const deleted = await deleteNotifications(selectedNotificationIds);
      if (deleted) {
        setSelectedIds(new Set());
        setDeleteDialogOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <CandidateAccountPageSkeleton page="notifications" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="hidden" />

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {unreadCount > 0
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues."}
          </div>

          <Button variant="outline" disabled={unreadCount === 0} onClick={markAllAsRead}>
            Marquer tout comme lu
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={selectedNotificationIds.length === 0 || isDeleting}
            onClick={() => setDeleteDialogOpen(true)}
            aria-label={`Supprimer ${selectedNotificationIds.length} notification${selectedNotificationIds.length === 1 ? "" : "s"} sélectionnée${selectedNotificationIds.length === 1 ? "" : "s"}`}
            title="Supprimer les notifications sélectionnées"
            className="text-red-600 hover:bg-transparent hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les notifications sélectionnées ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedNotificationIds.length === 1
                ? "Cette notification sera supprimée de votre espace."
                : `${selectedNotificationIds.length} notifications seront supprimées de votre espace.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting || selectedNotificationIds.length === 0}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteSelected();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {errorMessage && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="-mx-4 space-y-3 sm:-mx-6 lg:-mx-8">
        {notificationsList.length > 0 && (
              <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8">
                <Checkbox
                  id="select-all-notifications"
                  checked={
                    allNotificationsSelected
                      ? true
                      : selectedNotificationIds.length > 0
                        ? "indeterminate"
                        : false
                  }
                  disabled={isDeleting}
                  onCheckedChange={(checked) => {
                    setSelectedIds(
                      checked === true
                        ? new Set(notificationsList.map((notification) => notification.id))
                        : new Set(),
                    );
                  }}
                />
                <label
                  htmlFor="select-all-notifications"
                  className="cursor-pointer text-sm font-medium text-slate-700"
                >
                  Tout sélectionner
                </label>
              </div>
            )}
            {notificationsList.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer rounded-none border-x-0 shadow-none transition-colors duration-200 ease-out hover:shadow-none ${
                  notification.read ? "opacity-75" : "border-blue-200 bg-blue-50 hover:bg-blue-100"
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <CardContent className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Checkbox
                        checked={selectedIds.has(notification.id)}
                        disabled={isDeleting}
                        aria-label={`Sélectionner la notification ${notification.title}`}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={(checked) =>
                          toggleNotificationSelection(notification.id, checked === true)
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
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

                        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm">
                          <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                          <p className="text-slate-600">{notification.description}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500" title={notification.fullDate}>
                          Reçue le {notification.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {notification.link ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-primary/20 text-primary hover:bg-primary/5"
                        >
                          <Link to={notification.link}>
                            Voir
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        aria-label={`Supprimer la notification ${notification.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

        {notificationsList.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
            Aucune notification à afficher.
          </div>
        )}
      </div>
    </div>
  );
}
