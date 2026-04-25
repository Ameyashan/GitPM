"use client";

import Image from "next/image";
import { useState } from "react";
import { Mail, Share2, Check } from "lucide-react";
import type { User } from "@/types/project";

interface ProfileHeaderProps {
  user: User;
  tierLabel: string;
  skillPills: string[];
  verifiedSources: string[];
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function pickContactHref(user: User): string | null {
  if (user.linkedin_url) return user.linkedin_url;
  if (user.twitter_url) return user.twitter_url;
  if (user.website_url) return user.website_url;
  if (user.github_username) return `https://github.com/${user.github_username}`;
  return null;
}

function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/${username}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: `${username} on GitPM` });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className="flex items-center gap-[6px] text-[12px] font-medium text-white/85 hover:text-white px-[14px] h-[34px] rounded-[8px] transition-colors"
      style={{ border: "0.5px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)" }}
    >
      {copied ? <Check className="h-[13px] w-[13px]" /> : <Share2 className="h-[13px] w-[13px]" />}
      {copied ? "Copied" : "Share profile"}
    </button>
  );
}

export function ProfileHeader({ user, tierLabel, skillPills, verifiedSources }: ProfileHeaderProps) {
  const initials = getInitials(user.display_name ?? user.username);
  const contactHref = pickContactHref(user);
  const handle = user.username;
  const verifiedLine =
    verifiedSources.length > 0 ? `verified via ${verifiedSources.join(" + ")}` : null;

  return (
    <div className="flex gap-6 items-start max-md:flex-col max-md:gap-5">
      {/* Avatar with status dot */}
      <div className="relative shrink-0">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.display_name ?? user.username ?? "Avatar"}
            width={92}
            height={92}
            className="rounded-full object-cover"
            style={{ border: "1.5px solid rgba(255,255,255,0.12)" }}
          />
        ) : (
          <div
            className="w-[92px] h-[92px] rounded-full flex items-center justify-center text-white text-[28px] font-medium"
            style={{
              background: "linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              letterSpacing: "-0.5px",
            }}
          >
            {initials}
          </div>
        )}
        <span
          className="absolute bottom-1 right-1 w-[14px] h-[14px] rounded-full"
          style={{ background: "#22c55e", border: "2px solid var(--navy)" }}
          aria-hidden
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[11px] uppercase text-white/55"
              style={{ letterSpacing: "0.12em" }}
            >
              Product Manager · {tierLabel}
            </div>

            <h1
              className="text-[34px] leading-[1.12] font-medium text-white mt-[6px]"
              style={{ letterSpacing: "-0.6px" }}
            >
              {user.display_name ?? user.username}{" "}
              <span className="font-light italic text-white/85" style={{ fontFamily: "var(--font-serif, ui-serif, Georgia, serif)" }}>
                ships
              </span>{" "}
              <span className="text-white/85">weekly.</span>
            </h1>

            <div className="flex items-center gap-[10px] mt-[10px] flex-wrap">
              <span className="font-mono text-[12px] text-white/65">gitpm.dev/{handle}</span>
              {verifiedLine && (
                <span className="font-mono text-[11px] text-teal-light flex items-center gap-[5px]">
                  <svg viewBox="0 0 16 16" fill="none" className="w-[11px] h-[11px]">
                    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {verifiedLine}
                </span>
              )}
            </div>

            {(user.bio || user.headline) && (
              <p
                className="text-[14px] text-white/75 mt-[14px] max-w-[560px]"
                style={{ lineHeight: 1.6 }}
              >
                {user.bio ?? user.headline}
              </p>
            )}

            {skillPills.length > 0 && (
              <div className="flex flex-wrap gap-[6px] mt-[14px]">
                {skillPills.map((p) => (
                  <span
                    key={p}
                    className="text-[11px] font-medium text-white/85 px-[10px] py-[4px] rounded-[999px]"
                    style={{ border: "0.5px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)" }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action column */}
          <div className="flex flex-col items-end gap-[8px] shrink-0 max-md:hidden">
            {contactHref && (
              <a
                href={contactHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[6px] text-[12px] font-medium text-navy px-[14px] h-[34px] rounded-[8px] bg-white hover:bg-white/90 transition-colors"
              >
                <Mail className="h-[13px] w-[13px]" />
                Contact
              </a>
            )}
            <ShareButton username={handle} />
          </div>
        </div>

        {/* Mobile actions */}
        <div className="hidden max-md:flex gap-[8px] mt-[14px]">
          {contactHref && (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[6px] text-[12px] font-medium text-navy px-[14px] h-[34px] rounded-[8px] bg-white"
            >
              <Mail className="h-[13px] w-[13px]" /> Contact
            </a>
          )}
          <ShareButton username={handle} />
        </div>
      </div>
    </div>
  );
}
