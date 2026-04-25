import Link from "next/link";
import { Github, Linkedin, Globe, Youtube, Twitter } from "lucide-react";
import type { User } from "@/types/project";

interface ConnectedAccountsProps {
  user: User;
  hasVercelProjects: boolean;
}

function VercelIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2L24 22H0L12 2Z" />
    </svg>
  );
}

function MediumIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  );
}

function SubstackIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}

function formatUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

interface Row {
  key: string;
  icon: React.ReactNode;
  label: string;
  href: string;
}

export function ConnectedAccounts({ user, hasVercelProjects }: ConnectedAccountsProps) {
  const rows: Row[] = [];

  if (user.github_username) {
    rows.push({
      key: "github",
      icon: <Github className="h-[13px] w-[13px]" />,
      label: `github.com/${user.github_username}`,
      href: `https://github.com/${user.github_username}`,
    });
  }
  if (hasVercelProjects && user.username) {
    rows.push({
      key: "vercel",
      icon: <VercelIcon />,
      label: `vercel.com/${user.username}`,
      href: `https://vercel.com/${user.username}`,
    });
  }
  if (user.linkedin_url) {
    rows.push({
      key: "linkedin",
      icon: <Linkedin className="h-[13px] w-[13px]" />,
      label: formatUrl(user.linkedin_url),
      href: user.linkedin_url,
    });
  }
  if (user.website_url) {
    rows.push({
      key: "website",
      icon: <Globe className="h-[13px] w-[13px]" />,
      label: formatUrl(user.website_url),
      href: user.website_url,
    });
  }
  if (user.twitter_url) {
    rows.push({
      key: "twitter",
      icon: <Twitter className="h-[13px] w-[13px]" />,
      label: formatUrl(user.twitter_url),
      href: user.twitter_url,
    });
  }
  if (user.youtube_url) {
    rows.push({
      key: "youtube",
      icon: <Youtube className="h-[13px] w-[13px]" />,
      label: formatUrl(user.youtube_url),
      href: user.youtube_url,
    });
  }
  if (user.medium_url) {
    rows.push({
      key: "medium",
      icon: <MediumIcon />,
      label: formatUrl(user.medium_url),
      href: user.medium_url,
    });
  }
  if (user.substack_url) {
    rows.push({
      key: "substack",
      icon: <SubstackIcon />,
      label: formatUrl(user.substack_url),
      href: user.substack_url,
    });
  }

  if (rows.length === 0) return null;

  return (
    <div
      className="bg-white rounded-[12px] px-[18px] py-[16px]"
      style={{ border: "0.5px solid var(--border-light)" }}
    >
      <div className="text-[13px] font-medium text-text-primary">Connected</div>
      <ul className="mt-[10px] space-y-[8px]">
        {rows.map((r) => (
          <li key={r.key}>
            <Link
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[8px] text-[12px] text-text-secondary hover:text-teal transition-colors min-w-0"
            >
              <span className="text-text-muted shrink-0">{r.icon}</span>
              <span className="truncate font-mono">{r.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
