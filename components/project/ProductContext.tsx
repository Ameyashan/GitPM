// Product context sections — implemented in Ticket 4
import type { Project } from "@/types/project";

interface ProductContextProps {
  project: Project;
}

export function ProductContext({ project }: ProductContextProps) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">
          Problem
        </h2>
        <p className="text-white/80">{project.problem_statement}</p>
      </section>

      {project.target_user && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">
            Target User
          </h2>
          <p className="text-white/80">{project.target_user}</p>
        </section>
      )}

      {project.key_decisions && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">
            Key Decisions
          </h2>
          <p className="text-white/80">{project.key_decisions}</p>
        </section>
      )}

      {project.learnings && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-2">
            Learnings
          </h2>
          <p className="text-white/80">{project.learnings}</p>
        </section>
      )}
    </div>
  );
}
