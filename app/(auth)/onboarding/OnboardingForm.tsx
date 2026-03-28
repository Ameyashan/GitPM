"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Github, User } from "lucide-react";

interface OnboardingFormProps {
  initialUsername: string;
  initialDisplayName: string;
  initialGithubUsername: string | null;
  initialAvatarUrl: string | null;
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

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

export function OnboardingForm({
  initialUsername,
  initialDisplayName,
  initialGithubUsername,
  initialAvatarUrl,
}: OnboardingFormProps) {
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [headline, setHeadline] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [submitting, setSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(async (value: string) => {
    if (!value) {
      setUsernameStatus("idle");
      return;
    }

    const usernameRegex = /^[a-z0-9_-]{3,30}$/;
    if (!usernameRegex.test(value)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");

    try {
      const res = await fetch(
        `/api/users/check-username?username=${encodeURIComponent(value)}`
      );
      const json = (await res.json()) as { data?: { available: boolean } };
      setUsernameStatus(json.data?.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkUsername(username);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, checkUsername]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (usernameStatus !== "available") {
      toast.error("Please choose a valid, available username.");
      return;
    }
    if (!headline.trim()) {
      toast.error("Headline is required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          display_name: initialDisplayName || initialGithubUsername || username,
          headline,
        }),
      });

      const json = (await res.json()) as {
        data?: { username: string };
        error?: string;
      };

      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      toast.success("You're on the map. Welcome to GitPM.");
      router.push("/dashboard?welcome=1");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    usernameStatus === "available" &&
    headline.trim().length > 0 &&
    !submitting;

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--purple)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--purple-bg)";
  }

  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--border-light)";
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
      {/* GitHub identity card */}
      {(initialAvatarUrl || initialGithubUsername) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 14px",
            border: "0.5px solid var(--border-light)",
            borderRadius: "10px",
            background: "var(--surface-light)",
          }}
        >
          {initialAvatarUrl ? (
            <Image
              src={initialAvatarUrl}
              alt="GitHub avatar"
              width={36}
              height={36}
              style={{ borderRadius: "50%", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={16} color="var(--text-muted)" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-primary)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {initialDisplayName || initialGithubUsername}
            </p>
            {initialGithubUsername && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  margin: "2px 0 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Github size={11} />
                {initialGithubUsername}
              </p>
            )}
          </div>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--teal)",
              background: "var(--teal-bg)",
              padding: "3px 8px",
              borderRadius: "999px",
              flexShrink: 0,
            }}
          >
            connected
          </span>
        </div>
      )}

      {/* Username */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6px",
          }}
        >
          <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>
            Username <span style={{ color: "var(--teal)" }}>*</span>
          </label>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
            }}
          >
            {username.length}/30
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            border: "0.5px solid var(--border-light)",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "border-color 0.15s, box-shadow 0.15s",
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
              display: "flex",
              alignItems: "center",
            }}
          >
            gitpm.dev/
          </span>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              onFocus={focusInput}
              onBlur={blurInput}
              placeholder="yourhandle"
              maxLength={30}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              style={{
                ...INPUT_STYLE,
                border: "none",
                borderRadius: 0,
                paddingRight: "36px",
                fontFamily: "var(--font-mono)",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {usernameStatus === "checking" && (
                <Loader2 size={15} color="var(--text-muted)" className="animate-spin" />
              )}
              {usernameStatus === "available" && (
                <CheckCircle size={15} color="var(--teal)" />
              )}
              {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                <XCircle size={15} color="#EF4444" />
              )}
            </span>
          </div>
        </div>
        <p
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            marginTop: "5px",
            color:
              usernameStatus === "available"
                ? "var(--teal)"
                : usernameStatus === "taken" || usernameStatus === "invalid"
                ? "#EF4444"
                : "var(--text-muted)",
          }}
        >
          {usernameStatus === "taken" && "That username is already taken."}
          {usernameStatus === "invalid" &&
            "3–30 characters. Lowercase letters, numbers, hyphens, underscores only."}
          {usernameStatus === "available" && "Available!"}
          {usernameStatus === "idle" &&
            "Lowercase letters, numbers, - and _ only."}
        </p>
      </div>

      {/* Headline */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6px",
          }}
        >
          <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>
            Headline <span style={{ color: "var(--teal)" }}>*</span>
          </label>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: headline.length > 140 ? "#F59E0B" : "var(--text-muted)",
            }}
          >
            {headline.length}/160
          </span>
        </div>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          onFocus={focusInput}
          onBlur={blurInput}
          placeholder="PM at Acme · Shipping with Cursor + v0"
          maxLength={160}
          autoFocus
          style={INPUT_STYLE}
        />
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "5px" }}>
          One punchy line about who you are and what you build. You&apos;ll appear on the homepage instantly.
        </p>
      </div>

      {/* Submit */}
      <div style={{ marginTop: "6px" }}>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "11px 24px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
            background: "var(--navy)",
            color: "#fff",
            border: "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.4,
            transition: "opacity 0.15s",
          }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Saving…" : "Set headline & go to dashboard →"}
        </button>
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          Bio, social links, and more can be added from your dashboard settings.
        </p>
      </div>
    </form>
  );
}
