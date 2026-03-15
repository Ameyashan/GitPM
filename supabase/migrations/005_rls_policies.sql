-- ============================================================
-- 005_rls_policies.sql
-- Belt-and-suspenders: confirm RLS is enabled on all tables,
-- then add performance indexes for common query patterns.
-- ============================================================

-- Confirm RLS is enabled (idempotent if already set in prior migrations)
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Indexes
-- ============================================================

-- Public profile lookup: /[username]
CREATE INDEX IF NOT EXISTS idx_users_username
  ON public.users (username);

-- Dashboard project list for the logged-in user
CREATE INDEX IF NOT EXISTS idx_projects_user_id
  ON public.projects (user_id);

-- Public project detail: /[username]/[slug]
-- Also covers the unique constraint, but explicit index aids query plans
CREATE INDEX IF NOT EXISTS idx_projects_user_id_slug
  ON public.projects (user_id, slug);

-- Public feed: all published projects sorted by display_order
CREATE INDEX IF NOT EXISTS idx_projects_published_display_order
  ON public.projects (is_published, display_order)
  WHERE is_published = TRUE;

-- OAuth account lookup by user + provider
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_provider
  ON public.connected_accounts (user_id, provider);

-- Screenshot gallery for a project
CREATE INDEX IF NOT EXISTS idx_screenshots_project_id
  ON public.screenshots (project_id, display_order);
