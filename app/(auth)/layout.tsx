import { Navigation } from "@/components/shared/Navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--page-bg)" }}>
      <Navigation />
      <div className="flex flex-1 min-h-0">
        <DashboardSidebar profile={profile} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
