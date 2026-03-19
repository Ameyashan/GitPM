interface ToolsUsedProps {
  tools: { name: string; count: number }[];
}

export function ToolsUsed({ tools }: ToolsUsedProps) {
  if (tools.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => (
        <div
          key={tool.name}
          className="flex items-center gap-[5px] px-3 py-[5px] rounded-[6px] bg-white text-[12px] text-text-secondary"
          style={{ border: "0.5px solid var(--border-light)" }}
        >
          <span className="capitalize">{tool.name}</span>
          <span
            className="text-[10px] text-text-muted bg-surface-light px-[6px] py-px rounded-[4px] font-mono"
          >
            {tool.count}
          </span>
        </div>
      ))}
    </div>
  );
}
