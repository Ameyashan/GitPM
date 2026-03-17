import { StatCard } from "@/components/shared/StatCard";

interface AggregateStatsProps {
  totalProjects: number;
  totalCommits: number;
  verifiedCount: number;
}

export function AggregateStats({
  totalProjects,
  totalCommits,
  verifiedCount,
}: AggregateStatsProps) {
  return (
    <div className="grid grid-cols-3 sm:flex sm:items-center sm:gap-8 gap-2">
      <StatCard value={totalProjects} label="Projects" />
      <div className="hidden sm:block h-8 w-px bg-gitpm-border/30 shrink-0" />
      <StatCard value={totalCommits} label="Commits" />
      <div className="hidden sm:block h-8 w-px bg-gitpm-border/30 shrink-0" />
      <StatCard value={verifiedCount} label="Verified" accent="teal" />
    </div>
  );
}
