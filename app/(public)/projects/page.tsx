import { createAdminClient } from "@/lib/supabase/admin";
import { getAllPublishedProjects } from "@/lib/supabase/profile-queries";
import { ExploreProjectsClient } from "@/components/projects/ExploreProjectsClient";

export const metadata = { title: "Explore Projects · GitPM" };
export const dynamic = "force-dynamic";

export default async function ExploreProjectsPage() {
  const admin = createAdminClient();
  const projects = await getAllPublishedProjects(admin);
  return <ExploreProjectsClient projects={projects} />;
}
