import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { projectUpdateSchema } from "@/lib/validators/project";

interface Context {
  params: Promise<{ id: string }>;
}

async function getOwnedProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { project: null, dbError: error };
  return { project: data, dbError: null };
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

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[GET /api/projects/[id]] DB error:", error.message);
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

    return NextResponse.json({ data: project });
  } catch (err) {
    console.error("[GET /api/projects/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Context) {
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

    const { project: existing, dbError: ownershipError } =
      await getOwnedProject(supabase, id, user.id);

    if (ownershipError) {
      console.error(
        "[PATCH /api/projects/[id]] Ownership check error:",
        ownershipError.message
      );
      return NextResponse.json(
        { error: "Failed to verify ownership", code: "db_error" },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found", code: "not_found" },
        { status: 404 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "invalid_body" },
        { status: 400 }
      );
    }

    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "validation_error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const input = parsed.data;

    // Normalize empty strings to null for nullable fields
    const updates: Record<string, unknown> = {
      ...input,
      github_repo_url: input.github_repo_url || null,
      demo_video_url: input.demo_video_url || null,
      hosting_platform: input.hosting_platform || null,
      target_user: input.target_user || null,
      key_decisions: input.key_decisions || null,
      learnings: input.learnings || null,
      metrics_text: input.metrics_text || null,
      updated_at: new Date().toISOString(),
    };

    const { data: project, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[PATCH /api/projects/[id]] DB error:", error.message);
      return NextResponse.json(
        { error: "Failed to update project", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: project });
  } catch (err) {
    console.error("[PATCH /api/projects/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
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

    const { project: existing, dbError: ownershipError } =
      await getOwnedProject(supabase, id, user.id);

    if (ownershipError) {
      console.error(
        "[DELETE /api/projects/[id]] Ownership check error:",
        ownershipError.message
      );
      return NextResponse.json(
        { error: "Failed to verify ownership", code: "db_error" },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found", code: "not_found" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[DELETE /api/projects/[id]] DB error:", error.message);
      return NextResponse.json(
        { error: "Failed to delete project", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { id } });
  } catch (err) {
    console.error("[DELETE /api/projects/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
