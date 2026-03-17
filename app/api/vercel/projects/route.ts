import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVercelProjects } from "@/lib/vercel";
import { decrypt } from "@/lib/crypto";

export interface VercelProjectSummary {
  id: string;
  name: string;
  liveUrl: string | null;
  githubRepoUrl: string | null;
  alreadyImported: boolean;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 }
      );
    }

    const { data: account } = await supabase
      .from("connected_accounts")
      .select("access_token")
      .eq("user_id", user.id)
      .eq("provider", "vercel")
      .maybeSingle();

    if (!account) {
      return NextResponse.json(
        { error: "Vercel is not connected", code: "vercel_not_connected" },
        { status: 400 }
      );
    }

    const token = decrypt(account.access_token);
    const projects = await getVercelProjects(token);

    // Fetch all live_urls already in GitPM for this user so we can flag already-imported projects
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("live_url")
      .eq("user_id", user.id)
      .not("live_url", "is", null);

    const importedUrls = new Set(
      (existingProjects ?? []).map((p) => p.live_url?.replace(/\/$/, "").toLowerCase())
    );

    const summaries: VercelProjectSummary[] = projects.map((p) => {
      // Prefer the first production alias (e.g. project.vercel.app or custom domain),
      // fall back to constructing the default vercel.app URL from the project name.
      const alias = p.targets?.production?.alias?.[0];
      const liveUrl = alias
        ? `https://${alias}`
        : `https://${p.name}.vercel.app`;

      const githubRepoUrl =
        p.link?.type === "github" && p.link.org && p.link.repo
          ? `https://github.com/${p.link.org}/${p.link.repo}`
          : null;

      const normalised = liveUrl.replace(/\/$/, "").toLowerCase();
      const alreadyImported = importedUrls.has(normalised);

      return { id: p.id, name: p.name, liveUrl, githubRepoUrl, alreadyImported };
    });

    return NextResponse.json({ data: summaries });
  } catch (err) {
    console.error("[GET /api/vercel/projects] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Vercel projects", code: "vercel_error" },
      { status: 500 }
    );
  }
}
