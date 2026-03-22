import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const sessionRequestSchema = z.object({
  secret: z.string().min(1),
});

function isE2eSessionRouteEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  return Boolean(process.env.E2E_SECRET && process.env.E2E_AUTH_EMAIL);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isE2eSessionRouteEnabled()) {
    return NextResponse.json(
      { error: "Not found", code: "not_found" },
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

  const parsed = sessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "validation_error" },
      { status: 422 }
    );
  }

  if (parsed.data.secret !== process.env.E2E_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized", code: "unauthorized" },
      { status: 401 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  const redirectTo = `${appUrl.replace(/\/$/, "")}/dashboard`;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: process.env.E2E_AUTH_EMAIL!,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    console.error("[POST /api/e2e/session] generateLink failed:", error?.message);
    return NextResponse.json(
      { error: "Failed to create session link", code: "auth_error" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { url: data.properties.action_link },
  });
}
