import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Project, User } from "@/types/project";

import { getPublishedProjects, getUserByUsername } from "@/lib/supabase/profile-queries";

function sampleUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    username: "alice",
    display_name: "Alice",
    headline: "PM",
    bio: null,
    avatar_url: null,
    github_username: null,
    linkedin_url: null,
    website_url: null,
    medium_url: null,
    substack_url: null,
    youtube_url: null,
    twitter_url: null,
    github_contributions: null,
    github_contributions_synced_at: null,
    profile_view_count: 0,
    created_at: "2020-01-01T00:00:00.000Z",
    updated_at: "2020-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createMockAdmin(options: {
  user?: User | null;
  userError?: { message: string };
  projects?: Project[];
  projectsError?: { message: string };
}): SupabaseClient<Database> {
  const admin = {
    from: (table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: options.userError ? null : options.user ?? null,
                error: options.userError ?? null,
              }),
            }),
          }),
        };
      }
      if (table === "projects") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: async () => ({
                  data: options.projectsError ? null : options.projects ?? [],
                  error: options.projectsError ?? null,
                }),
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  };
  return admin as unknown as SupabaseClient<Database>;
}

describe("getUserByUsername", () => {
  it("returns user row when found", async () => {
    const user = sampleUser();
    const admin = createMockAdmin({ user });
    await expect(getUserByUsername(admin, "alice")).resolves.toEqual(user);
  });

  it("returns null when not found", async () => {
    const admin = createMockAdmin({ user: null });
    await expect(getUserByUsername(admin, "nobody")).resolves.toBeNull();
  });

  it("returns null on query error", async () => {
    const admin = createMockAdmin({ user: sampleUser(), userError: { message: "db" } });
    await expect(getUserByUsername(admin, "alice")).resolves.toBeNull();
  });
});

describe("getPublishedProjects", () => {
  it("returns project rows when found", async () => {
    const projects = [{ id: "p1" }] as unknown as Project[];
    const admin = createMockAdmin({ projects });
    await expect(getPublishedProjects(admin, "u1")).resolves.toEqual(projects);
  });

  it("returns empty array on error", async () => {
    const admin = createMockAdmin({ projectsError: { message: "fail" } });
    await expect(getPublishedProjects(admin, "u1")).resolves.toEqual([]);
  });
});
