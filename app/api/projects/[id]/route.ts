// Single project CRUD — implemented in Ticket 4
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented", id },
    { status: 501 }
  );
}

export async function PATCH(_request: Request, { params }: Context) {
  const { id } = await params;
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented", id },
    { status: 501 }
  );
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return NextResponse.json(
    { error: "Not implemented", code: "not_implemented", id },
    { status: 501 }
  );
}
