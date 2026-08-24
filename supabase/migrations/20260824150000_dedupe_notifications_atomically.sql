DELETE FROM public.notifications AS duplicate
USING public.notifications AS original
WHERE duplicate.id > original.id
  AND duplicate.user_id IS NOT NULL
  AND original.user_id = duplicate.user_id
  AND original.type = duplicate.type
  AND original.title = duplicate.title
  AND COALESCE(original.body, '') = COALESCE(duplicate.body, '')
  AND COALESCE(original.link, '') = COALESCE(duplicate.link, '')
  AND original.status = duplicate.status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique_personal_event
ON public.notifications (
  user_id,
  type,
  title,
  COALESCE(body, ''),
  COALESCE(link, ''),
  status
)
WHERE user_id IS NOT NULL;