-- ============================================================
-- 001_users.sql — users table, triggers, and RLS
-- ============================================================

-- Reusable trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Table: public.users
-- id mirrors auth.users.id (Supabase Auth UID)
-- ============================================================
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

-- Auto-update updated_at on every row change
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Trigger: auto-create a users row when a new auth user signs up
-- Pulls github_username and avatar_url from GitHub OAuth metadata
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, github_username, avatar_url)
  VALUES (
    NEW.id,
    -- Temporary username from GitHub login; user finalises in onboarding
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'user_name', ''),
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can read the public display fields
CREATE POLICY "users_public_read_display_fields"
  ON public.users
  FOR SELECT
  USING (true);

-- Only the owner can update their own row
CREATE POLICY "users_owner_update"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserts happen only via the handle_new_user trigger (SECURITY DEFINER)
-- so no INSERT policy is needed for end users
