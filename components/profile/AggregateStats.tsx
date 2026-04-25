interface StatCardData {
  label: string;
  value: string;
  secondary?: string | null;
  trend?: "up" | "neutral";
}

interface AggregateStatsProps {
  totalProjects: number;
  totalCommits: number;
  verifiedCount: number;
  profileViews: number;
  newProjectsThisQuarter: number;
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

export function AggregateStats({
  totalProjects,
  totalCommits,
  verifiedCount,
  profileViews,
  newProjectsThisQuarter,
}: AggregateStatsProps) {
  const trustPct =
    totalProjects > 0 ? Math.round((verifiedCount / totalProjects) * 100) : 0;

  const cards: StatCardData[] = [
    {
      label: "Projects",
      value: String(totalProjects),
      secondary:
        newProjectsThisQuarter > 0
          ? `${newProjectsThisQuarter} this quarter`
          : "this quarter",
      trend: newProjectsThisQuarter > 0 ? "up" : "neutral",
    },
    {
      label: "Commits",
      value: totalCommits.toLocaleString(),
      secondary: totalProjects > 0 ? `across ${totalProjects} projects` : null,
      trend: "neutral",
    },
    {
      label: "Verified",
      value: `${verifiedCount} / ${totalProjects}`,
      secondary: totalProjects > 0 ? `${trustPct}% trust score` : null,
      trend: "neutral",
    },
    {
      label: "Profile views",
      value: formatViews(profileViews),
      secondary: "lifetime",
      trend: "neutral",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10"
      style={{ marginTop: "-32px" }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-[12px] px-[18px] pt-[14px] pb-[14px] shadow-[0_1px_3px_rgba(13,27,42,0.08)]"
          style={{ border: "0.5px solid var(--border-light)" }}
        >
          <div
            className="text-[10px] font-medium uppercase text-text-muted"
            style={{ letterSpacing: "0.09em" }}
          >
            {c.label}
          </div>
          <div
            className="text-[26px] font-medium font-mono text-text-primary mt-[6px]"
            style={{ letterSpacing: "-0.6px", lineHeight: 1 }}
          >
            {c.value}
          </div>
          {c.secondary && (
            <div className="text-[11px] text-text-muted mt-[8px] flex items-center gap-[4px]">
              {c.trend === "up" && (
                <span className="text-teal" aria-hidden>
                  ↑
                </span>
              )}
              {c.secondary}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
