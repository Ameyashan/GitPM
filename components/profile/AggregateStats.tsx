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
    <div className="flex items-center gap-8">
      <StatCard value={totalProjects} label="Projects" />
      <div className="h-8 w-px bg-gitpm-border/30" />
      <StatCard value={totalCommits} label="Commits" />
      <div className="h-8 w-px bg-gitpm-border/30" />
      <StatCard value={verifiedCount} label="Verified" accent="teal" />
    </div>
  );
}
