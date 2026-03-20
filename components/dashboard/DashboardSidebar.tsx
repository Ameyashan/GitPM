"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Plug,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProfile {
  display_name: string | null;
  username: string | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Projects", href: "/dashboard", icon: FolderOpen },
  { label: "Connections", href: "/dashboard/connections", icon: Plug },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface DashboardSidebarProps {
  profile: SidebarProfile | null;
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="hidden md:flex flex-col shrink-0"
      style={{
        width: "220px",
        background: "var(--surface-card)",
        borderRight: "0.5px solid var(--border-light)",
        padding: "24px 0",
      }}
    >
      {/* User info block */}
      {profile && (
        <div
          style={{
            padding: "0 20px 20px",
            borderBottom: "0.5px solid var(--border-light)",
            marginBottom: "12px",
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Avatar initials circle */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--purple), var(--teal))",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--white)",
              }}
            >
              {getInitials(profile.display_name)}
            </div>
            <div className="min-w-0">
              <div
                className="truncate"
                style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}
              >
                {profile.display_name ?? profile.username}
              </div>
              {profile.username && (
                <div
                  className="truncate"
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    marginTop: "1px",
                  }}
                >
                  gitpm.dev/{profile.username}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex flex-col">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 transition-all",
                active ? "font-medium" : ""
              )}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                background: active ? "var(--surface-light)" : "transparent",
                borderRight: active ? "2px solid var(--teal)" : "2px solid transparent",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  (e.currentTarget as HTMLElement).style.background = "var(--surface-light)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <Icon
                className="shrink-0"
                style={{ width: "16px", height: "16px", opacity: 0.6 }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: View public profile card */}
      {profile?.username && (
        <Link
          href={`/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          style={{
            margin: "12px 12px 0",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "var(--teal-bg)",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <div
            className="flex items-center gap-1.5"
            style={{ fontSize: "12px", fontWeight: 500, color: "var(--teal)" }}
          >
            <ExternalLink style={{ width: "13px", height: "13px" }} />
            View public profile
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--teal)",
              opacity: 0.7,
              marginTop: "2px",
              fontFamily: "var(--font-mono)",
            }}
          >
            gitpm.dev/{profile.username}
          </div>
        </Link>
      )}
    </aside>
  );
}
