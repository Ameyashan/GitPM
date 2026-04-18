"use client";

import { useCountUp, usePrefersReducedMotion } from "./motion-hooks";

type Commit = {
  sha: string;
  msg: string;
  when: string;
  tool: string;
  vercel?: boolean;
};

const COMMITS: Commit[] = [
  { sha: "f8a2c91", msg: "feat: weekly digest email", when: "2m", tool: "Cursor" },
  { sha: "b14e7d2", msg: "fix: timezone drift in charts", when: "14m", tool: "Claude" },
  { sha: "e9c33b0", msg: "deploy: production v0.4.2", when: "1h", tool: "Vercel", vercel: true },
  { sha: "a71de84", msg: "feat: onboarding with templates", when: "3h", tool: "Lovable" },
  { sha: "2d5f019", msg: "refactor: split metrics worker", when: "8h", tool: "Cursor" },
  { sha: "7c08bba", msg: "chore: bump supabase client", when: "1d", tool: "Cursor" },
];

export function CommitGraphCard() {
  const reduced = usePrefersReducedMotion();
  const commits = useCountUp(87, 1400, 500);
  const days = useCountUp(18, 1400, 500);

  return (
    <div className="gitpm-graph-card">
      <div className="gitpm-graph-chrome">
        <span className="gitpm-graph-dot" />
        <span className="gitpm-graph-dot" />
        <span className="gitpm-graph-dot" />
        <span className="gitpm-graph-path">
          ~/metric-pulse <span className="gitpm-graph-branch">main</span>
        </span>
        <span className="gitpm-graph-live">
          <span className="gitpm-graph-live-dot" /> synced now
        </span>
      </div>

      <div className="gitpm-graph-body">
        {COMMITS.map((c, i) => (
          <div
            key={c.sha}
            className="gitpm-commit-row"
            style={{ animationDelay: reduced ? "0s" : `${0.3 + i * 0.15}s` }}
          >
            <div className="gitpm-commit-bullet" />
            <div className="gitpm-commit-sha">{c.sha}</div>
            <div className="gitpm-commit-msg">{c.msg}</div>
            <div className={`gitpm-commit-tool${c.vercel ? " gitpm-commit-tool-vercel" : ""}`}>
              {c.tool}
            </div>
            <div className="gitpm-commit-when">{c.when}</div>
          </div>
        ))}
      </div>

      <div className="gitpm-stat-strip">
        <div className="gitpm-stat-cell">
          <div className="gitpm-stat-v">{commits}</div>
          <div className="gitpm-stat-k">Commits</div>
        </div>
        <div className="gitpm-stat-cell">
          <div className="gitpm-stat-v">{days}</div>
          <div className="gitpm-stat-k">Days</div>
        </div>
        <div className="gitpm-stat-cell">
          <div className="gitpm-stat-v" style={{ color: "var(--teal-light)" }}>Verified</div>
          <div className="gitpm-stat-k">via Vercel</div>
        </div>
      </div>
    </div>
  );
}
