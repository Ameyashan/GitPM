import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Youtube, Twitter, Globe } from "lucide-react";
import type { User } from "@/types/project";

interface ProfileHeaderProps {
  user: User;
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

function formatUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

function MediumIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ opacity: 0.7, flexShrink: 0 }}
    >
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  );
}

function SubstackIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ opacity: 0.7, flexShrink: 0 }}
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}

const LINK_CLASS =
  "flex items-center gap-[5px] text-[12px] font-mono text-text-inverse-muted hover:text-teal-light transition-colors";

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = getInitials(user.display_name ?? user.username);
  const hasSocials =
    user.github_username ||
    user.linkedin_url ||
    user.website_url ||
    user.medium_url ||
    user.substack_url ||
    user.youtube_url ||
    user.twitter_url;

  return (
    <div className="flex gap-5 items-start">
      {/* Avatar */}
      {user.avatar_url ? (
        <Image
          src={user.avatar_url}
          alt={user.display_name ?? user.username ?? "Avatar"}
          width={64}
          height={64}
          className="shrink-0 rounded-full object-cover"
          style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
        />
      ) : (
        <div
          className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-white text-[22px] font-medium"
          style={{
            background: "linear-gradient(135deg, var(--purple) 0%, var(--teal) 100%)",
            border: "1.5px solid rgba(255,255,255,0.1)",
          }}
        >
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-2xl font-medium text-white"
          style={{ letterSpacing: "-0.5px" }}
        >
          {user.display_name ?? user.username}
        </h1>

        {user.headline && (
          <p
            className="text-sm font-light text-text-inverse-muted mt-1 max-w-[520px]"
            style={{ lineHeight: 1.55 }}
          >
            {user.headline}
          </p>
        )}

        {hasSocials && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-[14px]">
            {user.github_username && (
              <Link
                href={`https://github.com/${user.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                <Github className="h-[14px] w-[14px] opacity-70 shrink-0" />
                github.com/{user.github_username}
              </Link>
            )}
            {user.linkedin_url && (
              <Link
                href={user.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                <Linkedin className="h-[14px] w-[14px] opacity-70 shrink-0" />
                {formatUrl(user.linkedin_url)}
              </Link>
            )}
            {user.website_url && (
              <Link
                href={user.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                <Globe className="h-[14px] w-[14px] opacity-70 shrink-0" />
                {formatUrl(user.website_url)}
              </Link>
            )}
            {user.medium_url && (
              <Link
                href={user.medium_url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                <MediumIcon size={14} />
                {formatUrl(user.medium_url)}
              </Link>
            )}
            {user.substack_url && (
              <Link
                href={user.substack_url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                <SubstackIcon size={14} />
                {formatUrl(user.substack_url)}
              </Link>
            )}
            {user.youtube_url && (
              <Link
                href={user.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                <Youtube className="h-[14px] w-[14px] opacity-70 shrink-0" />
                {formatUrl(user.youtube_url)}
              </Link>
            )}
            {user.twitter_url && (
              <Link
                href={user.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                <Twitter className="h-[14px] w-[14px] opacity-70 shrink-0" />
                {formatUrl(user.twitter_url)}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
