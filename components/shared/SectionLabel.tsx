interface SectionLabelProps {
  children: React.ReactNode;
  mode?: "dark" | "light";
}

export function SectionLabel({ children, mode = "dark" }: SectionLabelProps) {
  if (mode === "light") {
    return (
      <div className="flex items-center gap-3 mt-7 mb-[14px]">
        <span
          className="text-[12px] font-medium text-text-muted uppercase whitespace-nowrap"
          style={{ letterSpacing: "0.07em" }}
        >
          {children}
        </span>
        <div className="flex-1 h-[0.5px] bg-gitpm-border-light" />
      </div>
    );
  }

  return (
    <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-2">
      {children}
    </p>
  );
}
