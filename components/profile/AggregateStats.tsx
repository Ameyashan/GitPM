interface AggregateStatsProps {
  totalProjects: number;
  totalCommits: number;
  verifiedCount: number;
  avgScore?: number | null;
  totalUsers?: number | null;
}

export function AggregateStats({
  totalProjects,
  totalCommits,
  verifiedCount,
  avgScore,
  totalUsers,
}: AggregateStatsProps) {
  const stats = [
    { value: totalProjects, label: "Projects" },
    { value: totalCommits, label: "Commits" },
    { value: verifiedCount, label: "Verified" },
    { value: avgScore != null ? avgScore : "—", label: "Avg score", mobileHide: true },
    { value: totalUsers != null ? totalUsers : "—", label: "Users", mobileHide: true },
  ];

  return (
    <div
      className="grid grid-cols-3 md:grid-cols-5 gap-px bg-gitpm-border-light rounded-[14px] overflow-hidden relative z-10 shadow-[0_1px_3px_rgba(13,27,42,0.08)]"
      style={{ marginTop: "-28px" }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`bg-white py-4 px-3 text-center${stat.mobileHide ? " hidden md:block" : ""}`}
        >
          <div
            className="text-[22px] font-medium font-mono text-text-primary"
            style={{ letterSpacing: "-0.5px" }}
          >
            {stat.value}
          </div>
          <div className="text-[10px] text-text-muted uppercase font-medium mt-[3px]"
            style={{ letterSpacing: "0.07em" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
