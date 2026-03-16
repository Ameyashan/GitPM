import { Navigation } from "@/components/shared/Navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navigation />
      <div className="flex flex-1 min-h-0">
        <DashboardSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
