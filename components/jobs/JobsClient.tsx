"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Search, Briefcase, MapPin, ExternalLink } from "lucide-react";

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

const ROLE_FILTERS = ["All", "APM", "PM", "Senior PM", "Staff", "FDE"] as const;

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
}

export function JobsClient({ userStack }: JobsClientProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [stackFilter, setStackFilter] = useState<string[]>([]);

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
        if (stackFilter.length > 0) {
          const jobSet = new Set(j.stack_tags.map((t) => t.toLowerCase()));
          if (!stackFilter.some((f) => jobSet.has(f.toLowerCase()))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        const at = a.posted_at ? new Date(a.posted_at).getTime() : 0;
        const bt = b.posted_at ? new Date(b.posted_at).getTime() : 0;
        return bt - at;
      });
  }, [jobsWithScore, roleFilter, search, stackFilter]);

  function toggleStack(tag: string) {
    setStackFilter((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          PM Jobs
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Roles matched to your project stack — sorted by fit
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2"
        style={{
          padding: "10px 16px",
          background: "var(--surface-card)",
          border: "0.5px solid var(--border-light)",
          borderRadius: 10,
          marginBottom: 16,
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
      </div>

      {/* Role type filters */}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {ROLE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: roleFilter === f ? 600 : 400,
              border: "none",
              cursor: "pointer",
              background:
                roleFilter === f ? "var(--text-primary)" : "var(--surface-card)",
              color: roleFilter === f ? "var(--white)" : "var(--text-secondary)",
              transition: "all 0.1s",
            }}
          >
            {f}
          </button>
        ))}
        <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>
          {filtered.length} role{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* User stack chips */}
      {userStack.length > 0 && (
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
            Your stack — filter by what you've built
          </p>
          <div className="flex flex-wrap gap-1.5">
            {userStack.map((tag) => {
              const active = stackFilter.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleStack(tag)}
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
                  {tag}
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
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} userStack={userStack} />
          ))}
        </div>
      )}
    </div>
  );
}
