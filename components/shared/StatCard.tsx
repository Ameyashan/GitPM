interface StatCardProps {
  value: string | number;
  label: string;
  accent?: "teal" | "purple";
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  teal: "text-teal",
  purple: "text-purple",
};

export function StatCard({ value, label, accent }: StatCardProps) {
  const valueClass = accent
    ? ACCENT_CLASSES[accent]
    : "text-white";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-2xl font-display font-bold tabular-nums ${valueClass}`}>
        {value}
      </span>
      <span className="text-xs text-white/50 text-center leading-tight">{label}</span>
    </div>
  );
}
