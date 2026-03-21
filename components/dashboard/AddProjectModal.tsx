"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Check,
  Loader2,
  Triangle,
  Sparkles,
  Plus,
  ImagePlus,
  ExternalLink,
  GitBranch,
  TriangleAlert,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import {
  BUILD_TOOLS,
  HOSTING_PLATFORMS,
  CATEGORY_TAGS,
} from "@/lib/validators/project";
import type { VercelProjectSummary } from "@/app/api/vercel/projects/route";
import type { LovableProjectSummary } from "@/app/api/github/lovable-projects/route";
import { VercelConnectModal } from "@/components/dashboard/VercelConnectModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 1 | 2 | 3;
type Source = "vercel" | "lovable" | "manual" | null;

interface ModalFormData {
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
  demo_video_url: string;
  github_repo_url: string;
}

interface P2Selection {
  prefill: Partial<ModalFormData>;
  autofills: string[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

export interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  vercelConnected: boolean;
  vercelUsername?: string | null;
  githubUsername?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PHASE_LABELS: Record<Phase, string> = {
  1: "Choose a source",
  2: "Select a project",
  3: "Fill in details",
};

const PHASE_PCT: Record<Phase, number> = { 1: 33, 2: 66, 3: 100 };

const EMPTY_FORM: ModalFormData = {
  name: "",
  slug: "",
  description: "",
  live_url: "",
  category_tags: [],
  build_tools: [],
  hosting_platform: "",
  problem_statement: "",
  target_user: "",
  key_decisions: "",
  learnings: "",
  demo_video_url: "",
  github_repo_url: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: "11px", color: "#E24B4A", marginTop: "-8px", marginBottom: "8px" }}>
      {msg}
    </p>
  );
}

function AutofilledBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontSize: "10px",
        color: "var(--teal)",
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        padding: "2px 7px",
        borderRadius: "3px",
        background: "var(--teal-bg)",
      }}
    >
      <Check style={{ width: "10px", height: "10px" }} />
      auto-filled
    </span>
  );
}

function PreviewChip({ filled, children }: { filled: boolean; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "10px",
        padding: "3px 7px",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        ...(filled
          ? { background: "var(--teal-bg)", color: "var(--teal)" }
          : {
              background: "var(--surface-light)",
              color: "var(--text-muted)",
              border: "0.5px dashed var(--border)",
            }),
      }}
    >
      {filled && <Check style={{ width: "10px", height: "10px" }} />}
      {children}
    </span>
  );
}

// Input styles
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--white)",
  border: "0.5px solid var(--border-light)",
  borderRadius: "7px",
  fontSize: "13px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  outline: "none",
  marginBottom: "12px",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const autofillInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: "linear-gradient(135deg, rgba(10,117,88,0.03), rgba(10,117,88,0.015))",
  borderColor: "var(--teal)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: "5px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap" as const,
};

// ─── Chip selector ─────────────────────────────────────────────────────────────

function ChipSelector({
  options,
  selected,
  onToggle,
  variant = "purple",
}: {
  options: readonly string[];
  selected: string | string[];
  onToggle: (val: string) => void;
  variant?: "purple" | "teal";
}) {
  const isSelected = (opt: string) =>
    Array.isArray(selected) ? selected.includes(opt) : selected === opt;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
      {options.map((opt) => {
        const sel = isSelected(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            style={{
              padding: "5px 12px",
              borderRadius: "5px",
              border: sel
                ? variant === "purple"
                  ? "0.5px solid var(--purple)"
                  : "0.5px solid var(--teal)"
                : "0.5px solid var(--border-light)",
              fontSize: "11px",
              color: sel ? "var(--white)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.12s",
              background: sel
                ? variant === "purple"
                  ? "var(--purple)"
                  : "var(--teal)"
                : "var(--white)",
              fontFamily: "var(--font-body)",
              textTransform: "capitalize",
            }}
          >
            {opt.replace(/_/g, " ")}
          </button>
        );
      })}
    </div>
  );
}

// ─── Radio button ─────────────────────────────────────────────────────────────

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        border: selected ? "none" : "1.5px solid var(--border)",
        background: selected ? "var(--purple)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {selected && (
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "white" }} />
      )}
    </div>
  );
}

// ─── Phase 2: Vercel ──────────────────────────────────────────────────────────

function VercelImportPhase({
  vercelUsername,
  onSelectionChange,
}: {
  vercelUsername?: string | null;
  onSelectionChange: (selection: P2Selection | null) => void;
}) {
  const [projects, setProjects] = useState<VercelProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    setErrorCode(null);
    fetch("/api/vercel/projects")
      .then((r) => r.json())
      .then((json: { data?: VercelProjectSummary[]; error?: string; code?: string }) => {
        if (json.data) {
          setProjects(json.data);
        } else {
          setErrorMsg(json.error ?? "Failed to load Vercel projects.");
          setErrorCode(json.code ?? null);
        }
      })
      .catch(() => setErrorMsg("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [fetchTrigger]);

  const handleSelect = (project: VercelProjectSummary) => {
    if (project.alreadyImported) return;
    const newId = selectedId === project.id ? null : project.id;
    setSelectedId(newId);
    if (!newId) {
      onSelectionChange(null);
      return;
    }
    const autofills: string[] = ["live_url", "hosting_platform", "name"];
    if (project.githubRepoUrl) autofills.push("github_repo_url");
    onSelectionChange({
      prefill: {
        name: project.name,
        slug: generateSlug(project.name),
        live_url: project.liveUrl ?? "",
        github_repo_url: project.githubRepoUrl ?? "",
        hosting_platform: "vercel",
      },
      autofills,
    });
  };

  const available = projects.filter((p) => !p.alreadyImported);
  const imported = projects.filter((p) => p.alreadyImported);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 28px", gap: "10px" }}>
        <Loader2 style={{ width: "20px", height: "20px", color: "var(--text-muted)" }} className="animate-spin" />
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading your Vercel projects…</p>
      </div>
    );
  }

  if (errorCode === "vercel_not_connected") {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 28px", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "var(--surface-light)",
              border: "0.5px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Triangle style={{ width: "20px", height: "20px", fill: "var(--text-muted)", color: "var(--text-muted)" }} />
          </div>
          <div style={{ textAlign: "center", maxWidth: "260px" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
              Vercel isn&apos;t connected yet
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Connect your account to import projects with auto-verification.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConnectModalOpen(true)}
            style={{
              fontSize: "13px",
              padding: "8px 18px",
              borderRadius: "7px",
              border: "none",
              background: "var(--navy)",
              color: "#fff",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Connect Vercel →
          </button>
        </div>
        <VercelConnectModal
          open={connectModalOpen}
          onOpenChange={setConnectModalOpen}
          onSuccess={() => {
            setConnectModalOpen(false);
            setFetchTrigger((n) => n + 1);
          }}
        />
      </>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 28px", gap: "10px" }}>
        <TriangleAlert style={{ width: "20px", height: "20px", color: "#E24B4A" }} />
        <p style={{ fontSize: "13px", color: "#E24B4A" }}>{errorMsg}</p>
      </div>
    );
  }

  const renderCard = (project: VercelProjectSummary, disabled = false) => {
    const isSelected = selectedId === project.id && !disabled;
    return (
      <div
        key={project.id}
        onClick={() => !disabled && handleSelect(project)}
        style={{
          border: isSelected ? "1.5px solid var(--purple)" : "0.5px solid var(--border-light)",
          borderRadius: "10px",
          marginBottom: "8px",
          overflow: "hidden",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.45 : 1,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isSelected)
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected)
            (e.currentTarget as HTMLDivElement).style.borderColor = disabled ? "var(--border-light)" : "var(--border-light)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: disabled ? "var(--surface-light)" : "var(--navy)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Triangle
              style={{
                width: "16px",
                height: "16px",
                fill: disabled ? "var(--text-muted)" : "white",
                color: disabled ? "var(--text-muted)" : "white",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {project.name}
              {disabled && (
                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "var(--teal-bg)", color: "var(--teal)", fontWeight: 500 }}>
                  Already in GitPM
                </span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {project.liveUrl && (
                <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <ExternalLink style={{ width: "10px", height: "10px", opacity: 0.4, flexShrink: 0 }} />
                  {project.liveUrl.replace("https://", "")}
                </span>
              )}
              {project.githubRepoUrl && (
                <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <GitBranch style={{ width: "10px", height: "10px", opacity: 0.4, flexShrink: 0 }} />
                  {project.githubRepoUrl.replace("https://github.com/", "")}
                </span>
              )}
            </div>
          </div>

          {!disabled && <RadioDot selected={isSelected} />}
        </div>

        {/* Expanded preview */}
        {isSelected && (
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
              We&apos;ll auto-fill:
            </div>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              <PreviewChip filled>URL &amp; hosting</PreviewChip>
              {project.githubRepoUrl && <PreviewChip filled>GitHub repo</PreviewChip>}
              <PreviewChip filled>Verified badge</PreviewChip>
              <PreviewChip filled={false}>You add: PM context</PreviewChip>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "0 28px 4px" }}>
      {/* Sub-header */}
      <div style={{ marginBottom: "12px" }}>
        {vercelUsername && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
            Connected as <strong style={{ color: "var(--text-primary)" }}>{vercelUsername}</strong>
          </div>
        )}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
          <span style={{ color: "var(--teal)", fontWeight: 500 }}>{available.length}</span> AVAILABLE TO IMPORT
        </div>
      </div>

      {available.length === 0 && (
        <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
          All your Vercel projects are already in GitPM.
        </p>
      )}

      {available.map((p) => renderCard(p, false))}

      {imported.length > 0 && (
        <>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", marginTop: "8px" }}>
            {imported.length} already in GitPM
          </div>
          {imported.map((p) => renderCard(p, true))}
        </>
      )}

      {/* Bottom padding */}
      <div style={{ height: "20px" }} />
    </div>
  );
}

// ─── Phase 2: Lovable ─────────────────────────────────────────────────────────

function LovableImportPhase({
  githubUsername,
  onSelectionChange,
}: {
  githubUsername?: string | null;
  onSelectionChange: (selection: P2Selection | null) => void;
}) {
  const [projects, setProjects] = useState<LovableProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/github/lovable-projects")
      .then((r) => r.json())
      .then((json: { data?: LovableProjectSummary[]; error?: string }) => {
        if (json.data) setProjects(json.data);
        else setError(json.error ?? "Failed to load projects.");
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (project: LovableProjectSummary) => {
    if (project.alreadyImported) return;
    const newId = selectedId === project.id ? null : project.id;
    setSelectedId(newId);
    if (!newId) {
      onSelectionChange(null);
      return;
    }
    const autofills: string[] = ["github_repo_url", "hosting_platform", "build_tools", "name"];
    if (project.liveUrl) autofills.push("live_url");
    onSelectionChange({
      prefill: {
        name: project.name,
        slug: generateSlug(project.name),
        live_url: project.liveUrl ?? "",
        github_repo_url: project.githubRepoUrl,
        hosting_platform: "lovable",
        build_tools: ["lovable"],
      },
      autofills,
    });
  };

  const detected = projects.filter((p) => p.lovableDetected && !p.alreadyImported);
  const others = projects.filter((p) => !p.lovableDetected && !p.alreadyImported);
  const alreadyImported = projects.filter((p) => p.alreadyImported);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 28px", gap: "10px" }}>
        <Loader2 style={{ width: "20px", height: "20px", color: "var(--text-muted)" }} className="animate-spin" />
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Scanning your GitHub repos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 28px", gap: "10px" }}>
        <TriangleAlert style={{ width: "20px", height: "20px", color: "#E24B4A" }} />
        <p style={{ fontSize: "13px", color: "#E24B4A" }}>{error}</p>
      </div>
    );
  }

  const renderCard = (project: LovableProjectSummary, highlight = false, disabled = false) => {
    const isSelected = selectedId === project.id && !disabled;
    return (
      <div
        key={project.id}
        onClick={() => !disabled && handleSelect(project)}
        style={{
          border: isSelected
            ? "1.5px solid var(--purple)"
            : highlight
            ? "0.5px solid var(--purple)"
            : "0.5px solid var(--border-light)",
          borderRadius: "10px",
          marginBottom: "8px",
          overflow: "hidden",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.45 : 1,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isSelected)
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isSelected)
            (e.currentTarget as HTMLDivElement).style.borderColor =
              highlight ? "var(--purple)" : "var(--border-light)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: disabled
                ? "var(--surface-light)"
                : highlight
                ? "var(--purple)"
                : "var(--surface-light)",
              border: (!highlight && !disabled) ? "0.5px solid var(--border-light)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles
              style={{
                width: "16px",
                height: "16px",
                color: highlight && !disabled ? "white" : "var(--text-muted)",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {project.name}
              {project.isPrivate && !disabled && (
                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "var(--surface-light)", color: "var(--text-muted)", border: "0.5px solid var(--border-light)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Lock style={{ width: "9px", height: "9px" }} /> Private
                </span>
              )}
              {disabled && (
                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "var(--teal-bg)", color: "var(--teal)", fontWeight: 500 }}>
                  Already in GitPM
                </span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span>{project.fullName}</span>
              {project.liveUrl && (
                <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <ExternalLink style={{ width: "10px", height: "10px", opacity: 0.4 }} />
                  {project.liveUrl.replace("https://", "")}
                </span>
              )}
            </div>
          </div>

          {!disabled && <RadioDot selected={isSelected} />}
        </div>

        {isSelected && (
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
              We&apos;ll auto-fill:
            </div>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              <PreviewChip filled>Tech stack</PreviewChip>
              <PreviewChip filled>Hosting</PreviewChip>
              <PreviewChip filled>GitHub repo</PreviewChip>
              {project.liveUrl && <PreviewChip filled>Live URL</PreviewChip>}
              <PreviewChip filled={false}>You add: PM context</PreviewChip>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "0 28px 4px" }}>
      {/* Sub-header */}
      <div style={{ marginBottom: "12px" }}>
        {githubUsername && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
            Scanning repos for <strong style={{ color: "var(--text-primary)" }}>@{githubUsername}</strong>
          </div>
        )}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
          <span style={{ color: "var(--teal)", fontWeight: 500 }}>{detected.length + others.length}</span> AVAILABLE TO IMPORT
        </div>
      </div>

      {/* Detection banner */}
      {detected.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "var(--purple-bg)",
            marginBottom: "12px",
            fontSize: "12px",
            color: "var(--purple)",
          }}
        >
          <Sparkles style={{ width: "14px", height: "14px", flexShrink: 0 }} />
          Auto-detected {detected.length} Lovable repo{detected.length !== 1 ? "s" : ""} from your {projects.length} GitHub repositories
        </div>
      )}

      {detected.map((p) => renderCard(p, true, false))}

      {others.length > 0 && (
        <>
          {detected.length > 0 && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", marginTop: "4px" }}>
              Other repos
            </div>
          )}
          {others.map((p) => renderCard(p, false, false))}
        </>
      )}

      {alreadyImported.length > 0 && (
        <>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", marginTop: "8px" }}>
            {alreadyImported.length} already in GitPM
          </div>
          {alreadyImported.map((p) => renderCard(p, false, true))}
        </>
      )}

      {detected.length === 0 && others.length === 0 && (
        <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
          No Lovable repos found in your GitHub account.
        </p>
      )}

      <div style={{ height: "20px" }} />
    </div>
  );
}

// ─── Phase 3: Form ────────────────────────────────────────────────────────────

function Phase3Form({
  formData,
  set,
  toggleArrayItem,
  autofilled,
  errors,
  pendingFiles,
  setPendingFiles,
  username,
}: {
  formData: ModalFormData;
  set: <K extends keyof ModalFormData>(key: K, value: ModalFormData[K]) => void;
  toggleArrayItem: (key: "build_tools" | "category_tags", item: string) => void;
  autofilled: Set<string>;
  errors: FormErrors;
  pendingFiles: File[];
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  username?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (value: string) => {
    set("name", value);
    const autoSlug = generateSlug(value);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      set("slug", autoSlug);
    }
  };

  const isValidVideoUrl =
    formData.demo_video_url &&
    (formData.demo_video_url.includes("loom.com") ||
      formData.demo_video_url.includes("youtube.com") ||
      formData.demo_video_url.includes("youtu.be"));

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const allowed = files.slice(0, 6 - pendingFiles.length);
    setPendingFiles((prev) => [...prev, ...allowed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemovePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const af = (field: string): React.CSSProperties =>
    autofilled.has(field) ? autofillInputStyle : inputStyle;

  const sectionNum = (bg: string, color: string): React.CSSProperties => ({
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
  });

  const slugPrefix = username ? `gitpm.dev/${username}/` : "gitpm.dev/you/";

  const sectionHeadStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  };

  const sectionBodyStyle: React.CSSProperties = {
    paddingLeft: "32px",
  };

  return (
    <div style={{ padding: "0 28px 28px" }}>
      {/* ── 1: Basics ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--purple-bg)", "var(--purple)")}>1</div>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>Basics</span>
          {(autofilled.has("name") || autofilled.has("live_url")) && <AutofilledBadge />}
        </div>
        <div style={sectionBodyStyle}>
          <div style={labelStyle}>
            Project name <span style={{ color: "#E24B4A", fontSize: "10px" }}>*</span>
          </div>
          <input style={af("name")} value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="My Awesome Project" />
          <FieldError msg={errors.name} />

          <div style={labelStyle}>URL slug</div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ padding: "9px 10px", background: "var(--surface-light)", border: "0.5px solid var(--border-light)", borderRight: "none", borderRadius: "7px 0 0 7px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
              {slugPrefix}
            </span>
            <input
              style={{ ...inputStyle, borderRadius: "0 7px 7px 0", marginBottom: 0, flex: 1, fontFamily: "var(--font-mono)" }}
              value={formData.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="my-awesome-project"
            />
          </div>
          <FieldError msg={errors.slug} />

          <div style={labelStyle}>
            Live URL <span style={{ color: "#E24B4A", fontSize: "10px" }}>*</span>
            {autofilled.has("live_url") && <AutofilledBadge />}
          </div>
          <input style={af("live_url")} value={formData.live_url} onChange={(e) => set("live_url", e.target.value)} placeholder="https://myproject.vercel.app" type="url" />
          <FieldError msg={errors.live_url} />

          <div style={labelStyle}>
            Description <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </div>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "56px", lineHeight: 1.5 }} value={formData.description} onChange={(e) => set("description", e.target.value)} placeholder="A one-line summary of what this project does." rows={2} />

          <div style={labelStyle}>
            Categories <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </div>
          <ChipSelector
            options={CATEGORY_TAGS}
            selected={formData.category_tags}
            onToggle={(v) => toggleArrayItem("category_tags", v)}
            variant="purple"
          />
        </div>
      </div>

      {/* ── 2: Build details ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--teal-bg)", "var(--teal)")}>2</div>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>Build details</span>
          {(autofilled.has("build_tools") || autofilled.has("hosting_platform")) && <AutofilledBadge />}
        </div>
        <div style={sectionBodyStyle}>
          <div style={labelStyle}>
            Build tools <span style={{ color: "#E24B4A", fontSize: "10px" }}>*</span>
          </div>
          <ChipSelector
            options={BUILD_TOOLS}
            selected={formData.build_tools}
            onToggle={(v) => toggleArrayItem("build_tools", v)}
            variant="purple"
          />
          <FieldError msg={errors.build_tools} />

          <div style={labelStyle}>Hosting platform</div>
          <ChipSelector
            options={HOSTING_PLATFORMS}
            selected={formData.hosting_platform}
            onToggle={(v) => set("hosting_platform", formData.hosting_platform === v ? "" : v)}
            variant="teal"
          />

          <div style={labelStyle}>
            GitHub repository <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            {autofilled.has("github_repo_url") && <AutofilledBadge />}
          </div>
          <input
            style={af("github_repo_url")}
            value={formData.github_repo_url}
            onChange={(e) => set("github_repo_url", e.target.value)}
            placeholder="https://github.com/you/repo"
            type="url"
          />
        </div>
      </div>

      {/* ── 3: Product context ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--forest-bg)", "var(--forest)")}>3</div>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>Product context</span>
          <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "3px", background: "rgba(217,118,6,0.1)", color: "#D97706", fontWeight: 500 }}>
            What sets you apart
          </span>
        </div>
        <div style={sectionBodyStyle}>
          <div style={labelStyle}>
            Problem statement <span style={{ color: "#E24B4A", fontSize: "10px" }}>*</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontStyle: "italic", opacity: 0.7 }}>
            What problem does this solve? Who has this problem?
          </div>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "72px", lineHeight: 1.5 }}
            value={formData.problem_statement}
            onChange={(e) => set("problem_statement", e.target.value)}
            placeholder="I noticed that PMs who build with AI tools had no way to showcase their work…"
            rows={3}
          />
          <FieldError msg={errors.problem_statement} />

          <div style={labelStyle}>
            Target user <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </div>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "56px", lineHeight: 1.5 }}
            value={formData.target_user}
            onChange={(e) => set("target_user", e.target.value)}
            placeholder="Product managers at B2B SaaS companies…"
            rows={2}
          />

          <div style={labelStyle}>
            Key decisions <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </div>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "56px", lineHeight: 1.5 }}
            value={formData.key_decisions}
            onChange={(e) => set("key_decisions", e.target.value)}
            placeholder="Chose Supabase over Firebase for its PostgreSQL foundation…"
            rows={2}
          />

          <div style={labelStyle}>
            Learnings <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </div>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "56px", lineHeight: 1.5 }}
            value={formData.learnings}
            onChange={(e) => set("learnings", e.target.value)}
            placeholder="What surprised you? What would you do differently?"
            rows={2}
          />
        </div>
      </div>

      {/* ── 4: Media ── */}
      <div style={{ marginBottom: "8px" }}>
        <div style={sectionHeadStyle}>
          <div style={sectionNum("var(--surface-light)", "var(--text-muted)")}>4</div>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>Media</span>
        </div>
        <div style={sectionBodyStyle}>
          <div style={labelStyle}>
            Demo video <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(Loom or YouTube)</span>
          </div>
          <input
            style={inputStyle}
            value={formData.demo_video_url}
            onChange={(e) => set("demo_video_url", e.target.value)}
            placeholder="https://www.loom.com/share/… or https://youtu.be/…"
            type="url"
          />
          {isValidVideoUrl && (
            <div style={{ marginTop: "-6px", marginBottom: "12px", borderRadius: "8px", overflow: "hidden", border: "0.5px solid var(--border-light)" }}>
              <VideoEmbed url={formData.demo_video_url} title="Video preview" />
            </div>
          )}

          <div style={labelStyle}>
            Screenshots <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>(up to 6)</span>
          </div>

          {pendingFiles.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "10px" }}>
              {pendingFiles.map((file, i) => (
                <div key={i} style={{ position: "relative", borderRadius: "6px", overflow: "hidden", background: "var(--surface-light)", aspectRatio: "16/9" }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Screenshot ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePending(i)}
                    aria-label="Remove screenshot"
                    style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(13,27,42,0.55)", opacity: 0, border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0"; }}
                  >
                    <X style={{ width: "18px", height: "18px", color: "white" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {pendingFiles.length < 6 && (
            <>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={handleFileChange} id="modal-screenshot-upload" />
              <label
                htmlFor="modal-screenshot-upload"
                style={{ border: "1px dashed var(--border)", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.15s", background: "var(--surface-light)", display: "block" }}
              >
                <div style={{ color: "var(--text-muted)", marginBottom: "4px", opacity: 0.4, display: "flex", justifyContent: "center" }}>
                  <ImagePlus style={{ width: "24px", height: "24px" }} />
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Click to add screenshots</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", opacity: 0.6 }}>JPEG, PNG, WebP — max 5 MB</div>
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AddProjectModal({
  open,
  onClose,
  vercelConnected,
  vercelUsername,
  githubUsername,
}: AddProjectModalProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(1);
  const [source, setSource] = useState<Source>(null);
  const [formData, setFormData] = useState<ModalFormData>(EMPTY_FORM);
  const [autofilled, setAutofilled] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [p2Selection, setP2Selection] = useState<P2Selection | null>(null);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setPhase(1);
        setSource(null);
        setFormData(EMPTY_FORM);
        setAutofilled(new Set());
        setErrors({});
        setSubmitting(false);
        setEnriching(false);
        setPendingFiles([]);
        setP2Selection(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const set = useCallback(<K extends keyof ModalFormData>(key: K, value: ModalFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayItem = useCallback((key: "build_tools" | "category_tags", item: string) => {
    setFormData((prev) => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(item) ? arr.filter((t) => t !== item) : [...arr, item] };
    });
  }, []);

  function selectSource(s: Source) {
    setSource(s);
    setP2Selection(null);
    if (s === "manual") setPhase(3);
    else setPhase(2);
  }

  function handleP2Continue() {
    if (!p2Selection) return;
    setFormData((prev) => ({ ...prev, ...p2Selection.prefill }));
    setAutofilled(new Set(p2Selection.autofills));
    setPhase(3);
  }

  function handleBack() {
    setErrors({});
    if (phase === 3 && source !== "manual") {
      setPhase(2);
    } else {
      setPhase(1);
      setSource(null);
      setP2Selection(null);
    }
  }

  function validateForm(): boolean {
    const e: FormErrors = {};
    if (!formData.name.trim()) e.name = "Project name is required";
    else if (formData.name.length > 80) e.name = "Name too long";
    if (!formData.slug.trim()) e.slug = "Slug is required";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) e.slug = "Lowercase, numbers, and hyphens only";
    if (!formData.live_url.trim()) e.live_url = "Live URL is required";
    else if (!formData.live_url.startsWith("http://") && !formData.live_url.startsWith("https://")) e.live_url = "Must start with http:// or https://";
    if (formData.build_tools.length === 0) e.build_tools = "Select at least one build tool";
    if (!formData.problem_statement.trim()) e.problem_statement = "Problem statement is required";
    else if (formData.problem_statement.length < 10) e.problem_statement = "Must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    setSubmitting(true);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      live_url: formData.live_url,
      category_tags: formData.category_tags,
      build_tools: formData.build_tools,
      hosting_platform: formData.hosting_platform || null,
      problem_statement: formData.problem_statement,
      target_user: formData.target_user || null,
      key_decisions: formData.key_decisions || null,
      learnings: formData.learnings || null,
      demo_video_url: formData.demo_video_url || null,
      github_repo_url: formData.github_repo_url || null,
    };

    try {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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

      toast.success("Project created!");
      onClose();
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setEnriching(false);
    }
  }

  if (!open) return null;

  const isLoading = submitting || enriching || uploadingScreenshots;
  const loadingLabel = uploadingScreenshots ? "Uploading…" : enriching ? "Fetching GitHub data…" : submitting ? "Saving…" : null;

  const title = phase === 1
    ? "Add project"
    : phase === 2
    ? source === "vercel"
      ? "Import from Vercel"
      : "Import from Lovable"
    : source === "manual"
    ? "Add project details"
    : "Complete your project";

  return (
    <>
      <style>{`
        @keyframes ufModalIn { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @media (max-width: 768px) {
          .uf-modal-card { border-radius:0!important; max-width:100%!important; min-height:100vh!important; }
          .uf-source-grid { grid-template-columns:1fr!important; }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: "rgba(13,27,42,0.6)",
          backdropFilter: "blur(6px)",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "24px 20px 60px",
        }}
      >
        {/* Card */}
        <div
          className="uf-modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--surface-card)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "680px",
            position: "relative",
            animation: "ufModalIn 0.25s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 24px 80px rgba(13,27,42,0.25), 0 0 0 0.5px rgba(13,27,42,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px 0" }}>
            <div style={{ fontSize: "18px", fontWeight: 500, letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
              {title}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "background 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-light)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ padding: "0 28px", marginTop: "6px", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{PHASE_LABELS[phase]}</div>
            <div style={{ height: "2px", background: "var(--border-light)", borderRadius: "1px", marginTop: "10px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "var(--teal)",
                  borderRadius: "1px",
                  width: `${PHASE_PCT[phase]}%`,
                  transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </div>
          </div>

          {/* ── Phase 1 ── */}
          {phase === 1 && (
            <div
              className="uf-source-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "0 28px 24px" }}
            >
              {/* Vercel card */}
              <button
                type="button"
                onClick={() => selectSource("vercel")}
                style={{
                  padding: "16px 14px",
                  border: "0.5px solid var(--border-light)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "center",
                  position: "relative",
                  background: "var(--white)",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-card)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-light)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--white)"; }}
              >
                {vercelConnected && (
                  <div style={{ position: "absolute", top: "8px", right: "8px", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", fontWeight: 500, fontFamily: "var(--font-mono)", background: "var(--teal-bg)", color: "var(--teal)" }}>
                    Connected
                  </div>
                )}
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <Triangle style={{ width: "18px", height: "18px", fill: "white", color: "white" }} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "2px", color: "var(--text-primary)" }}>Vercel</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>Import a deployment with auto-verification</div>
              </button>

              {/* Lovable card */}
              <button
                type="button"
                onClick={() => selectSource("lovable")}
                style={{ padding: "16px 14px", border: "0.5px solid var(--border-light)", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s", textAlign: "center", position: "relative", background: "var(--white)", fontFamily: "var(--font-body)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-card)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-light)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--white)"; }}
              >
                <div style={{ position: "absolute", top: "8px", right: "8px", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", fontWeight: 500, fontFamily: "var(--font-mono)", background: "var(--purple-bg)", color: "var(--purple)" }}>
                  Auto-detect
                </div>
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <Sparkles style={{ width: "18px", height: "18px", color: "white" }} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "2px", color: "var(--text-primary)" }}>Lovable</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>Detected from your GitHub repos</div>
              </button>

              {/* Manual card */}
              <button
                type="button"
                onClick={() => selectSource("manual")}
                style={{ padding: "16px 14px", border: "0.5px solid var(--border-light)", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s", textAlign: "center", background: "var(--white)", fontFamily: "var(--font-body)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-card)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-light)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--white)"; }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "var(--surface-light)", border: "0.5px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <Plus style={{ width: "18px", height: "18px", color: "var(--text-secondary)" }} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "2px", color: "var(--text-primary)" }}>Manual</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>Paste any URL and fill in details</div>
              </button>
            </div>
          )}

          {/* ── Phase 2: Vercel ── */}
          {phase === 2 && source === "vercel" && (
            <VercelImportPhase
              vercelUsername={vercelUsername}
              onSelectionChange={setP2Selection}
            />
          )}

          {/* ── Phase 2: Lovable ── */}
          {phase === 2 && source === "lovable" && (
            <LovableImportPhase
              githubUsername={githubUsername}
              onSelectionChange={setP2Selection}
            />
          )}

          {/* ── Phase 3: Form ── */}
          {phase === 3 && (
            <Phase3Form
              formData={formData}
              set={set}
              toggleArrayItem={toggleArrayItem}
              autofilled={autofilled}
              errors={errors}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              username={githubUsername ?? undefined}
            />
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 28px",
              borderTop: "0.5px solid var(--border-light)",
              background: "var(--surface-card)",
              position: "sticky",
              bottom: 0,
            }}
          >
            <div>
              {phase > 1 && (
                <button
                  onClick={handleBack}
                  disabled={isLoading}
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "none",
                    border: "none",
                    fontFamily: "var(--font-body)",
                    transition: "color 0.15s",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
                >
                  ← {phase === 2 ? "All sources" : "Back"}
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {phase === 1 && (
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                  Pick a source to get started
                </span>
              )}

              {phase === 2 && (
                <button
                  onClick={handleP2Continue}
                  disabled={!p2Selection}
                  style={{
                    padding: "9px 22px",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: p2Selection ? "pointer" : "not-allowed",
                    fontFamily: "var(--font-body)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: p2Selection ? "var(--purple)" : "var(--surface-light)",
                    color: p2Selection ? "var(--white)" : "var(--text-muted)",
                    transition: "opacity 0.15s",
                  }}
                >
                  Continue →
                </button>
              )}

              {phase === 3 && (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  style={{
                    padding: "9px 22px",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-body)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--teal)",
                    color: "var(--white)",
                    opacity: isLoading ? 0.7 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {isLoading && <Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" />}
                  {loadingLabel ?? "✓ Publish project"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
