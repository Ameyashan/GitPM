import { Navigation } from "@/components/shared/Navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--page-bg)" }}>
      <Navigation />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
