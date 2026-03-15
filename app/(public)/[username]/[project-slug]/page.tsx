// Project detail page — implemented in Ticket 4
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string; "project-slug": string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, "project-slug": slug } = await params;
  return { title: `${slug} by ${username}` };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { username, "project-slug": slug } = await params;
  return (
    <main className="min-h-screen bg-navy">
      <p className="text-white p-8">
        Project: {username}/{slug} — coming in Ticket 4
      </p>
    </main>
  );
}
