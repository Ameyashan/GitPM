-- ============================================================
-- 013_jobs_public_read.sql — allow anonymous users to read active jobs
-- ============================================================

-- Job listings are public information; anyone should be able to browse them.
-- The authenticated-only policy in 012 was too restrictive and caused
-- non-logged-in users to see 0 results.
CREATE POLICY "jobs_anon_read"
  ON public.jobs
  FOR SELECT
  TO anon
  USING (is_active = TRUE);
