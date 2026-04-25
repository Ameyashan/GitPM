interface TrustTierCardProps {
  verifiedCount: number;
  totalProjects: number;
  tierLabel: string;
}

export function TrustTierCard({
  verifiedCount,
  totalProjects,
  tierLabel,
}: TrustTierCardProps) {
  const pct =
    totalProjects > 0 ? Math.round((verifiedCount / totalProjects) * 100) : 0;
  const radius = 26;
  const stroke = 5;
  const c = 2 * Math.PI * radius;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className="rounded-[14px] p-[18px] relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 100%)",
        border: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="absolute -right-6 -top-6 w-[120px] h-[120px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--teal-light), transparent 60%)" }}
        aria-hidden
      />

      <div
        className="text-[10px] font-medium uppercase text-white/55"
        style={{ letterSpacing: "0.1em" }}
      >
        Trust tier
      </div>
      <div className="text-[18px] font-medium text-white mt-[4px]" style={{ letterSpacing: "-0.3px" }}>
        {tierLabel}
      </div>

      <div className="flex items-center gap-[14px] mt-[16px]">
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="var(--teal-light)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div className="min-w-0">
          <div className="text-[22px] font-medium font-mono text-white" style={{ letterSpacing: "-0.4px" }}>
            {pct}%
          </div>
          <div className="text-[11px] text-white/60 mt-[2px]">
            {verifiedCount} of {totalProjects} project{totalProjects === 1 ? "" : "s"} verified
          </div>
        </div>
      </div>
    </div>
  );
}
