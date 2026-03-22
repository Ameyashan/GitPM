import { createAdminClient } from "@/lib/supabase/admin";

const GRADIENTS = [
  { from: "var(--purple)", to: "var(--teal)" },
  { from: "var(--teal)", to: "var(--forest)" },
  { from: "var(--forest)", to: "var(--purple)" },
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function formatToolLabel(tool: string): string {
  return tool.charAt(0).toUpperCase() + tool.slice(1);
}

export interface FeaturedProfileForLanding {
  username: string;
  avatarUrl: string | null;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  name: string;
  role: string;
  projects: number;
  commits: number;
  verified: number;
  tools: string[];
  toolVariant: "tool" | "stack";
}

/**
 * Users with at least one published project, most recently signed up first.
 */
export async function getFeaturedProfiles(limit = 9): Promise<FeaturedProfileForLanding[]> {
  const admin = createAdminClient();
  const { data: projects, error } = await admin
    .from("projects")
    .select("user_id, commit_count, is_verified, build_tools")
    .eq("is_published", true);

  if (error || !projects?.length) return [];

  const agg = new Map<
    string,
    { projects: number; commits: number; verified: number; tools: Set<string> }
  >();

  for (const p of projects) {
    const cur =
      agg.get(p.user_id) ?? {
        projects: 0,
        commits: 0,
        verified: 0,
        tools: new Set<string>(),
      };
    cur.projects += 1;
    cur.commits += p.commit_count ?? 0;
    if (p.is_verified) cur.verified += 1;
    for (const t of p.build_tools) {
      cur.tools.add(t);
    }
    agg.set(p.user_id, cur);
  }

  const userIds = Array.from(agg.keys());
  const { data: users, error: usersError } = await admin
    .from("users")
    .select("id, username, display_name, headline, avatar_url, created_at")
    .in("id", userIds);

  if (usersError || !users?.length) return [];

  const rows = users
    .map((u) => {
      const stats = agg.get(u.id);
      if (!stats) return null;
      return { user: u, stats };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.user.created_at.localeCompare(a.user.created_at))
    .slice(0, limit);

  return rows.map(({ user: u, stats }, i) => {
    const name = u.display_name?.trim() || u.username;
    const tools = Array.from(stats.tools).map(formatToolLabel).sort().slice(0, 3);
    const g = GRADIENTS[i % GRADIENTS.length]!;
    return {
      username: u.username,
      avatarUrl: u.avatar_url,
      initials: initialsFromName(name),
      gradientFrom: g.from,
      gradientTo: g.to,
      name,
      role: u.headline?.trim() || "Product manager",
      projects: stats.projects,
      commits: stats.commits,
      verified: stats.verified,
      tools,
      toolVariant: "tool" as const,
    };
  });
}
