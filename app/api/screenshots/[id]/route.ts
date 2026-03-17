import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface Context {
  params: Promise<{ id: string }>;
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

    // Fetch screenshot and verify ownership via project join
    const { data: screenshot, error: fetchError } = await supabase
      .from("screenshots")
      .select("id, image_url, project_id, projects!inner(user_id)")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error(`[DELETE /api/screenshots/${id}] Fetch error:`, fetchError.message);
      return NextResponse.json(
        { error: "Failed to fetch screenshot", code: "db_error" },
        { status: 500 }
      );
    }

    if (!screenshot) {
      return NextResponse.json(
        { error: "Screenshot not found", code: "not_found" },
        { status: 404 }
      );
    }

    // Type-safe ownership check
    const projectOwner = (screenshot.projects as { user_id: string } | null)?.user_id;
    if (projectOwner !== user.id) {
      return NextResponse.json(
        { error: "Forbidden", code: "forbidden" },
        { status: 403 }
      );
    }

    // Extract storage path from the public URL
    // URL format: https://<ref>.supabase.co/storage/v1/object/public/screenshots/{project_id}/{file}
    const urlParts = screenshot.image_url.split("/screenshots/");
    const storagePath = urlParts[1] ?? null;

    if (storagePath) {
      const admin = createAdminClient();
      const { error: storageError } = await admin.storage
        .from("screenshots")
        .remove([storagePath]);

      if (storageError) {
        console.error(`[DELETE /api/screenshots/${id}] Storage remove error:`, storageError.message);
        // Proceed to remove the DB record even if storage fails
      }
    }

    const { error: deleteError } = await supabase
      .from("screenshots")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(`[DELETE /api/screenshots/${id}] Delete error:`, deleteError.message);
      return NextResponse.json(
        { error: "Failed to delete screenshot", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    console.error("[DELETE /api/screenshots/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
