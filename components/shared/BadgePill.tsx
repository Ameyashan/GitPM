// Reusable badge/pill component — used across project cards and detail pages

interface BadgePillProps {
  label: string;
  variant?: "default" | "teal" | "purple" | "forest";
}

const VARIANT_CLASSES: Record<NonNullable<BadgePillProps["variant"]>, string> =
  {
    default:
      "bg-dark-surface text-white/70 border border-gitpm-border/50",
    teal: "bg-teal/10 text-teal border border-teal/20",
    purple: "bg-purple/10 text-purple border border-purple/20",
    forest: "bg-forest/10 text-forest border border-forest/20",
  };

export function BadgePill({ label, variant = "default" }: BadgePillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono ${VARIANT_CLASSES[variant]}`}
    >
      {label}
    </span>
  );
}
