CREATE TABLE public.maelise_rate_limit (
  identity_key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.maelise_rate_limit ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.maelise_rate_limit TO service_role;

CREATE OR REPLACE FUNCTION public.consume_maelise_rate_limit(
  p_identity_key TEXT,
  p_window_seconds INTEGER DEFAULT 60,
  p_max_requests INTEGER DEFAULT 20
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window TIMESTAMPTZ := now();
  current_count INTEGER;
BEGIN
  INSERT INTO public.maelise_rate_limit (identity_key, window_start, request_count)
  VALUES (p_identity_key, current_window, 1)
  ON CONFLICT (identity_key) DO UPDATE
  SET window_start = CASE
      WHEN public.maelise_rate_limit.window_start <= current_window - make_interval(secs => p_window_seconds)
        THEN current_window
      ELSE public.maelise_rate_limit.window_start
    END,
    request_count = CASE
      WHEN public.maelise_rate_limit.window_start <= current_window - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE public.maelise_rate_limit.request_count + 1
    END
  RETURNING request_count INTO current_count;

  RETURN current_count <= p_max_requests;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_maelise_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_maelise_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;