import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AllowedProvider = "vercel";

const ALLOWED_PROVIDERS: AllowedProvider[] = ["vercel"];

interface Context {
  params: Promise<{ provider: string }>;
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { provider } = await params;

    if (!ALLOWED_PROVIDERS.includes(provider as AllowedProvider)) {
      return NextResponse.json(
        { error: "Unknown provider", code: "invalid_provider" },
        { status: 400 }
      );
    }

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

    // Verify the account exists before deleting
    const { data: account } = await supabase
      .from("connected_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .maybeSingle();

    if (!account) {
      return NextResponse.json(
        { error: "Account not connected", code: "not_found" },
        { status: 404 }
      );
    }

    // Delete the connected account
    const { error: deleteError } = await supabase
      .from("connected_accounts")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    if (deleteError) {
      console.error(
        `[DELETE /api/connected-accounts/${provider}] Delete error:`,
        deleteError.message
      );
      return NextResponse.json(
        { error: "Failed to disconnect account", code: "db_error" },
        { status: 500 }
      );
    }

    // Reset verification on all projects that were verified via this provider
    const verificationMethods: string[] | null =
      provider === "vercel" ? ["vercel_oauth", "vercel_pat"] : null;

    if (verificationMethods) {
      const { error: resetError } = await supabase
        .from("projects")
        .update({
          is_verified: false,
          verification_method: null,
        })
        .eq("user_id", user.id)
        .in("verification_method", verificationMethods);

      if (resetError) {
        // Non-fatal: log but don't fail the disconnect
        console.error(
          `[DELETE /api/connected-accounts/${provider}] Failed to reset project verification:`,
          resetError.message
        );
      }
    }

    return NextResponse.json({ data: { disconnected: true, provider } });
  } catch (err) {
    console.error("[DELETE /api/connected-accounts/[provider]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
