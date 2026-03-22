import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
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
  medium_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  substack_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtube_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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

    const {
      username,
      display_name,
      headline,
      bio,
      linkedin_url,
      website_url,
      medium_url,
      substack_url,
      youtube_url,
      twitter_url,
    } = parsed.data;

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
        medium_url: medium_url || null,
        substack_url: substack_url || null,
        youtube_url: youtube_url || null,
        twitter_url: twitter_url || null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Onboard update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to save profile", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    // Fire welcome email non-blocking — never fail the request if email errors
    if (process.env.RESEND_API_KEY && user.email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "https://gitpm.dev";
      const profileUrl = `${appUrl}/${username}`;
      const addProjectUrl = `${appUrl}/dashboard/projects/new`;

      resend.emails
        .send({
          from: "GitPM <hello@gitpm.dev>",
          to: user.email,
          subject: `Welcome to GitPM, ${display_name}!`,
          html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0D1B2A;font-family:system-ui,sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:0 auto;padding:48px 32px;">
    <p style="font-size:11px;font-family:monospace;color:#0A7558;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 24px;">
      GitPM
    </p>
    <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 12px;line-height:1.2;">
      Welcome, ${display_name}!
    </h1>
    <p style="font-size:16px;color:rgba(255,255,255,0.5);margin:0 0 32px;line-height:1.6;">
      Your profile is live. Now add your first project to start building
      your verified portfolio.
    </p>
    <div style="margin:0 0 32px;">
      <a href="${addProjectUrl}"
         style="display:inline-block;background:#6C5CE7;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
        Add your first project
      </a>
    </div>
    <p style="font-size:13px;color:rgba(255,255,255,0.3);margin:0 0 4px;">
      Your public portfolio:
    </p>
    <a href="${profileUrl}"
       style="font-family:monospace;font-size:13px;color:#6C5CE7;text-decoration:none;">
      ${profileUrl}
    </a>
    <hr style="border:none;border-top:1px solid rgba(200,204,200,0.15);margin:32px 0;" />
    <p style="font-size:12px;color:rgba(255,255,255,0.2);margin:0;">
      You're receiving this because you signed up for GitPM.
    </p>
  </div>
</body>
</html>`,
        })
        .catch((err: unknown) =>
          console.error("Welcome email failed:", err)
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
