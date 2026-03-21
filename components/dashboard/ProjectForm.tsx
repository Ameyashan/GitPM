"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ImagePlus,
  X,
  Trash2,
  Sparkles,
  Check,
  Star,
  Search,
  GitBranch,
} from "lucide-react";
import Image from "next/image";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import {
  BUILD_TOOLS,
  HOSTING_PLATFORMS,
  CATEGORY_TAGS,
} from "@/lib/validators/project";
import type { Project, Screenshot } from "@/types/project";
import type { GitHubRepo } from "@/types/github";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  slug: string;
  description: string;
  live_url: string;
  category_tags: string[];
  build_tools: string[];
  hosting_platform: string;
  problem_statement: string;
  target_user: string;
  key_decisions: string;
  learnings: string;
  metrics_text: string;
  demo_video_url: string;
  github_repo_url: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Project>;
  username?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Shared style tokens ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "0.5px solid var(--border-light)",
  borderRadius: "7px",
  fontSize: "13px",
  background: "var(--surface-light)",
  color: "var(--text-primary)",
  outline: "none",
  marginBottom: "12px",
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  fontWeight: 500,
  marginBottom: "6px",
  display: "block",
};

const sectionHeadStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
};

const sectionBodyStyle: React.CSSProperties = { paddingLeft: "32px" };

function sectionNum(bg: string, color: string): React.CSSProperties {
  return {
    width: "22px",
    height: "22px",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 500,
    fontFamily: "var(--font-mono)",
    flexShrink: 0,
    background: bg,
    color,
  };
}

// ── ChipSelector ──────────────────────────────────────────────────────────────

function ChipSelector({
  options,
  selected,
  onToggle,
  variant,
  single,
}: {
  options: readonly string[];
  selected: string | string[];
  onToggle: (val: string) => void;
  variant: "purple" | "teal" | "neutral";
  single?: boolean;
}) {
  const isSelected = (v: string) =>
    single
      ? selected === v
      : Array.isArray(selected) && selected.includes(v);

  const colors = {
    purple: {
      on: { background: "var(--purple-bg)", color: "var(--purple)", border: "0.5px solid var(--purple)" },
      off: { background: "var(--surface-light)", color: "var(--text-secondary)", border: "0.5px solid var(--border-light)" },
    },
    teal: {
      on: { background: "var(--teal-bg)", color: "var(--teal)", border: "0.5px solid var(--teal)" },
      off: { background: "var(--surface-light)", color: "var(--text-secondary)", border: "0.5px solid var(--border-light)" },
    },
    neutral: {
      on: { background: "var(--surface-light)", color: "var(--text-primary)", border: "0.5px solid var(--border)" },
      off: { background: "transparent", color: "var(--text-muted)", border: "0.5px solid var(--border-light)" },
    },
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            textTransform: "capitalize",
            fontFamily: "var(--font-body)",
            transition: "all 0.1s",
            ...(isSelected(opt) ? colors[variant].on : colors[variant].off),
          }}
        >
          {opt.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

// ── FieldError ────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: "11px", color: "#E24B4A", marginTop: "-8px", marginBottom: "8px" }}>
      {msg}
    </p>
  );
}

// ── RepoCombobox ──────────────────────────────────────────────────────────────

function RepoCombobox({
  repos,
  loading,
  value,
  onChange,
}: {
  repos: GitHubRepo[];
  loading: boolean;
  value: string;
  onChange: (url: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRepo = repos.find((r) => r.html_url === value) ?? null;
  const filtered = repos.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.full_name.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (manualMode) {
    return (
      <div>
        <input
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://github.com/you/repo"
          type="url"
        />
        <button
          type="button"
          onClick={() => setManualMode(false)}
          style={{ fontSize: 12, color: "var(--purple)", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: -8, marginBottom: 12 }}
        >
          ← Back to repo picker
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8 }}>
        <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite", color: "var(--text-muted)" }} />
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading your repositories…</span>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div>
        <div style={{ ...inputStyle, color: "var(--text-muted)" }}>No repositories found</div>
        <button
          type="button"
          onClick={() => setManualMode(true)}
          style={{ fontSize: 12, color: "var(--purple)", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: -8, marginBottom: 12 }}
        >
          Enter URL manually →
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", marginBottom: 12 }} ref={containerRef}>
      {selectedRepo && !open ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            borderRadius: 7,
            border: "0.5px solid var(--teal)",
            background: "var(--teal-bg)",
            padding: "10px 12px",
            marginBottom: 6,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedRepo.full_name}
            </p>
            {selectedRepo.description && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedRepo.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {selectedRepo.language && (
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--teal)" }}>{selectedRepo.language}</span>
              )}
              <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                <Star style={{ width: 10, height: 10 }} />
                {selectedRepo.stargazers_count}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { onChange(""); setSearch(""); setOpen(true); }}
            aria-label="Clear selection"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, flexShrink: 0 }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search your repositories…"
            style={{ ...inputStyle, paddingLeft: 32, marginBottom: 0 }}
          />
        </div>
      )}

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, borderRadius: 7, border: "0.5px solid var(--border-light)", background: "var(--surface-card)", boxShadow: "0 8px 24px rgba(13,27,42,0.12)", maxHeight: 220, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
              No repos match &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { onChange(r.html_url); setSearch(""); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", background: "none", border: "none", borderBottom: "0.5px solid var(--border-light)", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.full_name}</p>
                  {r.description && (
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {r.language && <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{r.language}</span>}
                  <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                    <Star style={{ width: 10, height: 10 }} />
                    {r.stargazers_count}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setManualMode(true)}
        style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 6, display: "block" }}
      >
        Don&apos;t see your repo? Enter URL manually →
      </button>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export function ProjectForm({ mode, initialData, username }: ProjectFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [lovableRepos, setLovableRepos] = useState<GitHubRepo[]>([]);

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<Screenshot[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    live_url: initialData?.live_url ?? "",
    category_tags: initialData?.category_tags ?? [],
    build_tools: initialData?.build_tools ?? [],
    hosting_platform: initialData?.hosting_platform ?? "",
    problem_statement: initialData?.problem_statement ?? "",
    target_user: initialData?.target_user ?? "",
    key_decisions: initialData?.key_decisions ?? "",
    learnings: initialData?.learnings ?? "",
    metrics_text: initialData?.metrics_text ?? "",
    demo_video_url: initialData?.demo_video_url ?? "",
    github_repo_url: initialData?.github_repo_url ?? "",
  });

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayItem = useCallback((key: "build_tools" | "category_tags", item: string) => {
    setFormData((prev) => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(item) ? arr.filter((t) => t !== item) : [...arr, item] };
    });
  }, []);

  // Fetch GitHub repos on mount
  useEffect(() => {
    setLoadingRepos(true);
    Promise.allSettled([
      fetch("/api/github/repos").then((r) => r.json()),
      fetch("/api/github/detect-lovable").then((r) => r.json()),
    ])
      .then(([reposResult, lovableResult]) => {
        if (reposResult.status === "fulfilled") {
          const json = reposResult.value as { data?: GitHubRepo[] };
          if (json.data) setRepos(json.data);
        }
        if (lovableResult.status === "fulfilled") {
          const json = lovableResult.value as { data?: GitHubRepo[] };
          if (json.data) setLovableRepos(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRepos(false));
  }, []);

  // Fetch existing screenshots in edit mode
  useEffect(() => {
    if (mode !== "edit" || !initialData?.id) return;
    fetch(`/api/projects/${initialData.id}/screenshots`)
      .then((r) => r.json())
      .then((json: { data?: Screenshot[] }) => {
        if (json.data) setExistingScreenshots(json.data);
      })
      .catch(() => {});
  }, [mode, initialData?.id]);

  function handleNameChange(value: string) {
    set("name", value);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      set("slug", generateSlug(value));
    }
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!formData.name.trim()) e.name = "Project name is required";
    else if (formData.name.length > 80) e.name = "Name too long";
    if (!formData.slug.trim()) e.slug = "Slug is required";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) e.slug = "Lowercase, numbers, and hyphens only";
    if (!formData.live_url.trim()) e.live_url = "Live URL is required";
    else if (!formData.live_url.startsWith("http://") && !formData.live_url.startsWith("https://")) e.live_url = "Must start with http:// or https://";
    if (formData.description.length > 300) e.description = "Max 300 characters";
    if (formData.build_tools.length === 0) e.build_tools = "Select at least one build tool";
    if (!formData.problem_statement.trim()) e.problem_statement = "Problem statement is required";
    else if (formData.problem_statement.trim().length < 10) e.problem_statement = "Must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector("[data-field-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      live_url: formData.live_url,
      category_tags: formData.category_tags,
      build_tools: formData.build_tools,
      hosting_platform: formData.hosting_platform || null,
      problem_statement: formData.problem_statement,
      target_user: formData.target_user || null,
      key_decisions: formData.key_decisions || null,
      learnings: formData.learnings || null,
      metrics_text: formData.metrics_text || null,
      demo_video_url: formData.demo_video_url || null,
      github_repo_url: formData.github_repo_url || null,
    };

    try {
      const url = mode === "create" ? "/api/projects" : `/api/projects/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = (await res.json()) as { data?: { id: string }; error?: string };

      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong");
        return;
      }

      const projectId = json.data?.id;

      if (projectId && pendingFiles.length > 0) {
        setUploadingScreenshots(true);
        let anyFailed = false;
        for (const file of pendingFiles) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("project_id", projectId);
          try {
            const r = await fetch("/api/upload", { method: "POST", body: fd });
            if (!r.ok) anyFailed = true;
          } catch { anyFailed = true; }
        }
        setUploadingScreenshots(false);
        if (anyFailed) toast.error("Some screenshots failed to upload. Edit the project to try again.");
      }

      if (projectId && formData.github_repo_url) {
        setSubmitting(false);
        setEnriching(true);
        try { await fetch(`/api/projects/${projectId}/enrich`, { method: "POST" }); } catch { /* non-fatal */ }
        setEnriching(false);
      }

      toast.success(mode === "create" ? "Project created!" : "Project updated!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setEnriching(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const totalCount = existingScreenshots.length + pendingFiles.length;
    const allowed = files.slice(0, 6 - totalCount);

    if (mode === "edit" && initialData?.id) {
      for (let i = 0; i < allowed.length; i++) {
        setUploadingIndex(i);
        const fd = new FormData();
        fd.append("file", allowed[i]);
        fd.append("project_id", initialData.id);
        try {
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const json = (await res.json()) as { data?: Screenshot; error?: string };
          if (res.ok && json.data) setExistingScreenshots((prev) => [...prev, json.data!]);
          else toast.error(json.error ?? "Upload failed");
        } catch { toast.error("Upload failed. Please try again."); }
      }
      setUploadingIndex(null);
    } else {
      setPendingFiles((prev) => [...prev, ...allowed]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDeleteExisting(screenshotId: string) {
    setDeletingId(screenshotId);
    try {
      const res = await fetch(`/api/screenshots/${screenshotId}`, { method: "DELETE" });
      if (res.ok) setExistingScreenshots((prev) => prev.filter((s) => s.id !== screenshotId));
      else toast.error("Failed to delete screenshot");
    } catch { toast.error("Failed to delete screenshot"); }
    finally { setDeletingId(null); }
  }

  const isLoading = submitting || enriching || uploadingScreenshots;
  const loadingLabel = uploadingScreenshots ? "Uploading…" : enriching ? "Fetching GitHub data…" : "Saving…";

  const totalScreenshots = existingScreenshots.length + pendingFiles.length;
  const canAddMore = totalScreenshots < 6;

  const videoUrl = formData.demo_video_url || null;
  const isValidVideo = videoUrl && (videoUrl.includes("loom.com") || videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));

  return (
    <div>
      {/* ── 1: Basics ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--purple-bg)", "var(--purple)")}>1</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Basics</span>
        </div>
        <div style={sectionBodyStyle}>
          <label style={labelStyle}>
            Project name <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input
            style={inputStyle}
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="My Awesome Project"
          />
          <FieldError msg={errors.name} />

          <label style={labelStyle}>URL slug</label>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ padding: "9px 10px", background: "var(--surface-light)", border: "0.5px solid var(--border-light)", borderRight: "none", borderRadius: "7px 0 0 7px", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
              {username ? `gitpm.dev/${username}/` : "gitpm.dev/you/"}
            </span>
            <input
              style={{ ...inputStyle, borderRadius: "0 7px 7px 0", marginBottom: 0, flex: 1, fontFamily: "var(--font-mono)" }}
              value={formData.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="my-awesome-project"
            />
          </div>
          <FieldError msg={errors.slug} />

          <label style={labelStyle}>
            Live URL <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input
            style={inputStyle}
            value={formData.live_url}
            onChange={(e) => set("live_url", e.target.value)}
            placeholder="https://myproject.vercel.app"
            type="url"
          />
          <FieldError msg={errors.live_url} />

          <label style={labelStyle}>
            Description{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 56, lineHeight: 1.5 }}
            value={formData.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A one-line summary of what this project does."
            rows={2}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -10, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {formData.description.length}/300
            </span>
          </div>
          <FieldError msg={errors.description} />

          <label style={labelStyle}>
            Categories{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
          </label>
          <ChipSelector
            options={CATEGORY_TAGS}
            selected={formData.category_tags}
            onToggle={(v) => toggleArrayItem("category_tags", v)}
            variant="neutral"
          />
        </div>
      </div>

      {/* ── 2: Build details ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--teal-bg)", "var(--teal)")}>2</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Build details</span>
        </div>
        <div style={sectionBodyStyle}>
          {/* Lovable detection */}
          {lovableRepos.length > 0 && (
            <div style={{ borderRadius: 8, border: "0.5px solid var(--purple)", background: "var(--purple-bg)", padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Sparkles style={{ width: 14, height: 14, color: "var(--purple)" }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                  Detected {lovableRepos.length} Lovable project{lovableRepos.length > 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {lovableRepos.map((repo) => {
                  const isSelected = formData.github_repo_url === repo.html_url;
                  return (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        set("github_repo_url", repo.html_url);
                        if (!formData.build_tools.includes("lovable")) toggleArrayItem("build_tools", "lovable");
                        set("hosting_platform", "lovable");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: isSelected ? "0.5px solid var(--purple)" : "0.5px solid var(--border-light)",
                        background: isSelected ? "rgba(108,92,231,0.08)" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repo.full_name}</p>
                        {repo.homepage && (
                          <p style={{ fontSize: 11, color: "var(--purple)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repo.homepage}</p>
                        )}
                      </div>
                      {isSelected && <Check style={{ width: 14, height: 14, color: "var(--purple)", flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label style={labelStyle}>
            Build tools <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <ChipSelector
            options={BUILD_TOOLS}
            selected={formData.build_tools}
            onToggle={(v) => toggleArrayItem("build_tools", v)}
            variant="purple"
          />
          <FieldError msg={errors.build_tools} />

          <label style={labelStyle}>Hosting platform</label>
          <ChipSelector
            options={HOSTING_PLATFORMS}
            selected={formData.hosting_platform}
            onToggle={(v) => set("hosting_platform", formData.hosting_platform === v ? "" : v)}
            variant="teal"
            single
          />

          <label style={labelStyle}>
            GitHub repository{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
          </label>
          <RepoCombobox
            repos={repos}
            loading={loadingRepos}
            value={formData.github_repo_url}
            onChange={(url) => set("github_repo_url", url)}
          />
          {formData.github_repo_url && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: -6, marginBottom: 12 }}>
              <GitBranch style={{ width: 12, height: 12, color: "var(--teal)" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Commit count and tech stack will be fetched when you save.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3: Product context ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--forest-bg)", "var(--forest)")}>3</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Product context</span>
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: "rgba(217,118,6,0.1)", color: "#D97706", fontWeight: 500 }}>
            What sets you apart
          </span>
        </div>
        <div style={sectionBodyStyle}>
          <label style={labelStyle}>
            Problem statement <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontStyle: "italic", opacity: 0.7 }}>
            What problem does this solve? Who has this problem?
          </div>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 72, lineHeight: 1.5 }}
            value={formData.problem_statement}
            onChange={(e) => set("problem_statement", e.target.value)}
            placeholder="I noticed that PMs who build with AI tools had no way to showcase their work…"
            rows={3}
          />
          <FieldError msg={errors.problem_statement} />

          <label style={labelStyle}>
            Target users{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 56, lineHeight: 1.5 }}
            value={formData.target_user}
            onChange={(e) => set("target_user", e.target.value)}
            placeholder="Product managers at B2B SaaS companies…"
            rows={2}
          />

          <label style={labelStyle}>
            Key decisions{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 56, lineHeight: 1.5 }}
            value={formData.key_decisions}
            onChange={(e) => set("key_decisions", e.target.value)}
            placeholder="Chose Supabase over Firebase for its PostgreSQL foundation…"
            rows={2}
          />

          <label style={labelStyle}>
            Learnings{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 56, lineHeight: 1.5 }}
            value={formData.learnings}
            onChange={(e) => set("learnings", e.target.value)}
            placeholder="What surprised you? What would you do differently?"
            rows={2}
          />

          <label style={labelStyle}>
            Metrics & impact{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 44, lineHeight: 1.5, marginBottom: 0 }}
            value={formData.metrics_text}
            onChange={(e) => set("metrics_text", e.target.value)}
            placeholder="142 beta users in week 1, 4.8★ on Product Hunt…"
            rows={2}
          />
        </div>
      </div>

      {/* ── 4: Media ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--surface-light)", "var(--text-muted)")}>4</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Media</span>
        </div>
        <div style={sectionBodyStyle}>
          <label style={labelStyle}>
            Demo video{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(Loom or YouTube)</span>
          </label>
          <input
            style={inputStyle}
            value={formData.demo_video_url}
            onChange={(e) => set("demo_video_url", e.target.value)}
            placeholder="https://www.loom.com/share/… or https://youtu.be/…"
            type="url"
          />
          {isValidVideo && (
            <div style={{ marginTop: -6, marginBottom: 12, borderRadius: 8, overflow: "hidden", border: "0.5px solid var(--border-light)" }}>
              <VideoEmbed url={formData.demo_video_url} title="Video preview" />
            </div>
          )}

          <label style={labelStyle}>
            Screenshots{" "}
            <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(up to 6)</span>
          </label>

          {(existingScreenshots.length > 0 || pendingFiles.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
              {existingScreenshots.map((screenshot) => (
                <div key={screenshot.id} style={{ position: "relative", borderRadius: 6, overflow: "hidden", background: "var(--surface-light)", aspectRatio: "16/9" }}>
                  <Image src={screenshot.image_url} alt="Screenshot" fill className="object-cover" sizes="200px" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(screenshot.id)}
                    disabled={deletingId === screenshot.id}
                    aria-label="Delete screenshot"
                    style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(13,27,42,0.55)", opacity: 0, border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0"; }}
                  >
                    {deletingId === screenshot.id
                      ? <Loader2 style={{ width: 18, height: 18, color: "white" }} className="animate-spin" />
                      : <Trash2 style={{ width: 16, height: 16, color: "#f87171" }} />}
                  </button>
                </div>
              ))}
              {pendingFiles.map((file, i) => (
                <div key={i} style={{ position: "relative", borderRadius: 6, overflow: "hidden", background: "var(--surface-light)", aspectRatio: "16/9" }}>
                  <Image src={URL.createObjectURL(file)} alt={`Pending ${i + 1}`} fill className="object-cover" sizes="200px" />
                  {uploadingIndex === i ? (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(13,27,42,0.55)" }}>
                      <Loader2 style={{ width: 18, height: 18, color: "white" }} className="animate-spin" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove screenshot"
                      style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(13,27,42,0.55)", opacity: 0, border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0"; }}
                    >
                      <X style={{ width: 18, height: 18, color: "white" }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canAddMore && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={handleFileChange}
                id="edit-screenshot-upload"
              />
              <label
                htmlFor="edit-screenshot-upload"
                style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: "20px", textAlign: "center", cursor: "pointer", background: "var(--surface-light)", display: "block", transition: "border-color 0.15s" }}
              >
                <div style={{ color: "var(--text-muted)", marginBottom: 4, opacity: 0.4, display: "flex", justifyContent: "center" }}>
                  <ImagePlus style={{ width: 24, height: 24 }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Click to add screenshots</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, opacity: 0.6 }}>JPEG, PNG, WebP — max 5 MB</div>
              </label>
            </>
          )}
        </div>
      </div>

      {/* ── Submit ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--page-bg)",
          borderTop: "0.5px solid var(--border-light)",
          padding: "14px 0",
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            padding: "10px 28px",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--teal)",
            color: "white",
            opacity: isLoading ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {isLoading && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
          {isLoading ? loadingLabel : mode === "create" ? "✓ Publish project" : "✓ Save changes"}
        </button>
      </div>
    </div>
  );
}
