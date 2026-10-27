DROP POLICY IF EXISTS "Authenticated users manage jobs" ON public.job_offers;

CREATE OR REPLACE FUNCTION public.is_active_job_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('admin'::public.app_role, 'super_admin'::public.app_role)
  )
$$;

REVOKE ALL ON FUNCTION public.is_active_job_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_job_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.expire_jobs() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_jobs() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_jobs() TO service_role;
GRANT EXECUTE ON FUNCTION public.publish_scheduled_jobs() TO service_role;

CREATE POLICY "Active admins insert job offers"
ON public.job_offers
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_job_admin());

CREATE POLICY "Active admins update job offers"
ON public.job_offers
FOR UPDATE
TO authenticated
USING (public.is_active_job_admin())
WITH CHECK (public.is_active_job_admin());

CREATE POLICY "Active admins delete job offers"
ON public.job_offers
FOR DELETE
TO authenticated
USING (public.is_active_job_admin());
