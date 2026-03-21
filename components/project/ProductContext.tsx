import { SectionLabel } from "@/components/shared/SectionLabel";
import type { Project } from "@/types/project";

interface ProductContextProps {
  project: Project;
}

export function ProductContext({ project }: ProductContextProps) {
  return (
    <div className="mt-2">
      <section>
        <SectionLabel mode="light">Problem Statement</SectionLabel>
        <p className="text-text-secondary leading-relaxed text-[15px]">
          {project.problem_statement}
        </p>
      </section>

      {project.target_user && (
        <section>
          <SectionLabel mode="light">Target User</SectionLabel>
          <p className="text-text-secondary leading-relaxed text-[15px]">
            {project.target_user}
          </p>
        </section>
      )}

      {project.key_decisions && (
        <section>
          <SectionLabel mode="light">Key Decisions</SectionLabel>
          <div className="border-l-2 border-purple/30 pl-4">
            <p className="text-text-secondary leading-relaxed text-[15px]">
              {project.key_decisions}
            </p>
          </div>
        </section>
      )}

      {project.learnings && (
        <section>
          <SectionLabel mode="light">Learnings</SectionLabel>
          <p className="text-text-secondary leading-relaxed text-[15px]">
            {project.learnings}
          </p>
        </section>
      )}
    </div>
  );
}
