import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const feedbackSchema = z
  .object({
    emoji: z.string().max(32).nullable().optional(),
    text: z.string().max(5000).optional().default(""),
    pageLabel: z.string().min(1).max(200),
    path: z.string().min(1).max(512),
  })
  .refine(
    (data) => {
      const hasEmoji =
        data.emoji !== null &&
        data.emoji !== undefined &&
        data.emoji.trim().length > 0;
      const hasText = data.text.trim().length > 0;
      return hasEmoji || hasText;
    },
    { message: "Provide feedback text or select a reaction" }
  );

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    const body: unknown = await request.json();
    const parsed = feedbackSchema.safeParse(body);

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

    const { emoji, text, pageLabel, path } = parsed.data;
    const emojiValue =
      emoji !== null && emoji !== undefined && emoji.trim().length > 0
        ? emoji.trim()
        : null;
    const bodyText = text.trim().length > 0 ? text.trim() : null;

    const admin = createAdminClient();
    const { error } = await admin.from("feedback").insert({
      user_id: user?.id ?? null,
      emoji: emojiValue,
      body: bodyText,
      page_label: pageLabel,
      path,
    });

    if (error) {
      console.error("[feedback] insert failed", { code: error.code });
      return NextResponse.json(
        { error: "Could not save feedback", code: "INSERT_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { ok: true } });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
