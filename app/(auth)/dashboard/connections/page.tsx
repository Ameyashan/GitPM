// OAuth connections management — implemented in Ticket 6
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Connected Accounts" };

export default function ConnectionsPage() {
  return (
    <main className="min-h-screen bg-navy">
      <p className="text-white p-8">
        Connected accounts — coming in Ticket 6
      </p>
    </main>
  );
}
