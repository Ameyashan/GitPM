-- ============================================================
-- GitPM — Full Schema + RLS
-- Run this in the Supabase Dashboard → SQL Editor
-- (Project: uswfzygwwhwolzvuwgmo)
--
-- Safe to run multiple times — all statements are idempotent.
-- ============================================================

-- ============================================================
-- 001: Shared trigger function + users table
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.users (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT UNIQUE NOT NULL,
  display_name     TEXT NOT NULL,
  headline         TEXT NOT NULL DEFAULT '',
  bio              TEXT,
  avatar_url       TEXT,
  github_username  TEXT,
  linkedin_url     TEXT,
  website_url      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at'
  ) THEN
    CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, github_username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'user_name', ''),
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_public_read_display_fields" ON public.users;
CREATE POLICY "users_public_read_display_fields"
  ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "users_owner_update" ON public.users;
CREATE POLICY "users_owner_update"
  ON public.users FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- 002: projects table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug                 TEXT        NOT NULL,
  name                 TEXT        NOT NULL,
  description          TEXT        NOT NULL DEFAULT '',
  live_url             TEXT        NOT NULL,
  github_repo_url      TEXT,
  thumbnail_url        TEXT,
  demo_video_url       TEXT,
  build_tools          TEXT[]      NOT NULL DEFAULT '{}',
  hosting_platform     TEXT,
  tech_stack           TEXT[]      NOT NULL DEFAULT '{}',
  category_tags        TEXT[]      NOT NULL DEFAULT '{}',
  problem_statement    TEXT        NOT NULL DEFAULT '',
  target_user          TEXT,
  key_decisions        TEXT,
  learnings            TEXT,
  metrics_text         TEXT,
  commit_count         INTEGER,
  first_commit_at      TIMESTAMPTZ,
  latest_deploy_at     TIMESTAMPTZ,
  is_solo              BOOLEAN     NOT NULL DEFAULT TRUE,
  is_verified          BOOLEAN     NOT NULL DEFAULT FALSE,
  verification_method  TEXT,
  display_order        INTEGER     NOT NULL DEFAULT 0,
  is_published         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_user_id_slug_unique UNIQUE (user_id, slug)
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'projects_set_updated_at'
  ) THEN
    CREATE TRIGGER projects_set_updated_at
      BEFORE UPDATE ON public.projects
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_owner_select"           ON public.projects;
DROP POLICY IF EXISTS "projects_owner_insert"           ON public.projects;
DROP POLICY IF EXISTS "projects_owner_update"           ON public.projects;
DROP POLICY IF EXISTS "projects_owner_delete"           ON public.projects;
DROP POLICY IF EXISTS "projects_public_read_published"  ON public.projects;

CREATE POLICY "projects_owner_select"
  ON public.projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects_owner_insert"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_owner_update"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_owner_delete"
  ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "projects_public_read_published"
  ON public.projects FOR SELECT USING (is_published = TRUE);

-- ============================================================
-- 003: connected_accounts table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider          TEXT        NOT NULL,
  provider_user_id  TEXT        NOT NULL,
  access_token      TEXT        NOT NULL,
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,
  provider_username TEXT,
  connected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT connected_accounts_user_provider_unique UNIQUE (user_id, provider)
);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "connected_accounts_owner_select" ON public.connected_accounts;
DROP POLICY IF EXISTS "connected_accounts_owner_insert" ON public.connected_accounts;
DROP POLICY IF EXISTS "connected_accounts_owner_update" ON public.connected_accounts;
DROP POLICY IF EXISTS "connected_accounts_owner_delete" ON public.connected_accounts;

CREATE POLICY "connected_accounts_owner_select"
  ON public.connected_accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "connected_accounts_owner_insert"
  ON public.connected_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "connected_accounts_owner_update"
  ON public.connected_accounts FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "connected_accounts_owner_delete"
  ON public.connected_accounts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 004: screenshots table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.screenshots (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url      TEXT        NOT NULL,
  display_order  INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "screenshots_owner_select"         ON public.screenshots;
DROP POLICY IF EXISTS "screenshots_owner_insert"         ON public.screenshots;
DROP POLICY IF EXISTS "screenshots_owner_update"         ON public.screenshots;
DROP POLICY IF EXISTS "screenshots_owner_delete"         ON public.screenshots;
DROP POLICY IF EXISTS "screenshots_public_read_published" ON public.screenshots;

CREATE POLICY "screenshots_owner_select"
  ON public.screenshots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = screenshots.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "screenshots_owner_insert"
  ON public.screenshots FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = screenshots.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "screenshots_owner_update"
  ON public.screenshots FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = screenshots.project_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = screenshots.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "screenshots_owner_delete"
  ON public.screenshots FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = screenshots.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "screenshots_public_read_published"
  ON public.screenshots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = screenshots.project_id AND projects.is_published = TRUE
  ));

-- ============================================================
-- 005: Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_username
  ON public.users (username);

CREATE INDEX IF NOT EXISTS idx_projects_user_id
  ON public.projects (user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id_slug
  ON public.projects (user_id, slug);

CREATE INDEX IF NOT EXISTS idx_projects_published_display_order
  ON public.projects (is_published, display_order)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_provider
  ON public.connected_accounts (user_id, provider);

CREATE INDEX IF NOT EXISTS idx_screenshots_project_id
  ON public.screenshots (project_id, display_order);
