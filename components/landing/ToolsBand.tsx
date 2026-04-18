const TOOLS = [
  { name: "Cursor", mono: "C", bg: "#0D1B2A" },
  { name: "Lovable", mono: "Lv", bg: "#E8655E" },
  { name: "v0", mono: "v0", bg: "#1a1a1a" },
  { name: "Bolt", mono: "B", bg: "#4B2FD9" },
  { name: "Replit", mono: "R", bg: "#F26207" },
  { name: "Vercel", mono: "▲", bg: "#111" },
  { name: "Claude", mono: "Cl", bg: "#D97757" },
];

export function ToolsBand() {
  return (
    <section className="gitpm-tools-band">
      <div className="gitpm-tools-label">PMs are vibecoding with</div>
      <div className="gitpm-tools-track">
        {TOOLS.map((t) => (
          <span key={t.name} className="gitpm-tool-chip">
            <span className="gitpm-tool-mono" style={{ background: t.bg }}>
              {t.mono}
            </span>
            <span>{t.name}</span>
            <span className="gitpm-tool-dot" title="Integrated" />
          </span>
        ))}
      </div>
      <div className="gitpm-tools-note">
        auto-detected from your repo · commit graph · deploy logs
      </div>
    </section>
  );
}
