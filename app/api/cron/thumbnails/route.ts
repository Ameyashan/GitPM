// Vercel cron job for thumbnail generation — implemented in Ticket 7
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (check Authorization header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized", code: "unauthorized" },
      { status: 401 }
    );
  }

  // TODO (Ticket 7): Find projects with live_url but no thumbnail_url,
  // generate via Puppeteer, upload to Supabase Storage
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented" },
    { status: 501 }
  );
}
