import React from "react";

type LogoVariant = "dark" | "light" | "white";
type LogoSize = "sm" | "md" | "lg";

interface GitPMLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 20, font: 16, gap: 6, stroke: 2 },
  md: { icon: 28, font: 22, gap: 8, stroke: 2.5 },
  lg: { icon: 36, font: 28, gap: 10, stroke: 2.8 },
};

const variantConfig = {
  dark: { icon: "#0A7558", text: "#F0F2F0" },
  light: { icon: "#0D1B2A", text: "#0D1B2A" },
  white: { icon: "#FFFFFF", text: "#FFFFFF" },
};

export function GitPMLogo({
  variant = "dark",
  size = "md",
  showWordmark = true,
  className,
}: GitPMLogoProps) {
  const s = sizeConfig[size];
  const v = variantConfig[variant];
  const half = s.icon / 2;
  const outerR = s.icon * 0.194;
  const innerR = s.icon * 0.078;
  const lineEnd1 = half - outerR - s.stroke * 0.6;
  const lineEnd2 = half + outerR + s.stroke * 0.6;

  return (
    <div
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: s.gap }}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox={`0 0 ${s.icon} ${s.icon}`}
        fill="none"
      >
        <line
          x1={half}
          y1={1}
          x2={half}
          y2={lineEnd1}
          stroke={v.icon}
          strokeWidth={s.stroke}
          strokeLinecap="round"
        />
        <line
          x1={half}
          y1={lineEnd2}
          x2={half}
          y2={s.icon - 1}
          stroke={v.icon}
          strokeWidth={s.stroke}
          strokeLinecap="round"
        />
        <circle
          cx={half}
          cy={half}
          r={outerR}
          stroke={v.icon}
          strokeWidth={s.stroke}
        />
        <circle cx={half} cy={half} r={innerR} fill={v.icon} />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: s.font,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: v.text,
          }}
        >
          <span style={{ fontWeight: 700 }}>git</span>
          <span style={{ fontWeight: 500, opacity: variant === "white" ? 0.7 : 0.55 }}>
            pm
          </span>
        </span>
      )}
    </div>
  );
}
