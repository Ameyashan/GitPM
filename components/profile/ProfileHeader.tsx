import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin } from "lucide-react";
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

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = getInitials(user.display_name ?? user.username);
  const hasSocials = user.github_username || user.linkedin_url;

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
          <div className="flex flex-wrap gap-4 mt-[14px]">
            {user.github_username && (
              <Link
                href={`https://github.com/${user.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[5px] text-[12px] font-mono text-text-inverse-muted hover:text-teal-light transition-colors"
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
                className="flex items-center gap-[5px] text-[12px] font-mono text-text-inverse-muted hover:text-teal-light transition-colors"
              >
                <Linkedin className="h-[14px] w-[14px] opacity-70 shrink-0" />
                {formatUrl(user.linkedin_url)}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
