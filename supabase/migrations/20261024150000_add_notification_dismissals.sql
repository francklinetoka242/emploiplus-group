CREATE TABLE IF NOT EXISTS public.notification_dismissals (
  notification_id uuid NOT NULL REFERENCES public.notifications (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  dismissed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

ALTER TABLE public.notification_dismissals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.notification_dismissals TO authenticated;

DROP POLICY IF EXISTS "notification dismissals select own" ON public.notification_dismissals;
CREATE POLICY "notification dismissals select own"
  ON public.notification_dismissals
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

DROP POLICY IF EXISTS "notification dismissals insert own" ON public.notification_dismissals;
CREATE POLICY "notification dismissals insert own"
  ON public.notification_dismissals
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

DROP POLICY IF EXISTS "notification dismissals update own" ON public.notification_dismissals;
CREATE POLICY "notification dismissals update own"
  ON public.notification_dismissals
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

CREATE INDEX IF NOT EXISTS idx_notification_dismissals_user_id
  ON public.notification_dismissals (user_id);
