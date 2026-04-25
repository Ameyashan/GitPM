"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, GitCommit, BadgeCheck, Clock } from "lucide-react";
import type { ExploreProjectRow } from "@/lib/supabase/profile-queries";

type SortKey = "recent" | "commits";

interface Props {
  projects: ExploreProjectRow[];
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function BuilderAvatar({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  const [errored, setErrored] = useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (!url || errored) {
    return (
      <div
        className="flex items-center justify-center rounded-full text-white"
        style={{
          width: 24,
          height: 24,
          background: "linear-gradient(135deg, var(--purple), var(--teal))",
          fontSize: 10,
          fontWeight: 600,
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
      width={24}
      height={24}
      className="rounded-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}

function ProjectCard({ p }: { p: ExploreProjectRow }) {
  const updated = p.latest_deploy_at ?? p.updated_at;
  const builderName = p.builder.display_name?.trim() || p.builder.username;
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "0.5px solid var(--border-light)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        href={`/${p.builder.username}/${p.slug}`}
        style={{
          aspectRatio: "16/9",
          background: "var(--surface-light, #f3f4f6)",
          display: "block",
          position: "relative",
        }}
      >
        {p.thumbnail_url ? (
          <Image
            src={p.thumbnail_url}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, var(--purple), var(--teal))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--white)",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {p.name}
          </div>
        )}
      </Link>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="flex items-center gap-2">
          <Link
            href={`/${p.builder.username}/${p.slug}`}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            {p.name}
          </Link>
          {p.is_verified && (
            <BadgeCheck
              style={{ width: 14, height: 14, color: "var(--teal)" }}
              aria-label="Verified"
            />
          )}
        </div>

        {p.description && (
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {p.description}
          </p>
        )}

        {p.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.tech_stack.slice(0, 4).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  padding: "1px 8px",
                  borderRadius: 999,
                  background: "var(--surface-light, #f1f5f4)",
                  color: "var(--text-muted)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div
          className="flex items-center justify-between"
          style={{
            marginTop: "auto",
            paddingTop: 10,
            borderTop: "0.5px solid var(--border-light)",
          }}
        >
          <Link
            href={`/${p.builder.username}`}
            className="flex items-center gap-2"
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            <BuilderAvatar
              url={p.builder.avatar_url}
              name={builderName}
            />
            <span style={{ fontWeight: 500 }}>{builderName}</span>
          </Link>

          <div
            className="flex items-center gap-3"
            style={{ fontSize: 11, color: "var(--text-muted)" }}
          >
            {typeof p.commit_count === "number" && p.commit_count > 0 && (
              <span className="flex items-center gap-1">
                <GitCommit style={{ width: 11, height: 11 }} />
                {p.commit_count}
              </span>
            )}
            {updated && (
              <span className="flex items-center gap-1">
                <Clock style={{ width: 11, height: 11 }} />
                {timeAgo(updated)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExploreProjectsClient({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? projects.filter((p) => {
          const u = p.builder.username.toLowerCase();
          const d = p.builder.display_name?.toLowerCase() ?? "";
          return u.includes(q) || d.includes(q);
        })
      : projects;

    list = [...list].sort((a, b) => {
      if (sort === "commits") {
        return (b.commit_count ?? 0) - (a.commit_count ?? 0);
      }
      const at = new Date(a.latest_deploy_at ?? a.updated_at).getTime();
      const bt = new Date(b.latest_deploy_at ?? b.updated_at).getTime();
      return bt - at;
    });

    return list;
  }, [projects, search, sort]);

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "32px 24px",
        minHeight: "calc(100vh - 52px)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Explore Projects
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Every shipped project on GitPM — sorted by what&apos;s freshest.
        </p>
      </div>

      <div
        className="flex flex-wrap items-center gap-3"
        style={{ marginBottom: 24 }}
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
          <Search
            style={{ width: 16, height: 16, color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search by builder username or name…"
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

        <div className="flex items-center gap-1">
          {([
            { k: "recent" as const, label: "Recently updated" },
            { k: "commits" as const, label: "Most commits" },
          ]).map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: sort === k ? 600 : 400,
                border: "0.5px solid var(--border-light)",
                cursor: "pointer",
                background:
                  sort === k ? "var(--text-primary)" : "var(--surface-card)",
                color:
                  sort === k ? "var(--white)" : "var(--text-secondary)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <span
          style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}
        >
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          No projects match &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
