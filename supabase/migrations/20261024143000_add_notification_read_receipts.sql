CREATE TABLE IF NOT EXISTS public.notification_reads (
  notification_id uuid NOT NULL REFERENCES public.notifications (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

DROP POLICY IF EXISTS "notif user read" ON public.notifications;
DROP POLICY IF EXISTS "notif user select own" ON public.notifications;
CREATE POLICY "notif user select visible"
  ON public.notifications
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND (
      user_id = auth.uid()
      OR (
        user_id IS NULL
        AND type::text IN ('admin', 'offre', 'job', 'blog', 'evenement')
      )
    )
  );

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.notification_reads TO authenticated;

DROP POLICY IF EXISTS "notification reads select own" ON public.notification_reads;
CREATE POLICY "notification reads select own"
  ON public.notification_reads
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.notifications notification
      WHERE notification.id = notification_id
        AND notification.user_id IS NULL
        AND notification.status = 'active'
    )
  );

DROP POLICY IF EXISTS "notification reads insert own" ON public.notification_reads;
CREATE POLICY "notification reads insert own"
  ON public.notification_reads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.notifications notification
      WHERE notification.id = notification_id
        AND notification.user_id IS NULL
        AND notification.status = 'active'
    )
  );

DROP POLICY IF EXISTS "notification reads update own" ON public.notification_reads;
CREATE POLICY "notification reads update own"
  ON public.notification_reads
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.notifications notification
      WHERE notification.id = notification_id
        AND notification.user_id IS NULL
        AND notification.status = 'active'
    )
  );

CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id
  ON public.notification_reads (user_id);
