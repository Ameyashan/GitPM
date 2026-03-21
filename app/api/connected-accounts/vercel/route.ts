import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getVercelUser, verifyProjectsAgainstDeployments } from "@/lib/vercel";
import { encrypt } from "@/lib/crypto";

const bodySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

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

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input", code: "validation_error" },
        { status: 400 }
      );
    }

    const { token } = parsed.data;

    // Validate the token against the Vercel API
    let vercelUsername: string;
    let vercelUserId: string;
    try {
      const vercelUser = await getVercelUser(token);
      vercelUsername = vercelUser.username;
      vercelUserId = vercelUser.id;
    } catch {
      return NextResponse.json(
        { error: "Invalid token. Please check it and try again.", code: "invalid_token" },
        { status: 422 }
      );
    }

    const encryptedToken = encrypt(token);
    const now = new Date().toISOString();

    const { error: upsertError } = await supabase
      .from("connected_accounts")
      .upsert(
        {
          user_id: user.id,
          provider: "vercel",
          provider_user_id: vercelUserId,
          provider_username: vercelUsername,
          access_token: encryptedToken,
          connected_at: now,
        },
        { onConflict: "user_id,provider" }
      );

    if (upsertError) {
      console.error("[POST /api/connected-accounts/vercel] Upsert error:", upsertError.message);
      return NextResponse.json(
        { error: "Failed to save connection", code: "db_error" },
        { status: 500 }
      );
    }

    // Fire-and-forget: verify existing projects against Vercel deployments
    supabase
      .from("projects")
      .select("id, live_url")
      .eq("user_id", user.id)
      .not("live_url", "is", null)
      .then(async ({ data: projects }) => {
        if (!projects?.length) return;
        try {
          const verified = await verifyProjectsAgainstDeployments(token, projects);
          await Promise.all(
            Array.from(verified.entries()).map(([projectId, { latestDeployAt }]) =>
              supabase
                .from("projects")
                .update({
                  is_verified: true,
                  verification_method: "vercel_pat",
                  latest_deploy_at: latestDeployAt,
                })
                .eq("id", projectId)
                .eq("user_id", user.id)
            )
          );
        } catch (err) {
          console.error("[POST /api/connected-accounts/vercel] Background verification failed:", err);
        }
      });

    return NextResponse.json({ data: { username: vercelUsername } });
  } catch (err) {
    console.error("[POST /api/connected-accounts/vercel] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
