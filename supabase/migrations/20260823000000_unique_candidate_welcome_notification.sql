-- Ensure a candidate receives the welcome notification at most once.
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_candidate_welcome_once
ON public.notifications (user_id)
WHERE type = 'evenement'::public.notification_type
  AND title = 'Bienvenue dans votre espace candidat 👋'
  AND user_id IS NOT NULL;