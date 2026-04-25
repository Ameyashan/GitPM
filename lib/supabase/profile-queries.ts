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

export interface ExploreProjectRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_url: string | null;
  tech_stack: string[];
  build_tools: string[];
  commit_count: number | null;
  latest_deploy_at: string | null;
  updated_at: string;
  is_verified: boolean;
  builder: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export async function getAllPublishedProjects(
  admin: SupabaseClient<Database>
): Promise<ExploreProjectRow[]> {
  const { data, error } = await admin
    .from("projects")
    .select(
      "id, slug, name, description, thumbnail_url, tech_stack, build_tools, commit_count, latest_deploy_at, updated_at, is_verified, users!inner(username, display_name, avatar_url)"
    )
    .eq("is_published", true)
    .order("latest_deploy_at", { ascending: false, nullsFirst: false });

  if (error || !data) return [];

  return data.map((row) => {
    const userRel = row.users as unknown as {
      username: string;
      display_name: string;
      avatar_url: string | null;
    };
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      thumbnail_url: row.thumbnail_url,
      tech_stack: row.tech_stack ?? [],
      build_tools: row.build_tools ?? [],
      commit_count: row.commit_count,
      latest_deploy_at: row.latest_deploy_at,
      updated_at: row.updated_at,
      is_verified: row.is_verified,
      builder: {
        username: userRel.username,
        display_name: userRel.display_name,
        avatar_url: userRel.avatar_url,
      },
    };
  });
}
