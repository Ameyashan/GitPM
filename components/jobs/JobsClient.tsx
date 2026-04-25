"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Search, Briefcase, MapPin, ExternalLink, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Job {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  role_title: string;
  role_type: string;
  location: string | null;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  stack_tags: string[];
  tools_tags: string[];
  apply_url: string;
  posted_at: string | null;
}

interface JobWithScore extends Job {
  matchScore: number;
  matchCount: number;
}

const ROLE_FILTERS = [
  { value: "All", label: "All" },
  { value: "APM", label: "APM" },
  { value: "PM", label: "PM" },
  { value: "Senior PM", label: "Senior" },
  { value: "Staff", label: "Staff+" },
  { value: "FDE", label: "FDE" },
] as const;

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return max ? `up to ${fmt(max)}` : null;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function computeMatch(jobTags: string[], userStack: string[]): number {
  if (jobTags.length === 0 || userStack.length === 0) return 0;
  const userSet = new Set(userStack.map((t) => t.toLowerCase()));
  const hits = jobTags.filter((t) => userSet.has(t.toLowerCase())).length;
  return Math.round((hits / jobTags.length) * 100);
}

function CompanyLogo({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    return (
      <div
        className="flex items-center justify-center shrink-0 rounded-xl text-white font-semibold"
        style={{
          width: 44,
          height: 44,
          background: "linear-gradient(135deg, var(--purple), var(--teal))",
          fontSize: 14,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      width={44}
      height={44}
      className="rounded-xl object-contain shrink-0"
      style={{ background: "var(--surface-light)" }}
      onError={() => setErrored(true)}
    />
  );
}

function StatCard({
  label,
  value,
  subtext,
  accent,
}: {
  label: string;
  value: number;
  subtext: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "0.5px solid var(--border-light)",
        borderRadius: 12,
        padding: "16px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
        }}
      />
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{subtext}</div>
    </div>
  );
}

function MatchBadge({ score }: { score: number }) {
  if (score === 0) return null;
  const color =
    score >= 80 ? "var(--teal)" : score >= 50 ? "var(--purple)" : "var(--text-muted)";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color,
        background: score >= 80 ? "var(--teal-bg)" : "var(--surface-light)",
        padding: "2px 8px",
        borderRadius: 999,
        letterSpacing: "0.02em",
      }}
    >
      {score}% match
    </span>
  );
}

function JobCard({ job, userStack }: { job: JobWithScore; userStack: string[] }) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  const when = timeAgo(job.posted_at);
  const isNew =
    job.posted_at
      ? Date.now() - new Date(job.posted_at).getTime() < 7 * 86400000
      : false;
  const userSet = new Set(userStack.map((t) => t.toLowerCase()));

  return (
    <div
      className="flex items-center gap-4"
      style={{
        padding: "18px 24px",
        background: "var(--surface-card)",
        borderRadius: 12,
        border: "0.5px solid var(--border-light)",
        borderLeft: job.matchScore >= 80 ? "3px solid var(--teal)" : "3px solid transparent",
        transition: "border-color 0.15s",
      }}
    >
      {/* Logo */}
      <CompanyLogo url={job.company_logo_url} name={job.company_name} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {job.role_title}
          </span>
          {isNew && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#e85d04",
                background: "rgba(232,93,4,0.1)",
                padding: "1px 6px",
                borderRadius: 999,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              HOT
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-3 flex-wrap mt-0.5"
          style={{ fontSize: 13, color: "var(--text-secondary)" }}
        >
          <span style={{ fontWeight: 500 }}>{job.company_name}</span>
          {(job.location || job.remote) && (
            <span className="flex items-center gap-1">
              <MapPin style={{ width: 12, height: 12, opacity: 0.6 }} />
              {job.remote ? "Remote" : job.location}
            </span>
          )}
          <span
            style={{
              padding: "1px 8px",
              background: "var(--surface-light)",
              borderRadius: 999,
              fontSize: 11,
            }}
          >
            Full-time
          </span>
        </div>

        {/* Stack tags */}
        {job.stack_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.stack_tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: "1px 8px",
                  borderRadius: 999,
                  background: userSet.has(tag.toLowerCase())
                    ? "var(--teal-bg)"
                    : "var(--surface-light)",
                  color: userSet.has(tag.toLowerCase())
                    ? "var(--teal)"
                    : "var(--text-muted)",
                  fontWeight: userSet.has(tag.toLowerCase()) ? 500 : 400,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {when && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{when}</span>
        )}
        {salary && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {salary}
          </span>
        )}
        <div className="flex items-center gap-2">
          <MatchBadge score={job.matchScore} />
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--white)",
              background: "var(--text-primary)",
              padding: "6px 14px",
              borderRadius: 8,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Apply
            <ExternalLink style={{ width: 12, height: 12 }} />
          </a>
        </div>
      </div>
    </div>
  );
}

interface JobsClientProps {
  userStack: string[];
  isAuthed: boolean;
}

const ANON_VISIBLE_LIMIT = 5;
const ANON_BLURRED_PREVIEW = 3;

export function JobsClient({ userStack, isAuthed }: JobsClientProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [companyFilter, setCompanyFilter] = useState<string[]>([]);
  const supabaseRef = useRef(isAuthed ? null : createClient());

  async function handleSignIn() {
    const supabase = supabaseRef.current ?? createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "read:user repo",
      },
    });
  }

  useEffect(() => {
    setLoading(true);
    fetch("/api/jobs")
      .then((r) => r.json())
      .then(({ data }) => setJobs(data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const jobsWithScore = useMemo<JobWithScore[]>(() => {
    return jobs.map((j) => {
      const matchScore = computeMatch(j.stack_tags, userStack);
      return { ...j, matchScore, matchCount: j.stack_tags.length };
    });
  }, [jobs, userStack]);

  const filtered = useMemo(() => {
    return jobsWithScore
      .filter((j) => {
        if (roleFilter !== "All" && j.role_type !== roleFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !j.role_title.toLowerCase().includes(q) &&
            !j.company_name.toLowerCase().includes(q) &&
            !j.stack_tags.some((t) => t.toLowerCase().includes(q))
          )
            return false;
        }
        if (companyFilter.length > 0 && !companyFilter.includes(j.company_name)) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        const at = a.posted_at ? new Date(a.posted_at).getTime() : 0;
        const bt = b.posted_at ? new Date(b.posted_at).getTime() : 0;
        return bt - at;
      });
  }, [jobsWithScore, roleFilter, search, companyFilter]);

  function toggleCompany(name: string) {
    setCompanyFilter((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  const topCompanies = useMemo<string[]>(() => {
    const counts = new Map<string, number>();
    for (const j of jobs) {
      counts.set(j.company_name, (counts.get(j.company_name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
  }, [jobs]);

  const stats = useMemo(() => {
    const dayAgo = Date.now() - 86400000;
    const newToday = jobsWithScore.filter(
      (j) => j.posted_at && new Date(j.posted_at).getTime() >= dayAgo
    ).length;
    const matched = jobsWithScore.filter((j) => j.matchScore > 0).length;
    const remote = jobsWithScore.filter((j) => j.remote).length;
    const total = jobsWithScore.length;
    const remotePct = total > 0 ? Math.round((remote / total) * 100) : 0;
    return { newToday, matched, remote, remotePct };
  }, [jobsWithScore]);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div
        className="flex items-start justify-between flex-wrap gap-4"
        style={{ marginBottom: 24 }}
      >
        <div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 6,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            PM jobs,{" "}
            <span
              style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 500,
                color: "var(--forest, #0A7558)",
              }}
            >
              fresh
            </span>{" "}
            from the last 24 hours.
          </h1>
          <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 14, color: "var(--text-muted)" }}>
            <span>Posted since yesterday · matched to your profile</span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(10,117,88,0.12)",
                color: "var(--forest, #0A7558)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--forest, #0A7558)",
                }}
              />
              live
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: 24,
        }}
      >
        <StatCard
          label="NEW TODAY"
          value={stats.newToday}
          subtext="posted in the last 24h"
          accent="var(--forest, #0A7558)"
        />
        <StatCard
          label="MATCHED TO YOU"
          value={stats.matched}
          subtext="based on your stack · skills"
          accent="var(--purple, #7C5CFF)"
        />
        <StatCard
          label="REMOTE-FRIENDLY"
          value={stats.remote}
          subtext={`${stats.remotePct}% of today's roles`}
          accent="#E0A800"
        />
      </div>

      {/* Search + role filters row */}
      <div
        className="flex items-center gap-3 flex-wrap"
        style={{ marginBottom: 16 }}
      >
        <div
          className="flex items-center gap-2"
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 16px",
            background: "var(--surface-card)",
            border: "0.5px solid var(--border-light)",
            borderRadius: 10,
          }}
        >
          <Search style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search title, company, stack…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--text-primary)",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              border: "0.5px solid var(--border-light)",
              padding: "1px 6px",
              borderRadius: 4,
            }}
          >
            ⌘K
          </span>
        </div>

        <div
          className="flex items-center"
          style={{
            background: "var(--surface-card)",
            border: "0.5px solid var(--border-light)",
            borderRadius: 999,
            padding: 4,
          }}
        >
          {ROLE_FILTERS.map((f) => {
            const active = roleFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "var(--text-primary)" : "transparent",
                  color: active ? "var(--white)" : "var(--text-secondary)",
                  transition: "all 0.1s",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {filtered.length} role{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Company filter chips */}
      {topCompanies.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            Top companies &mdash; filter by employer
          </p>
          <div className="flex flex-wrap gap-1.5">
            {topCompanies.map((name) => {
              const active = companyFilter.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleCompany(name)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    border: `1px solid ${active ? "var(--teal)" : "var(--border-light)"}`,
                    cursor: "pointer",
                    background: active ? "var(--teal-bg)" : "transparent",
                    color: active ? "var(--teal)" : "var(--text-secondary)",
                    transition: "all 0.1s",
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Jobs list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 90,
                borderRadius: 12,
                background: "var(--surface-card)",
                border: "0.5px solid var(--border-light)",
                opacity: 0.6,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3"
          style={{ padding: "60px 0", color: "var(--text-muted)" }}
        >
          <Briefcase style={{ width: 32, height: 32, opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>
            {jobs.length === 0
              ? "No jobs loaded yet — the cron runs daily at noon UTC."
              : "No roles match your filters."}
          </p>
        </div>
      ) : isAuthed ? (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} userStack={userStack} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {filtered.slice(0, ANON_VISIBLE_LIMIT).map((job) => (
              <JobCard key={job.id} job={job} userStack={userStack} />
            ))}
          </div>

          {filtered.length > ANON_VISIBLE_LIMIT && (
            <div style={{ position: "relative", marginTop: 12 }}>
              <div
                aria-hidden
                style={{
                  filter: "blur(6px)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                className="flex flex-col gap-3"
              >
                {filtered
                  .slice(
                    ANON_VISIBLE_LIMIT,
                    ANON_VISIBLE_LIMIT + ANON_BLURRED_PREVIEW
                  )
                  .map((job) => (
                    <JobCard key={job.id} job={job} userStack={userStack} />
                  ))}
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0) 0%, var(--page-bg, #fff) 70%)",
                }}
              >
                <div
                  style={{
                    background: "var(--surface-card)",
                    border: "0.5px solid var(--border-light)",
                    borderRadius: 12,
                    padding: "20px 24px",
                    textAlign: "center",
                    maxWidth: 360,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                >
                  <Lock
                    style={{
                      width: 22,
                      height: 22,
                      color: "var(--text-muted)",
                      margin: "0 auto 8px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                    }}
                  >
                    {filtered.length - ANON_VISIBLE_LIMIT} more roles waiting
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginBottom: 14,
                    }}
                  >
                    Sign in with GitHub to see all PM jobs and match scores.
                  </p>
                  <button
                    onClick={handleSignIn}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "var(--text-primary)",
                      color: "var(--white)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      style={{ width: 14, height: 14 }}
                    >
                      <path d="M8 1C4.13 1 1 4.13 1 8c0 3.1 2 5.7 4.8 6.6.35.07.48-.15.48-.34v-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.82-.78-1.04-.78-1.04-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.24-.76.44-.94-1.56-.18-3.2-.78-3.2-3.48 0-.77.28-1.4.72-1.89-.07-.18-.31-.9.07-1.87 0 0 .59-.19 1.92.72a6.6 6.6 0 013.5 0c1.33-.91 1.92-.72 1.92-.72.38.97.14 1.69.07 1.87.45.49.72 1.12.72 1.89 0 2.71-1.65 3.3-3.22 3.48.25.22.48.65.48 1.31v1.94c0 .19.13.41.48.34C13 13.7 15 11.1 15 8c0-3.87-3.13-7-7-7z" />
                    </svg>
                    Sign in with GitHub
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
