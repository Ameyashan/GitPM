import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
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

    // Verify project ownership before returning screenshots
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json(
        { error: "Failed to verify project", code: "db_error" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found", code: "not_found" },
        { status: 404 }
      );
    }

    const { data: screenshots, error: screenshotsError } = await supabase
      .from("screenshots")
      .select("id, project_id, image_url, display_order, created_at")
      .eq("project_id", id)
      .order("display_order", { ascending: true });

    if (screenshotsError) {
      return NextResponse.json(
        { error: "Failed to fetch screenshots", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: screenshots ?? [] });
  } catch (err) {
    console.error("[GET /api/projects/[id]/screenshots] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
