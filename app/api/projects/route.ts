// Projects CRUD — implemented in Ticket 4
import { NextResponse } from "next/server";

export async function GET() {
  // TODO (Ticket 4): Return authenticated user's projects
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented" },
    { status: 501 }
  );
}

export async function POST() {
  // TODO (Ticket 4): Create a new project (validate with Zod, insert into DB)
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented" },
    { status: 501 }
  );
}
