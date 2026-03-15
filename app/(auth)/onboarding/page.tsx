// Post-signup onboarding — implemented in Ticket 3
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Set Up Your Profile" };

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-navy">
      <p className="text-white p-8">Onboarding — coming in Ticket 3</p>
    </main>
  );
}
