import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deleteNotification as deleteNotificationFromApi, getNotificationsForUser, getUnreadNotificationCount, markNotificationsAsRead, NotificationRecord, updateNotification } from "@/integrations/supabase/notifications";

interface NotificationState {
  notifications: NotificationRecord[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const notificationSubscribers = new Set<(state: NotificationState) => void>();
let notificationState: NotificationState = {
  notifications: [],
  loading: true,
  error: null,
  unreadCount: 0,
};
const notifySubscribers = () => {
  notificationSubscribers.forEach((subscriber) => subscriber(notificationState));
};

const updateState = (partial: Partial<NotificationState>) => {
  notificationState = {
    ...notificationState,
    ...partial,
  };
  notifySubscribers();
};

const loadNotifications = async () => {
  try {
    updateState({ loading: true, error: null });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (!user) {
      updateState({ notifications: [], unreadCount: 0, loading: false });
      return;
    }

    const [{ data, error: notifError }, unreadCount] = await Promise.all([
      getNotificationsForUser(user.id),
      getUnreadNotificationCount(user.id),
    ]);
    if (notifError) throw notifError;

    const notifications = Array.isArray(data) ? data : [];
    const allowedTypes = ["admin", "offre", "candidature", "evenement", "job", "contact", "blog"] as const;
    const userNotifications = notifications.filter(
      (notif: NotificationRecord) =>
        notif.status === "active" &&
        (notif.user_id === user.id || notif.user_id === null) &&
        allowedTypes.includes(notif.type as (typeof allowedTypes)[number]),
    );

    updateState({
      notifications: userNotifications,
      unreadCount,
      loading: false,
      error: null,
    });
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Erreur lors du chargement des notifications";
    updateState({ error: errorMsg, loading: false });
    console.error("Error loading notifications:", err);
  }
};

export function useNotifications() {
  const [state, setState] = useState(notificationState);

  useEffect(() => {
    setState(notificationState);
    const subscriber = (nextState: NotificationState) => setState(nextState);
    notificationSubscribers.add(subscriber);
    return () => {
      notificationSubscribers.delete(subscriber);
    };
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;

      const notification = notificationState.notifications.find((item) => item.id === notificationId);
      if (!notification || notification.user_id !== user.id) return;
      const { error: updateError } = await updateNotification(notificationId, { is_read: true, read_at: new Date().toISOString() }, user.id);
      if (updateError) throw updateError;

      const notifications = notificationState.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif,
      );
      const unreadCount = notifications.filter(
        (notif) => notif.user_id === user.id && !notif.is_read,
      ).length;
      updateState({ notifications, unreadCount });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) return;

      const unreadIds = notificationState.notifications
        .filter((n) => n.user_id === user.id && !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length === 0) return;

      const { error: updateError } = await markNotificationsAsRead(unreadIds, user.id);
      if (updateError) throw updateError;

      const notifications = notificationState.notifications.map((notif) => ({
        ...notif,
        is_read: notif.user_id === user.id ? true : notif.is_read,
      }));
      const unreadCount = notifications.filter(
        (notif) => notif.user_id === user.id && !notif.is_read,
      ).length;
      updateState({ notifications, unreadCount });
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return;

      const { error: deleteError } = await deleteNotificationFromApi(notificationId, user.id);
      if (deleteError) throw deleteError;

      const notifications = notificationState.notifications.filter((n) => n.id !== notificationId);
      const unreadCount = notifications.filter(
        (notif) => notif.user_id === user.id && !notif.is_read,
      ).length;
      updateState({ notifications, unreadCount });
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  }, []);

  return {
    notifications: state.notifications,
    loading: state.loading,
    error: state.error,
    unreadCount: state.unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: loadNotifications,
  };
}
