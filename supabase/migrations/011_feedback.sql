-- Product feedback submitted via the in-app widget (server-side insert with service role).
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  emoji text,
  body text,
  page_label text NOT NULL,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_has_content CHECK (
    (emoji IS NOT NULL AND length(trim(emoji)) > 0)
    OR (body IS NOT NULL AND length(trim(body)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
