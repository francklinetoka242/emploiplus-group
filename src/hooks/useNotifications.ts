import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchNotifications, NotificationRecord } from '@/integrations/supabase/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Fetch notifications
      const { data, error: notifError } = await fetchNotifications();
      if (notifError) throw notifError;

      // Filter notifications for current user
      const userNotifications = (data || []).filter(notif => 
        notif.status === 'active' && (notif.user_id === null || notif.user_id === user.id)
      );

      setNotifications(userNotifications);
      const unread = userNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du chargement des notifications';
      setError(errorMsg);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) return;

      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) throw deleteError;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const deleted = notifications.find(n => n.id === notificationId);
        return deleted && !deleted.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel('notifications-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: loadNotifications,
  };
}
