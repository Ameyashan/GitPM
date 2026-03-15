// Dashboard home — implemented in Ticket 3
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-navy">
      <p className="text-white p-8">Dashboard — coming in Ticket 3</p>
    </main>
  );
}
