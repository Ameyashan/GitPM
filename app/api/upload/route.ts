import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SCREENSHOTS = 6;

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

    const formData = await request.formData();
    const file = formData.get("file");
    const projectId = formData.get("project_id");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file", code: "missing_file" },
        { status: 400 }
      );
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Missing project_id", code: "missing_project_id" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, WebP, or GIF)", code: "invalid_file_type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File must be 5 MB or smaller", code: "file_too_large" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projectError) {
      console.error("[POST /api/upload] Project lookup error:", projectError.message);
      return NextResponse.json(
        { error: "Failed to verify project ownership", code: "db_error" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found", code: "not_found" },
        { status: 404 }
      );
    }

    // Count existing screenshots
    const { count, error: countError } = await supabase
      .from("screenshots")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);

    if (countError) {
      console.error("[POST /api/upload] Count error:", countError.message);
      return NextResponse.json(
        { error: "Failed to count screenshots", code: "db_error" },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= MAX_SCREENSHOTS) {
      return NextResponse.json(
        { error: `Projects can have at most ${MAX_SCREENSHOTS} screenshots`, code: "max_screenshots" },
        { status: 400 }
      );
    }

    // Determine file extension from MIME type
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extMap[file.type] ?? "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${projectId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const admin = createAdminClient();

    // Ensure the screenshots bucket exists and is public.
    // Supabase storage buckets are not created by SQL migrations, so we
    // create it on first upload if it doesn't exist yet.
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === "screenshots");
    if (!bucketExists) {
      const { error: bucketError } = await admin.storage.createBucket(
        "screenshots",
        { public: true }
      );
      if (bucketError) {
        console.error("[POST /api/upload] Bucket creation error:", bucketError.message);
        return NextResponse.json(
          { error: "Storage not configured", code: "bucket_error" },
          { status: 500 }
        );
      }
    }

    const { error: uploadError } = await admin.storage
      .from("screenshots")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[POST /api/upload] Storage upload error:", uploadError.message);
      return NextResponse.json(
        { error: "Failed to upload file", code: "upload_error" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("screenshots").getPublicUrl(storagePath);

    // Insert screenshot record with next display_order
    const nextOrder = (count ?? 0) + 1;
    const { data: screenshot, error: insertError } = await supabase
      .from("screenshots")
      .insert({
        project_id: projectId,
        image_url: publicUrl,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[POST /api/upload] Insert error:", insertError.message);
      // Clean up the uploaded file since DB insert failed
      await admin.storage.from("screenshots").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save screenshot record", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: screenshot }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/upload] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
