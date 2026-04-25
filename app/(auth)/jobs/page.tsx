import { createClient } from "@/lib/supabase/server";
import { JobsClient } from "@/components/jobs/JobsClient";

export const metadata = { title: "PM Jobs · GitPM" };

async function getUserStack(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("tech_stack, build_tools, category_tags")
    .eq("user_id", userId)
    .eq("is_published", true);

  if (!projects || projects.length === 0) return [];

  const allTags = new Set<string>();
  for (const p of projects) {
    (p.tech_stack ?? []).forEach((t: string) => allTags.add(t));
    (p.build_tools ?? []).forEach((t: string) => allTags.add(t));
    (p.category_tags ?? []).forEach((t: string) => allTags.add(t));
  }

  return Array.from(allTags).sort();
}

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userStack = user ? await getUserStack(user.id) : [];

  return <JobsClient userStack={userStack} />;
}
