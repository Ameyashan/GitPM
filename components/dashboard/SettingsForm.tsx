"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  username: string;
  displayName: string;
  headline: string;
  bio: string;
  linkedinUrl: string;
}

interface FormState {
  display_name: string;
  headline: string;
  bio: string;
  linkedin_url: string;
}

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "var(--text-primary)",
  marginBottom: "6px",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "0.5px solid var(--border-light)",
  borderRadius: "8px",
  fontSize: "14px",
  fontFamily: "var(--font-body)",
  background: "transparent",
  color: "var(--text-primary)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

export function SettingsForm({
  username,
  displayName,
  headline,
  bio,
  linkedinUrl,
}: SettingsFormProps) {
  const [form, setForm] = useState<FormState>({
    display_name: displayName,
    headline: headline,
    bio: bio,
    linkedin_url: linkedinUrl,
  });
  const [saving, setSaving] = useState(false);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "var(--purple)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--purple-bg)";
  }

  function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "var(--border-light)";
    e.currentTarget.style.boxShadow = "none";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to save");
      }

      toast.success("Profile updated");
    } catch (err) {
      console.error("Settings save error:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      style={{
        maxWidth: "480px",
        display: "grid",
        gap: "16px",
      }}
    >
      {/* Username — read-only, shown with prefix */}
      <Field label="Username">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "0.5px solid var(--border-light)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              padding: "9px 12px",
              background: "var(--surface-light)",
              fontSize: "13px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              borderRight: "0.5px solid var(--border-light)",
              whiteSpace: "nowrap",
            }}
          >
            gitpm.dev/
          </span>
          <input
            type="text"
            value={username}
            readOnly
            style={{
              ...INPUT_STYLE,
              border: "none",
              borderRadius: 0,
              background: "transparent",
              flexGrow: 1,
              cursor: "default",
              color: "var(--text-secondary)",
            }}
            aria-label="Username (read-only)"
          />
        </div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "4px",
            fontFamily: "var(--font-mono)",
          }}
        >
          Username changes require support.
        </p>
      </Field>

      {/* Display name */}
      <Field label="Display name">
        <input
          type="text"
          value={form.display_name}
          onChange={(e) => set("display_name", e.target.value)}
          onFocus={focusStyle}
          onBlur={blurStyle}
          placeholder="Your full name"
          style={INPUT_STYLE}
          maxLength={80}
        />
      </Field>

      {/* Headline */}
      <Field label="Headline">
        <input
          type="text"
          value={form.headline}
          onChange={(e) => set("headline", e.target.value)}
          onFocus={focusStyle}
          onBlur={blurStyle}
          placeholder="PM at Acme · Building with AI"
          style={INPUT_STYLE}
          maxLength={160}
        />
      </Field>

      {/* Bio */}
      <Field label="Bio">
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          onFocus={focusStyle}
          onBlur={blurStyle}
          placeholder="A short bio for your public profile."
          rows={3}
          style={{
            ...INPUT_STYLE,
            resize: "vertical",
            lineHeight: "1.5",
          }}
          maxLength={1000}
        />
      </Field>

      {/* LinkedIn URL */}
      <Field label="LinkedIn URL">
        <input
          type="url"
          value={form.linkedin_url}
          onChange={(e) => set("linkedin_url", e.target.value)}
          onFocus={focusStyle}
          onBlur={blurStyle}
          placeholder="https://linkedin.com/in/yourname"
          style={{
            ...INPUT_STYLE,
            fontFamily: "var(--font-mono)",
          }}
        />
      </Field>

      {/* Save button */}
      <div style={{ marginTop: "8px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "11px 24px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
            background: "var(--navy)",
            color: "#fff",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {saving && <Loader2 width={14} height={14} className="animate-spin" />}
          Save changes
        </button>
      </div>
    </form>
  );
}
