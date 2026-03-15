-- ============================================================
-- 003_connected_accounts.sql — connected_accounts table and RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider          TEXT        NOT NULL,  -- "github" | "vercel" | "lovable"
  provider_user_id  TEXT        NOT NULL,
  access_token      TEXT        NOT NULL,  -- stored encrypted at rest via Supabase pgsodium / app-level encryption
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,
  provider_username TEXT,
  connected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One account per provider per user
  CONSTRAINT connected_accounts_user_provider_unique UNIQUE (user_id, provider)
);

-- ============================================================
-- Row Level Security
-- No public access — owner only
-- ============================================================
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connected_accounts_owner_select"
  ON public.connected_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "connected_accounts_owner_insert"
  ON public.connected_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "connected_accounts_owner_update"
  ON public.connected_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "connected_accounts_owner_delete"
  ON public.connected_accounts
  FOR DELETE
  USING (auth.uid() = user_id);
