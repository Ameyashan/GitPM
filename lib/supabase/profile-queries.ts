import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Project, User } from "@/types/project";

const USER_PROFILE_COLUMNS =
  "id, username, display_name, headline, bio, avatar_url, github_username, linkedin_url, website_url, medium_url, substack_url, youtube_url, twitter_url, github_contributions, github_contributions_synced_at, profile_view_count, created_at, updated_at" as const;

export async function getUserByUsername(
  admin: SupabaseClient<Database>,
  username: string
): Promise<User | null> {
  const { data, error } = await admin
    .from("users")
    .select(USER_PROFILE_COLUMNS)
    .eq("username", username)
    .maybeSingle();

  if (error) return null;
  return (data as User | null) ?? null;
}

export async function getPublishedProjects(
  admin: SupabaseClient<Database>,
  userId: string
): Promise<Project[]> {
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) return [];
  return (data as Project[]) ?? [];
}
