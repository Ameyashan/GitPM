// Trigger project verification — implemented in Ticket 6
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Context) {
  const { id } = await params;
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented", id },
    { status: 501 }
  );
}
