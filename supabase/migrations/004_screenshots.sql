-- ============================================================
-- 004_screenshots.sql — screenshots table and RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.screenshots (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url      TEXT        NOT NULL,
  display_order  INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

-- Owner: full CRUD — confirmed by joining to projects to check ownership
CREATE POLICY "screenshots_owner_select"
  ON public.screenshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = screenshots.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "screenshots_owner_insert"
  ON public.screenshots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = screenshots.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "screenshots_owner_update"
  ON public.screenshots
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = screenshots.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = screenshots.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "screenshots_owner_delete"
  ON public.screenshots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = screenshots.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Public: read screenshots for published projects only
CREATE POLICY "screenshots_public_read_published"
  ON public.screenshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = screenshots.project_id
        AND projects.is_published = TRUE
    )
  );
