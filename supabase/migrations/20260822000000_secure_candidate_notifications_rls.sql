-- Secure notifications ownership and candidate isolation.
-- Personal notifications must be scoped to auth.uid(); broadcasts remain staff-only unless explicitly assigned.

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif staff read" ON public.notifications;
DROP POLICY IF EXISTS "notif staff update" ON public.notifications;
DROP POLICY IF EXISTS "notif staff manage" ON public.notifications;
DROP POLICY IF EXISTS "notif user read" ON public.notifications;
DROP POLICY IF EXISTS "notif user update own" ON public.notifications;
DROP POLICY IF EXISTS "notif user delete own" ON public.notifications;

CREATE POLICY "notif user select own"
ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "notif user insert own"
ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif user update own"
ON public.notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif user delete own"
ON public.notifications
FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "notif staff manage"
ON public.notifications
FOR ALL TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_status_created_at
  ON public.notifications(user_id, status, created_at DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read_created_at
  ON public.notifications(user_id, is_read, created_at DESC)
  WHERE status = 'active';
