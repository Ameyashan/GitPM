"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2, Github, User } from "lucide-react";

interface OnboardingFormProps {
  initialUsername: string;
  initialDisplayName: string;
  initialGithubUsername: string | null;
  initialAvatarUrl: string | null;
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function OnboardingForm({
  initialUsername,
  initialDisplayName,
  initialGithubUsername,
  initialAvatarUrl,
}: OnboardingFormProps) {
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

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
    if (!displayName.trim()) {
      toast.error("Display name is required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          display_name: displayName,
          headline,
          bio: bio || undefined,
          linkedin_url: linkedinUrl || undefined,
          website_url: websiteUrl || undefined,
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

      toast.success("Profile saved! Welcome to GitPM.");
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
    displayName.trim().length > 0 &&
    headline.trim().length > 0 &&
    !submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* GitHub identity preview */}
      {(initialAvatarUrl || initialGithubUsername) && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gitpm-border/40 bg-surface-dark/40">
          {initialAvatarUrl ? (
            <Image
              src={initialAvatarUrl}
              alt="GitHub avatar"
              width={40}
              height={40}
              className="rounded-full ring-1 ring-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="h-5 w-5 text-white/40" />
            </div>
          )}
          <div>
            <p className="text-sm text-white font-medium">
              {initialDisplayName || initialGithubUsername}
            </p>
            {initialGithubUsername && (
              <p className="text-xs text-white/40 flex items-center gap-1">
                <Github className="h-3 w-3" />
                {initialGithubUsername}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-white/80 text-sm">
          Username <span className="text-teal">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">
            gitpm.dev/
          </span>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="pl-[6.5rem] bg-surface-dark border-gitpm-border/50 text-white placeholder:text-white/20 focus-visible:ring-purple/50"
            placeholder="yourhandle"
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {usernameStatus === "checking" && (
              <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
            )}
            {usernameStatus === "available" && (
              <CheckCircle className="h-4 w-4 text-teal" />
            )}
            {(usernameStatus === "taken" || usernameStatus === "invalid") && (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>
        <p className="text-xs text-white/30">
          {usernameStatus === "taken" && "That username is already taken."}
          {usernameStatus === "invalid" &&
            "3–30 characters. Lowercase letters, numbers, hyphens, underscores only."}
          {usernameStatus === "available" && (
            <span className="text-teal">Available!</span>
          )}
          {usernameStatus === "idle" &&
            "3–30 characters. Letters, numbers, - and _ only."}
        </p>
      </div>

      {/* Display name */}
      <div className="space-y-1.5">
        <Label htmlFor="display_name" className="text-white/80 text-sm">
          Display name <span className="text-teal">*</span>
        </Label>
        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-surface-dark border-gitpm-border/50 text-white placeholder:text-white/20 focus-visible:ring-purple/50"
          placeholder="Ada Lovelace"
          maxLength={100}
        />
      </div>

      {/* Headline */}
      <div className="space-y-1.5">
        <Label htmlFor="headline" className="text-white/80 text-sm">
          Headline <span className="text-teal">*</span>
        </Label>
        <Input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="bg-surface-dark border-gitpm-border/50 text-white placeholder:text-white/20 focus-visible:ring-purple/50"
          placeholder="PM at Acme · Shipping with Cursor + v0"
          maxLength={160}
        />
        <p className="text-xs text-white/30">
          {headline.length}/160 — one punchy line about you and what you build.
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-white/80 text-sm">
          Bio{" "}
          <span className="text-white/30 text-xs font-normal">(optional)</span>
        </Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="bg-surface-dark border-gitpm-border/50 text-white placeholder:text-white/20 focus-visible:ring-purple/50 resize-none"
          placeholder="A bit more about what you build, your stack, or your PM background…"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-white/30">{bio.length}/500</p>
      </div>

      {/* LinkedIn */}
      <div className="space-y-1.5">
        <Label htmlFor="linkedin_url" className="text-white/80 text-sm">
          LinkedIn URL{" "}
          <span className="text-white/30 text-xs font-normal">(optional)</span>
        </Label>
        <Input
          id="linkedin_url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          type="url"
          className="bg-surface-dark border-gitpm-border/50 text-white placeholder:text-white/20 focus-visible:ring-purple/50"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <Label htmlFor="website_url" className="text-white/80 text-sm">
          Personal website{" "}
          <span className="text-white/30 text-xs font-normal">(optional)</span>
        </Label>
        <Input
          id="website_url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          type="url"
          className="bg-surface-dark border-gitpm-border/50 text-white placeholder:text-white/20 focus-visible:ring-purple/50"
          placeholder="https://yoursite.com"
        />
      </div>

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-purple hover:bg-purple/90 text-white font-medium disabled:opacity-40"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving…
          </>
        ) : (
          "Save profile & continue"
        )}
      </Button>
    </form>
  );
}
