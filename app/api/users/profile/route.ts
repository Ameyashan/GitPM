import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ProfileUpdateSchema = z.object({
  display_name: z.string().min(1).max(80).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(1000).optional(),
  linkedin_url: z.string().url().or(z.literal("")).optional(),
});

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "auth_required" },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "validation_error" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("users")
      .update(parsed.data)
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "server_error" },
      { status: 500 }
    );
  }
}
