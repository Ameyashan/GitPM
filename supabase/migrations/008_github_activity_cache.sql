ALTER TABLE users
  ADD COLUMN github_contributions jsonb,
  ADD COLUMN github_contributions_synced_at timestamptz;
