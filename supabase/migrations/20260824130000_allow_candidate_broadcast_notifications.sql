ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif candidate broadcast read" ON public.notifications;
CREATE POLICY "notif candidate broadcast read"
ON public.notifications
FOR SELECT TO authenticated
USING (
  user_id IS NULL
  AND status = 'active'
  AND type IN (
    'admin'::public.notification_type,
    'offre'::public.notification_type,
    'job'::public.notification_type,
    'blog'::public.notification_type,
    'evenement'::public.notification_type
  )
);
