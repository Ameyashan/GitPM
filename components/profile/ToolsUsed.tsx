import { BadgePill } from "@/components/shared/BadgePill";

interface ToolsUsedProps {
  tools: { name: string; count: number }[];
}

export function ToolsUsed({ tools }: ToolsUsedProps) {
  if (tools.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => (
        <BadgePill
          key={tool.name}
          label={`${tool.name} ×${tool.count}`}
          variant="purple"
        />
      ))}
    </div>
  );
}
