-- ============================================================
-- 002_projects.sql — projects table and RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug                 TEXT NOT NULL,
  name                 TEXT NOT NULL,
  description          TEXT NOT NULL DEFAULT '',
  live_url             TEXT NOT NULL,
  github_repo_url      TEXT,
  thumbnail_url        TEXT,
  demo_video_url       TEXT,
  build_tools          TEXT[]       NOT NULL DEFAULT '{}',
  hosting_platform     TEXT,
  tech_stack           TEXT[]       NOT NULL DEFAULT '{}',
  category_tags        TEXT[]       NOT NULL DEFAULT '{}',
  problem_statement    TEXT         NOT NULL DEFAULT '',
  target_user          TEXT,
  key_decisions        TEXT,
  learnings            TEXT,
  metrics_text         TEXT,
  commit_count         INTEGER,
  first_commit_at      TIMESTAMPTZ,
  latest_deploy_at     TIMESTAMPTZ,
  is_solo              BOOLEAN      NOT NULL DEFAULT TRUE,
  is_verified          BOOLEAN      NOT NULL DEFAULT FALSE,
  verification_method  TEXT,
  display_order        INTEGER      NOT NULL DEFAULT 0,
  is_published         BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- One slug per user
  CONSTRAINT projects_user_id_slug_unique UNIQUE (user_id, slug)
);

-- Auto-update updated_at (reuses function from 001_users.sql)
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Owner: full CRUD
CREATE POLICY "projects_owner_select"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "projects_owner_insert"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_owner_update"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_owner_delete"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public: read published projects only
CREATE POLICY "projects_public_read_published"
  ON public.projects
  FOR SELECT
  USING (is_published = TRUE);
