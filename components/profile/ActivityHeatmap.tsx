const HEATMAP_COLORS = [
  "#EDECEA",
  "#B7DFCA",
  "#5DCAA5",
  "#1D9E75",
  "#0A7558",
];

interface ActivityHeatmapProps {
  data: number[] | null;
  totalCommits: number;
}

function computeLongestStreak(weeks: number[]): number {
  let best = 0;
  let cur = 0;
  for (const v of weeks) {
    if (v > 0) {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

export function ActivityHeatmap({ data, totalCommits }: ActivityHeatmapProps) {
  const grid = Array.isArray(data) && data.length > 0 ? data : Array.from({ length: 84 }, () => 0);
  const cols = Math.ceil(grid.length / 7);
  const longest = computeLongestStreak(grid);

  return (
    <section className="mt-9">
      <div className="flex items-baseline gap-3 mb-[14px]">
        <h2 className="text-[18px] font-medium text-text-primary" style={{ letterSpacing: "-0.3px" }}>
          Activity
        </h2>
        <span className="text-[12px] text-text-muted">last 6 months</span>
      </div>

      <div
        className="bg-white rounded-[14px] p-5"
        style={{ border: "0.5px solid var(--border-light)" }}
      >
        <div
          className="grid gap-[4px] mx-auto"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 22px))`,
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(7, 22px)",
            maxWidth: "100%",
          }}
        >
          {grid.map((level, i) => (
            <div
              key={i}
              className="rounded-[4px] w-full h-full"
              style={{ background: HEATMAP_COLORS[Math.min(4, Math.max(0, level))] }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-[14px] text-[11px] text-text-muted">
          <div className="flex items-center gap-[6px]">
            <span>Less</span>
            <div className="flex gap-[3px]">
              {HEATMAP_COLORS.map((c, i) => (
                <span
                  key={i}
                  className="w-[10px] h-[10px] rounded-[2px] inline-block"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          <div className="font-mono">
            {totalCommits.toLocaleString()} commits · longest streak {longest} week{longest === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </section>
  );
}
