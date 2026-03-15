// Aggregate stats row — implemented in Ticket 8
// Shows total projects, total commits, verified count

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
    <div className="flex gap-8">
      <div>
        <span className="text-2xl font-display font-bold text-white">
          {totalProjects}
        </span>
        <p className="text-sm text-white/60">Projects</p>
      </div>
      <div>
        <span className="text-2xl font-display font-bold text-white">
          {totalCommits}
        </span>
        <p className="text-sm text-white/60">Commits</p>
      </div>
      <div>
        <span className="text-2xl font-display font-bold text-teal">
          {verifiedCount}
        </span>
        <p className="text-sm text-white/60">Verified</p>
      </div>
    </div>
  );
}
