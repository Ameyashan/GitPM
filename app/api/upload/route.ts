// File upload to Supabase Storage — implemented in Ticket 7
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented" },
    { status: 501 }
  );
}
