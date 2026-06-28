-- Adds GitHub commit recency + activity data used by the profile project cards.
-- latest_commit_at  → "most recent commit date" shown on the card.
-- commit_activity    → array of weekly commit counts (most recent last) that
--                      drives the per-card sparkline.
ALTER TABLE public.projects
  ADD COLUMN latest_commit_at timestamptz,
  ADD COLUMN commit_activity jsonb;
