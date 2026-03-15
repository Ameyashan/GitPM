// Vercel OAuth callback — implemented in Ticket 6
import { NextResponse } from "next/server";

export async function GET() {
  // TODO (Ticket 6): Exchange code for token, store encrypted in connected_accounts
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented" },
    { status: 501 }
  );
}
