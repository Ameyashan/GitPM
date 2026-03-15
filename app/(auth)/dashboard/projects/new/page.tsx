// New project form — implemented in Ticket 4
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Project" };

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-navy">
      <p className="text-white p-8">New project form — coming in Ticket 4</p>
    </main>
  );
}
