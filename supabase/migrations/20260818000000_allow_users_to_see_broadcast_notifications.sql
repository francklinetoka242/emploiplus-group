-- Drop the old "notif user read" policy if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'notif user read' AND polrelid = 'public.notifications'::regclass) THEN
    DROP POLICY "notif user read" ON public.notifications;
  END IF;
END $$;

-- Create new policy that allows users to see their own notifications AND broadcast notifications (where user_id is null)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'notif user read' AND polrelid = 'public.notifications'::regclass) THEN
    CREATE POLICY "notif user read" ON public.notifications
      FOR SELECT TO authenticated
      USING (status = 'active' AND (user_id = auth.uid() OR user_id IS NULL));
  END IF;
END $$;
