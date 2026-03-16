import { SectionLabel } from "@/components/shared/SectionLabel";
import type { Project } from "@/types/project";

interface ProductContextProps {
  project: Project;
}

export function ProductContext({ project }: ProductContextProps) {
  return (
    <div className="space-y-7">
      <section>
        <SectionLabel>Problem Statement</SectionLabel>
        <p className="text-white/80 leading-relaxed text-[15px]">
          {project.problem_statement}
        </p>
      </section>

      {project.target_user && (
        <section>
          <SectionLabel>Target User</SectionLabel>
          <p className="text-white/80 leading-relaxed text-[15px]">
            {project.target_user}
          </p>
        </section>
      )}

      {project.key_decisions && (
        <section>
          <SectionLabel>Key Decisions</SectionLabel>
          <div className="border-l-2 border-purple/50 pl-4">
            <p className="text-white/80 leading-relaxed text-[15px]">
              {project.key_decisions}
            </p>
          </div>
        </section>
      )}

      {project.learnings && (
        <section>
          <SectionLabel>Learnings</SectionLabel>
          <p className="text-white/80 leading-relaxed text-[15px]">
            {project.learnings}
          </p>
        </section>
      )}
    </div>
  );
}
