"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

interface SettingsFormProps {
  username: string;
  displayName: string;
  headline: string;
  bio: string;
  linkedinUrl: string;
  websiteUrl: string;
  avatarUrl: string | null;
}

interface FormState {
  display_name: string;
  headline: string;
  bio: string;
  linkedin_url: string;
  website_url: string;
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

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SettingsForm({
  username,
  displayName,
  headline,
  bio,
  linkedinUrl,
  websiteUrl,
  avatarUrl,
}: SettingsFormProps) {
  const [form, setForm] = useState<FormState>({
    display_name: displayName,
    headline: headline,
    bio: bio,
    linkedin_url: linkedinUrl,
    website_url: websiteUrl,
  });
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Upload failed");
      }

      const json = (await res.json()) as { data: { avatar_url: string } };
      setCurrentAvatarUrl(json.data.avatar_url);
      toast.success("Profile photo updated");
      router.refresh();
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingAvatar(false);
      // Reset input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      {/* Avatar section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          border: "0.5px solid var(--border-light)",
          borderRadius: "10px",
          background: "var(--surface-light)",
        }}
      >
        {/* Avatar preview */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {currentAvatarUrl ? (
            <Image
              src={currentAvatarUrl}
              alt="Profile photo"
              width={64}
              height={64}
              className="rounded-full object-cover"
              style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(135deg, var(--purple), var(--teal))",
                fontSize: "20px",
                fontWeight: 500,
                color: "var(--white)",
                border: "1.5px solid rgba(255,255,255,0.1)",
              }}
            >
              {getInitials(form.display_name || displayName)}
            </div>
          )}
        </div>

        {/* Upload controls */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" }}>
            Profile photo
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>
            JPEG, PNG, WebP or GIF · Max 2 MB
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
            aria-label="Upload profile photo"
          />
          <button
            type="button"
            disabled={uploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              border: "0.5px solid var(--border-light)",
              cursor: uploadingAvatar ? "not-allowed" : "pointer",
              opacity: uploadingAvatar ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {uploadingAvatar ? (
              <Loader2 width={12} height={12} className="animate-spin" />
            ) : (
              <Camera width={12} height={12} />
            )}
            {uploadingAvatar ? "Uploading…" : "Change photo"}
          </button>
        </div>
      </div>

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

      {/* Personal website URL */}
      <Field label="Personal website">
        <input
          type="url"
          value={form.website_url}
          onChange={(e) => set("website_url", e.target.value)}
          onFocus={focusStyle}
          onBlur={blurStyle}
          placeholder="https://yourwebsite.com"
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
