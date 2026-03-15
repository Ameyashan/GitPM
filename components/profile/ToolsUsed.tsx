// Tools used section — implemented in Ticket 8
// Horizontal row of build tool chips with usage counts

interface ToolsUsedProps {
  tools: { name: string; count: number }[];
}

export function ToolsUsed({ tools }: ToolsUsedProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => (
        <span
          key={tool.name}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-dark border border-gitpm-border/50 px-3 py-1 text-xs font-mono text-white/80"
        >
          {tool.name}
          <span className="text-purple font-semibold">{tool.count}</span>
        </span>
      ))}
    </div>
  );
}
