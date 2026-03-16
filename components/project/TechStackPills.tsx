import { BadgePill } from "@/components/shared/BadgePill";
import type { VerificationMethod } from "@/types/project";

interface TechStackPillsProps {
  buildTools?: string[];
  hosting?: string | null;
  stack?: string[];
  categories?: string[];
  verificationMethod?: VerificationMethod | null;
}

export function TechStackPills({
  buildTools = [],
  hosting,
  stack = [],
  categories = [],
}: TechStackPillsProps) {
  const hasAny =
    buildTools.length > 0 || hosting || stack.length > 0 || categories.length > 0;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {buildTools.map((tool) => (
        <BadgePill key={`tool-${tool}`} label={tool} variant="purple" />
      ))}
      {hosting && <BadgePill label={hosting} variant="teal" />}
      {stack.map((tech) => (
        <BadgePill key={`stack-${tech}`} label={tech} variant="default" />
      ))}
      {categories.map((cat) => (
        <BadgePill key={`cat-${cat}`} label={cat} variant="forest" />
      ))}
    </div>
  );
}
