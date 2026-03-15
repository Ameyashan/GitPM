// Initiate Vercel OAuth — implemented in Ticket 6
import { NextResponse } from "next/server";

export async function GET() {
  // TODO (Ticket 6): Generate state, store in session, redirect to Vercel OAuth
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented" },
    { status: 501 }
  );
}
