// Public profile page — implemented in Ticket 4
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: username };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  return (
    <main className="min-h-screen bg-navy">
      <p className="text-white p-8">Profile: {username} — coming in Ticket 4</p>
    </main>
  );
}
