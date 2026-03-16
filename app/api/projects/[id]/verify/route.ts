import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyProjectsAgainstDeployments } from "@/lib/vercel";
import { decrypt } from "@/lib/crypto";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Context) {
  try {
    const { id } = await params;

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

    // Fetch the project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id, live_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projectError) {
      console.error(`[POST /api/projects/${id}/verify] DB error:`, projectError.message);
      return NextResponse.json(
        { error: "Failed to fetch project", code: "db_error" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found", code: "not_found" },
        { status: 404 }
      );
    }

    if (!project.live_url) {
      return NextResponse.json(
        { error: "Project has no live URL to verify", code: "no_live_url" },
        { status: 400 }
      );
    }

    // Look up user's Vercel connection
    const { data: account, error: accountError } = await supabase
      .from("connected_accounts")
      .select("access_token")
      .eq("user_id", user.id)
      .eq("provider", "vercel")
      .maybeSingle();

    if (accountError) {
      console.error(`[POST /api/projects/${id}/verify] Account lookup error:`, accountError.message);
      return NextResponse.json(
        { error: "Failed to look up Vercel connection", code: "db_error" },
        { status: 500 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: "Vercel is not connected", code: "vercel_not_connected" },
        { status: 400 }
      );
    }

    const token = decrypt(account.access_token);
    const matches = await verifyProjectsAgainstDeployments(token, [project]);

    if (!matches.has(project.id)) {
      return NextResponse.json(
        {
          data: { verified: false },
          message: "No matching Vercel deployment found for this project's URL",
        }
      );
    }

    const deployData = matches.get(project.id)!;

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({
        is_verified: true,
        verification_method: "vercel_oauth",
        hosting_platform: "vercel",
        latest_deploy_at: deployData.latestDeployAt,
      })
      .eq("id", project.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error(`[POST /api/projects/${id}/verify] Update error:`, updateError.message);
      return NextResponse.json(
        { error: "Failed to update verification status", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { verified: true, project: updated } });
  } catch (err) {
    console.error("[POST /api/projects/[id]/verify] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
