-- ============================================================
-- 012_jobs.sql — jobs table for PM/FDE role board
-- ============================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name     TEXT        NOT NULL,
  company_logo_url TEXT,
  role_title       TEXT        NOT NULL,
  role_type        TEXT        NOT NULL CHECK (role_type IN ('PM', 'APM', 'Senior PM', 'Staff', 'FDE')),
  location         TEXT,
  remote           BOOLEAN     NOT NULL DEFAULT FALSE,
  salary_min       INTEGER,
  salary_max       INTEGER,
  stack_tags       TEXT[]      NOT NULL DEFAULT '{}',
  tools_tags       TEXT[]      NOT NULL DEFAULT '{}',
  apply_url        TEXT        NOT NULL,
  source           TEXT        NOT NULL CHECK (source IN ('greenhouse', 'ashby', 'manual')),
  source_id        TEXT        NOT NULL,
  posted_at        TIMESTAMPTZ,
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,

  CONSTRAINT jobs_source_source_id_unique UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS jobs_active_posted_at_idx
  ON public.jobs (is_active, posted_at DESC);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read active jobs
CREATE POLICY "jobs_authenticated_read"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);
