"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ExternalLink, Play } from "lucide-react";
import type { Project, User } from "@/types/project";

interface ProjectModalProps {
  project: Project;
  user: Pick<User, "display_name" | "username" | "avatar_url">;
  onClose: () => void;
}

// ── Seeded pseudo-random helpers ──────────────────────────────────────────────

function seededRand(seed: string, index: number): number {
  let hash = 0;
  const str = seed + String(index);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  return Math.abs(hash % 100) / 100;
}

function generateSparkline(seed: string, count = 24): number[] {
  return Array.from({ length: count }, (_, i) =>
    Math.max(0.12, seededRand(seed, i))
  );
}

function calcBuildDays(
  firstCommit: string | null,
  latestDeploy: string | null
): number | null {
  if (!firstCommit || !latestDeploy) return null;
  const diff = new Date(latestDeploy).getTime() - new Date(firstCommit).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function initials(displayName: string | null, username: string): string {
  const name = (displayName ?? username).trim();
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Treats null, undefined, and whitespace-only as empty. */
function hasNonEmptyText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasProjectNarrativeContent(project: Project): boolean {
  return (
    hasNonEmptyText(project.problem_statement) ||
    hasNonEmptyText(project.target_user) ||
    hasNonEmptyText(project.key_decisions) ||
    hasNonEmptyText(project.learnings) ||
    hasNonEmptyText(project.metrics_text) ||
    hasNonEmptyText(project.github_repo_url)
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModalPills({ project }: { project: Project }) {
  const pills: { label: string; style: React.CSSProperties }[] = [
    ...project.build_tools.map((t) => ({
      label: t,
      style: {
        background: "var(--purple-bg)",
        color: "var(--purple)",
        fontSize: 12,
        padding: "4px 12px",
        borderRadius: 4,
        fontWeight: 500,
      },
    })),
    ...(project.hosting_platform
      ? [
          {
            label: project.hosting_platform,
            style: {
              background: "var(--teal-bg)",
              color: "var(--teal)",
              fontSize: 12,
              padding: "4px 12px",
              borderRadius: 4,
              fontWeight: 500,
            },
          },
        ]
      : []),
    ...project.tech_stack.map((t) => ({
      label: t,
      style: {
        background: "var(--surface-light)",
        color: "var(--text-secondary)",
        fontSize: 12,
        padding: "4px 12px",
        borderRadius: 4,
        fontWeight: 500,
      },
    })),
    ...project.category_tags.map((c) => ({
      label: c,
      style: {
        border: "0.5px solid var(--border)",
        color: "var(--text-muted)",
        background: "transparent",
        fontSize: 12,
        padding: "4px 12px",
        borderRadius: 4,
        fontWeight: 500,
      },
    })),
  ];

  if (pills.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
      {pills.map((p, i) => (
        <span key={i} style={p.style}>
          {p.label}
        </span>
      ))}
    </div>
  );
}

function MetricsGrid({
  project,
  buildDays,
  sparkline,
}: {
  project: Project;
  buildDays: number | null;
  sparkline: number[];
}) {
  const hasCommits = project.commit_count !== null && project.commit_count > 0;
  const hasMetrics = hasCommits || buildDays !== null;

  if (!hasMetrics) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {/* Left: Build activity */}
      <div
        style={{
          background: "var(--surface-light)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          Build activity
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.4px", fontFamily: "var(--font-mono)" }}>
              {hasCommits ? project.commit_count : "—"}
            </span>
            {hasCommits && (
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>commits</span>
            )}
          </div>
          {buildDays !== null && (
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {buildDays}d
            </span>
          )}
        </div>
        {/* Sparkline */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
            height: 32,
            marginTop: 10,
          }}
        >
          {sparkline.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: Math.max(3, Math.round(h * 32)),
                borderRadius: 1,
                background: "var(--teal)",
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right: 2x2 sub-grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* Solo/Team */}
        <div
          style={{
            background: "var(--surface-light)",
            borderRadius: "var(--radius)",
            padding: "14px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            Builder
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>
            {project.is_solo ? "Solo" : "Team"}
          </div>
        </div>

        {/* Build time */}
        <div
          style={{
            background: "var(--surface-light)",
            borderRadius: "var(--radius)",
            padding: "14px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            Build time
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {buildDays !== null ? `${buildDays}d` : "—"}
          </div>
        </div>

        {/* Verification status — spans full width */}
        <div
          style={{
            gridColumn: "1 / -1",
            background: "var(--surface-light)",
            borderRadius: "var(--radius)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            Verification
          </span>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "var(--border-light)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 2,
                width: project.is_verified ? "100%" : "0%",
                background: "linear-gradient(90deg, var(--teal) 0%, var(--teal-light) 100%)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              color: project.is_verified ? "var(--teal)" : "var(--text-muted)",
            }}
          >
            {project.is_verified ? "✓" : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PMContext({ project }: { project: Project }) {
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontWeight: 500,
    marginBottom: 8,
  };
  const proseStyle: React.CSSProperties = {
    fontSize: 14,
    color: "var(--text-primary)",
    lineHeight: 1.65,
    marginBottom: 20,
    whiteSpace: "pre-wrap",
  };
  const decisionsStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginBottom: 20,
    paddingLeft: 12,
    borderLeft: "1.5px solid var(--border)",
    whiteSpace: "pre-wrap",
  };

  const showProblem = hasNonEmptyText(project.problem_statement);
  const showTargetUser = hasNonEmptyText(project.target_user);
  const showKeyDecisions = hasNonEmptyText(project.key_decisions);
  const showLearnings = hasNonEmptyText(project.learnings);
  const showMetrics = hasNonEmptyText(project.metrics_text);
  const showRepo = hasNonEmptyText(project.github_repo_url);

  if (!hasProjectNarrativeContent(project)) {
    return null;
  }

  return (
    <div>
      {showProblem && (
        <>
          <div style={labelStyle}>Problem</div>
          <p style={proseStyle}>{project.problem_statement.trim()}</p>
        </>
      )}

      {showTargetUser && (
        <>
          <div style={labelStyle}>Target users</div>
          <p style={proseStyle}>{project.target_user!.trim()}</p>
        </>
      )}

      {showKeyDecisions && (
        <>
          <div style={labelStyle}>Key decisions</div>
          <div style={decisionsStyle}>{project.key_decisions!.trim()}</div>
        </>
      )}

      {showLearnings && (
        <>
          <div style={labelStyle}>What I learned</div>
          <p
            style={{
              ...proseStyle,
              marginBottom: showMetrics || showRepo ? 20 : 0,
            }}
          >
            {project.learnings!.trim()}
          </p>
        </>
      )}

      {showMetrics && (
        <>
          <div style={labelStyle}>Metrics & impact</div>
          <p
            style={{
              ...proseStyle,
              marginBottom: showRepo ? 20 : 0,
            }}
          >
            {project.metrics_text!.trim()}
          </p>
        </>
      )}

      {showRepo && (
        <>
          <div style={labelStyle}>Repository</div>
          <a
            href={project.github_repo_url!.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[5px] text-teal no-underline font-mono transition-colors duration-150"
            style={{
              fontSize: 12,
              padding: "5px 10px",
              background: "var(--teal-bg)",
              borderRadius: 5,
              marginBottom: 0,
              display: "inline-flex",
              maxWidth: "100%",
              wordBreak: "break-all",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#0A755820")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--teal-bg)")
            }
          >
            <ExternalLink style={{ width: 11, height: 11, flexShrink: 0 }} />
            {project.github_repo_url!.trim()}
          </a>
        </>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function ProjectModal({ project, user, onClose }: ProjectModalProps) {
  const hasVideo = Boolean(project.demo_video_url);
  const hasThumbnail = Boolean(project.thumbnail_url);
  const buildDays = calcBuildDays(project.first_commit_at, project.latest_deploy_at);
  const sparkline = generateSparkline(project.id);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const authorInitials = initials(user.display_name, user.username);

  return (
    <div
      className="fixed inset-0 overflow-y-auto flex justify-center"
      style={{
        background: "rgba(13,27,42,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        padding: "32px 20px",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="modal-slide-up bg-white relative overflow-hidden"
        style={{
          borderRadius: 12,
          maxWidth: 700,
          width: "100%",
          height: "fit-content",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center border-none cursor-pointer transition-colors duration-150 group"
          style={{
            top: 14,
            right: 14,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "white")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.85)")
          }
          aria-label="Close"
        >
          <X style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
        </button>

        {/* ── Hero ── */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ height: 240, background: "var(--dark-surface)" }}
        >
          {/* Mesh blobs */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }}>
            <div
              className="absolute rounded-full"
              style={{
                width: 200,
                height: 200,
                background: "var(--teal)",
                filter: "blur(45px)",
                top: -50,
                right: 30,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 130,
                height: 130,
                background: "var(--purple)",
                filter: "blur(38px)",
                bottom: -20,
                left: 60,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 100,
                height: 100,
                background: "var(--forest)",
                filter: "blur(32px)",
                top: 60,
                left: "50%",
              }}
            />
          </div>

          {hasThumbnail && (
            <Image
              src={project.thumbnail_url!}
              alt={project.name}
              fill
              className="object-cover z-[1]"
              sizes="(max-width: 700px) 100vw, 700px"
              priority
            />
          )}

          {/* Wireframe placeholder (no thumbnail) */}
          {!hasThumbnail && (
            <div
              className="relative grid gap-1 p-2"
              style={{
                zIndex: 1,
                width: "60%",
                height: 160,
                borderRadius: 6,
                border: "0.5px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                gridTemplateColumns: "1fr 2fr",
              }}
            >
              <div
                className="rounded-[3px]"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div
                className="rounded-[3px]"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>
          )}

          {/* Play button */}
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 52,
                  height: 52,
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
                }}
              >
                <Play
                  className="fill-navy text-navy"
                  style={{ width: 20, height: 20, marginLeft: 3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 28px 32px" }}>
          {/* Title row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "-0.4px",
                color: "var(--text-primary)",
                lineHeight: 1.3,
              }}
            >
              {project.name}
            </h2>
            {project.is_verified ? (
              <span
                className="inline-flex items-center gap-1 font-medium whitespace-nowrap shrink-0 text-teal"
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 5,
                  background: "var(--teal-bg)",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ width: 12, height: 12 }}
                >
                  <path
                    d="M3 8.5L6.5 12L13 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Verified owner
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-text-muted"
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 5,
                  background: "var(--surface-light)",
                }}
              >
                Unverified
              </span>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              {project.description}
            </p>
          )}

          {/* Live URL */}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[5px] text-teal no-underline font-mono transition-colors duration-150"
              style={{
                fontSize: 12,
                padding: "5px 10px",
                background: "var(--teal-bg)",
                borderRadius: 5,
                marginBottom: 16,
                display: "inline-flex",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#0A755820")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--teal-bg)")
              }
            >
              <ExternalLink style={{ width: 11, height: 11 }} />
              {project.live_url}
            </a>
          )}

          {/* Pills */}
          <ModalPills project={project} />

          {/* Enhanced metrics */}
          <MetricsGrid
            project={project}
            buildDays={buildDays}
            sparkline={sparkline}
          />

          {/* Narrative (problem, product context, metrics, repo) */}
          {hasProjectNarrativeContent(project) && (
            <>
              <hr
                style={{
                  border: "none",
                  borderTop: "0.5px solid var(--border-light)",
                  margin: "24px 0",
                }}
              />
              <PMContext project={project} />
            </>
          )}

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 no-underline"
                style={{
                  background: "var(--navy)",
                  color: "white",
                  padding: "11px 24px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <ExternalLink style={{ width: 13, height: 13 }} />
                Visit live site
              </a>
            )}
            {hasVideo && project.demo_video_url && (
              <a
                href={project.demo_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 no-underline"
                style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "0.5px solid var(--border)",
                  padding: "11px 24px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-body)",
                }}
              >
                <Play style={{ width: 13, height: 13 }} />
                Watch demo
              </a>
            )}
          </div>
        </div>

        {/* ── Author footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 32px",
            borderTop: "0.5px solid var(--border-light)",
            background: "var(--surface-card)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--purple) 0%, var(--teal) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 500,
              color: "white",
              flexShrink: 0,
            }}
          >
            {authorInitials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
              {user.display_name ?? user.username}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Product Manager
            </div>
          </div>

          {/* Sparkline — right-aligned */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 2,
              alignItems: "flex-end",
              height: 22,
            }}
          >
            {sparkline.slice(0, 14).map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: Math.max(4, Math.round(h * 22)),
                  borderRadius: 1,
                  background: "var(--teal)",
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
