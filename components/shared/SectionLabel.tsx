interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-2">
      {children}
    </p>
  );
}
