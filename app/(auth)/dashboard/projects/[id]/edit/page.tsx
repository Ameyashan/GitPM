// Edit project page — implemented in Ticket 4
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Project" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-navy">
      <p className="text-white p-8">Edit project {id} — coming in Ticket 4</p>
    </main>
  );
}
