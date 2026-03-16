import Link from "next/link";
import { Github, Linkedin, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
      <Avatar className="h-[72px] w-[72px] shrink-0 ring-2 ring-white/10">
        <AvatarImage
          src={user.avatar_url ?? undefined}
          alt={user.display_name ?? user.username ?? "Avatar"}
        />
        <AvatarFallback className="bg-purple/20 text-purple text-xl font-display font-bold">
          {getInitials(user.display_name ?? user.username)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-display font-bold text-white leading-tight">
          {user.display_name ?? user.username}
        </h1>

        {user.headline && (
          <p className="text-sm text-white/60 leading-snug max-w-md">
            {user.headline}
          </p>
        )}

        <div className="flex items-center gap-3 mt-0.5">
          {user.github_username && (
            <Link
              href={`https://github.com/${user.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label={`GitHub: ${user.github_username}`}
            >
              <Github className="h-4 w-4" />
            </Link>
          )}
          {user.linkedin_url && (
            <Link
              href={user.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
          )}
          {user.website_url && (
            <Link
              href={user.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Personal website"
            >
              <Globe className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
