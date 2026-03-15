// Tech stack pills — implemented in Ticket 5
interface TechStackPillsProps {
  stack: string[];
}

export function TechStackPills({ stack }: TechStackPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {stack.map((tech) => (
        <span
          key={tech}
          className="rounded-md bg-surface-dark border border-gitpm-border/50 px-2.5 py-0.5 text-xs font-mono text-white/70"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}
