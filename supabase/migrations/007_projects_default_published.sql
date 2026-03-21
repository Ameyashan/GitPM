-- New projects default to published; owners can unpublish from the dashboard.
ALTER TABLE public.projects
  ALTER COLUMN is_published SET DEFAULT TRUE;
