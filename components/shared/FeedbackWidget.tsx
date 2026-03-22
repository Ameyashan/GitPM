"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FeedbackSubmitPayload } from "@/types/feedback";

const EMOJI_OPTIONS: readonly string[] = ["😀", "🙂", "😐", "😕", "😞"];

function getPageLabel(pathname: string): string {
  if (pathname === "/") {
    return "Landing page";
  }
  if (pathname.startsWith("/dashboard")) {
    return "Dashboard";
  }
  if (pathname.startsWith("/onboarding")) {
    return "Onboarding";
  }
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) {
    return "Public profile";
  }
  if (segments.length >= 2) {
    return "Project page";
  }
  return "Other";
}

export function FeedbackWidget() {
  const pathname = usePathname() ?? "/";
  const pageLabel = getPageLabel(pathname);

  const [open, setOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"form" | "thanks">("form");
  const [submitting, setSubmitting] = useState(false);

  const canSend =
    (selectedEmoji !== null && selectedEmoji.length > 0) ||
    text.trim().length > 0;

  const resetForm = useCallback((): void => {
    setSelectedEmoji(null);
    setText("");
    setPhase("form");
  }, []);

  const close = useCallback((): void => {
    setOpen(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const handleSend = async (): Promise<void> => {
    if (!canSend || submitting) {
      return;
    }
    setSubmitting(true);
    const payload: FeedbackSubmitPayload = {
      emoji: selectedEmoji,
      text: text.trim(),
      pageLabel,
      path: pathname,
    };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: unknown = await res.json();
      if (!res.ok) {
        const err =
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "Something went wrong";
        toast.error(err);
        return;
      }
      setPhase("thanks");
      window.setTimeout(() => {
        close();
      }, 2000);
    } catch {
      toast.error("Could not send feedback. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-0 z-[60] flex flex-col items-end gap-2 pr-0 sm:bottom-8 sm:right-4"
      aria-live="polite"
    >
      {open ? (
      <div
        className="pointer-events-auto max-h-[min(70vh,520px)] w-[min(calc(100vw-1.5rem),360px)] rounded-xl border border-gitpm-border bg-surface-card p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200"
        id="feedback-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        {phase === "form" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2
                  id="feedback-title"
                  className="font-semibold text-text-primary"
                >
                  Send feedback
                </h2>
                <p className="mt-0.5 text-xs text-text-muted">
                  Page: {pageLabel}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-text-muted hover:text-text-primary"
                onClick={close}
                aria-label="Close feedback"
              >
                <X className="size-4" />
              </Button>
            </div>
            <p className="text-sm text-text-secondary">
              How was your experience? Optional note helps us improve.
            </p>
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Quick reaction"
            >
              {EMOJI_OPTIONS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border border-transparent text-xl transition-colors hover:bg-surface-light",
                    selectedEmoji === emo &&
                      "border-purple bg-purple-bg ring-1 ring-purple/30"
                  )}
                  onClick={() => {
                    setSelectedEmoji((prev) => (prev === emo ? null : emo));
                  }}
                  aria-pressed={selectedEmoji === emo}
                  aria-label={`Reaction ${emo}`}
                >
                  {emo}
                </button>
              ))}
            </div>
            <Textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              placeholder="Tell us more (optional)"
              rows={4}
              maxLength={5000}
              className="resize-none border-gitpm-border bg-white text-sm"
            />
            <Button
              type="button"
              className="w-full bg-navy text-text-inverse hover:bg-navy-mid"
              disabled={!canSend || submitting}
              onClick={() => {
                void handleSend();
              }}
            >
              {submitting ? "Sending…" : "Send feedback"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-lg" aria-hidden>
              🙏
            </p>
            <p className="font-medium text-text-primary">Thanks for the feedback!</p>
            <p className="text-sm text-text-secondary">
              We read every message.
            </p>
          </div>
        )}
      </div>
      ) : null}

      <button
        type="button"
        className={cn(
          "pointer-events-auto flex h-11 items-center gap-2 rounded-l-lg border border-r-0 border-gitpm-border bg-navy px-3 text-sm font-medium text-text-inverse shadow-md transition hover:bg-navy-mid",
          open && "pointer-events-none invisible"
        )}
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        aria-expanded={open}
        aria-controls={open ? "feedback-panel" : undefined}
        id="feedback-tab"
      >
        <MessageSquarePlus className="size-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Feedback</span>
      </button>
    </div>
  );
}
