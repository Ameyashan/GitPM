import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAndStoreProjectThumbnail } from "@/lib/thumbnails";
import { projectCreateSchema } from "@/lib/validators/project";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function findUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
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

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[GET /api/projects] DB error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch projects", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: projects ?? [] });
  } catch (err) {
    console.error("[GET /api/projects] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "invalid_body" },
        { status: 400 }
      );
    }

    const parsed = projectCreateSchema.safeParse(body);
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

    // Auto-generate slug if not provided, then ensure uniqueness
    const baseSlug = input.slug || generateSlug(input.name);
    const slug = await findUniqueSlug(supabase, user.id, baseSlug);

    // Determine display_order (append at end)
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const display_order = count ?? 0;

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        slug,
        name: input.name,
        description: input.description ?? "",
        live_url: input.live_url,
        github_repo_url: input.github_repo_url || null,
        demo_video_url: input.demo_video_url || null,
        build_tools: input.build_tools,
        hosting_platform: input.hosting_platform || null,
        tech_stack: [],
        category_tags: input.category_tags,
        problem_statement: input.problem_statement,
        target_user: input.target_user || null,
        key_decisions: input.key_decisions || null,
        learnings: input.learnings || null,
        metrics_text: input.metrics_text || null,
        is_published: input.is_published ?? false,
        is_solo: true,
        is_verified: false,
        display_order,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/projects] DB error:", error.message);
      return NextResponse.json(
        { error: "Failed to create project", code: "db_error" },
        { status: 500 }
      );
    }

    let projectWithThumbnail = project;

    if (project.is_published && !project.thumbnail_url) {
      try {
        const admin = createAdminClient();
        const thumbnailUrl = await generateAndStoreProjectThumbnail(
          project.id,
          project.live_url,
          admin
        );

        projectWithThumbnail = {
          ...project,
          thumbnail_url: thumbnailUrl,
        };
      } catch (thumbnailError) {
        console.error(
          `[POST /api/projects] Thumbnail generation failed for project ${project.id}:`,
          thumbnailError
        );
      }
    }

    return NextResponse.json({ data: projectWithThumbnail }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
