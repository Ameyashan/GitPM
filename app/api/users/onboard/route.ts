import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const onboardSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or fewer")
    .regex(
      /^[a-z0-9_-]+$/,
      "Username may only contain lowercase letters, numbers, hyphens, and underscores"
    ),
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or fewer"),
  headline: z
    .string()
    .min(1, "Headline is required")
    .max(160, "Headline must be 160 characters or fewer"),
  bio: z.string().max(500, "Bio must be 500 characters or fewer").optional(),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = onboardSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message ?? "Invalid input",
          code: "VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    const { username, display_name, headline, bio, linkedin_url, website_url } =
      parsed.data;

    // Check username is not taken by a different user
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Username is already taken", code: "USERNAME_TAKEN" },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        username,
        display_name,
        headline,
        bio: bio ?? null,
        linkedin_url: linkedin_url || null,
        website_url: website_url || null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Onboard update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to save profile", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { username } }, { status: 200 });
  } catch (err) {
    console.error("Onboard route error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
