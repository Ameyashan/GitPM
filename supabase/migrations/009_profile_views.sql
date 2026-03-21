ALTER TABLE users ADD COLUMN profile_view_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_profile_view(p_user_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE users SET profile_view_count = profile_view_count + 1 WHERE id = p_user_id;
$$;
