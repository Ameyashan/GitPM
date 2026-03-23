const HEATMAP_COLORS = [
  "#EDECEA", // level 0 – surface-light
  "#B7DFCA", // level 1
  "#5DCAA5", // level 2
  "#1D9E75", // level 3
  "#0A7558", // level 4 – teal
];

/** 7 rows × 12 cols — used when we have no synced GitHub activity yet */
const EMPTY_HEATMAP: number[] = Array.from({ length: 84 }, () => 0);

interface TierCardProps {
  verifiedCount: number;
  heatmapData?: number[] | null;
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4 text-teal"
    >
      <path d="M10 2l2.4 4.8L18 7.6l-4 3.9.9 5.5L10 14.4 5.1 17l.9-5.5-4-3.9 5.6-.8L10 2z" />
    </svg>
  );
}

export function TierCard({ verifiedCount, heatmapData }: TierCardProps) {
  const resolvedHeatmap =
    Array.isArray(heatmapData) && heatmapData.length === 84
      ? heatmapData
      : EMPTY_HEATMAP;
  const tierName =
    verifiedCount >= 5
      ? "Verified builder"
      : verifiedCount >= 1
      ? "Active builder"
      : "Getting started";

  const tierDesc =
    verifiedCount >= 5
      ? "5+ verified projects with avg confidence above 70"
      : verifiedCount >= 1
      ? `${verifiedCount} verified project${verifiedCount !== 1 ? "s" : ""} — keep building`
      : "Publish and verify your first project";

  return (
    <div
      className="flex items-center gap-[14px] bg-white rounded-[10px] px-[18px] py-[14px] mt-5"
      style={{ border: "0.5px solid var(--border-light)" }}
    >
      {/* Icon */}
      <div
        className="w-[34px] h-[34px] rounded-full shrink-0 flex items-center justify-center"
        style={{ background: "var(--teal-bg)" }}
      >
        <StarIcon />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-text-primary">{tierName}</div>
        <div className="text-[11px] text-text-muted mt-[1px]">{tierDesc}</div>
      </div>

      {/* Heatmap — hidden on mobile */}
      <div className="ml-auto shrink-0 text-right hidden md:block">
        <div
          className="text-[10px] text-text-muted uppercase font-medium mb-[5px]"
          style={{ letterSpacing: "0.05em" }}
        >
          Build activity (12wk)
        </div>
        <div
          className="grid gap-[2px]"
          style={{ gridTemplateColumns: "repeat(12, 1fr)" }}
        >
          {resolvedHeatmap.map((level, i) => (
            <div
              key={i}
              className="w-[9px] h-[9px] rounded-[2px]"
              style={{ background: HEATMAP_COLORS[level] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
