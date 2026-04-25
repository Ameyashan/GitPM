"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { GitPMLogo } from "@/components/shared/GitPMLogo";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Tables } from "@/types/database";

interface NavUser {
  id: string;
  email: string | undefined;
  profile: Pick<
    Tables<"users">,
    "username" | "display_name" | "avatar_url"
  > | null;
}

interface NavLinkSpec {
  label: string;
  href: string;
  badge?: "NEW";
}

function buildLinks(navUser: NavUser | null): NavLinkSpec[] {
  if (!navUser) {
    return [
      { label: "Home", href: "/" },
      { label: "Explore Projects", href: "/projects" },
      { label: "Jobs", href: "/jobs", badge: "NEW" },
    ];
  }
  const links: NavLinkSpec[] = [{ label: "Home", href: "/" }];
  if (navUser.profile?.username) {
    links.push({ label: "Profiles", href: `/${navUser.profile.username}` });
  }
  links.push(
    { label: "Explore Projects", href: "/projects" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Jobs", href: "/jobs", badge: "NEW" }
  );
  return links;
}

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/dashboard")
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NewBadge() {
  return (
    <span
      style={{
        marginLeft: 6,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "2px 6px",
        borderRadius: 4,
        background: "rgba(10,117,88,0.18)",
        color: "var(--forest, #0A7558)",
        border: "0.5px solid rgba(10,117,88,0.45)",
      }}
    >
      NEW
    </span>
  );
}

function BetaBadge({ onDark = false }: { onDark?: boolean } = {}) {
  return (
    <span
      style={{
        marginLeft: 8,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        padding: "2px 7px",
        borderRadius: 4,
        background: onDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.06)",
        color: onDark ? "var(--text-inverse-muted)" : "var(--text-muted)",
        border: onDark
          ? "0.5px solid rgba(255,255,255,0.15)"
          : "0.5px solid rgba(13,27,42,0.12)",
        textTransform: "uppercase",
      }}
    >
      BETA
    </span>
  );
}

export function Navigation() {
  const [navUser, setNavUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNavUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("username, display_name, avatar_url")
        .eq("id", user.id)
        .single();

      setNavUser({ id: user.id, email: user.email, profile });
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setNavUser(null);
        setLoading(false);
      } else {
        loadUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "read:user repo",
      },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = buildLinks(navUser);

  return (
    <>
      <nav
        className="sticky top-0 z-[100] flex items-center justify-between"
        style={{
          background: "var(--page-bg)",
          height: "52px",
          padding: "0 24px",
          borderBottom: "0.5px solid var(--border-light)",
        }}
      >
        {/* Left: hamburger (mobile) + logo + BETA */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-md transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <GitPMLogo variant="light" size="sm" />
            <BetaBadge />
          </Link>
        </div>

        {/* Center: nav links (desktop) */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  padding: "6px 14px",
                  borderRadius: 6,
                  position: "relative",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = active
                    ? "var(--text-primary)"
                    : "var(--text-secondary)")
                }
              >
                {link.label}
                {link.badge === "NEW" && <NewBadge />}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 24,
                      height: 2,
                      borderRadius: 2,
                      background: "var(--forest, #0A7558)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: auth state */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div
              className="h-6 w-16 rounded animate-pulse"
              style={{ background: "rgba(13,27,42,0.06)" }}
            />
          ) : navUser ? (
            <button
              onClick={handleSignOut}
              className="transition-colors"
              style={{
                background: "transparent",
                color: "var(--text-primary)",
                border: "0.5px solid rgba(13,27,42,0.2)",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                padding: "5px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(13,27,42,0.5)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(13,27,42,0.2)")
              }
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--navy)",
                color: "var(--white)",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                padding: "6px 14px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "0.9")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "1")
              }
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                style={{ width: 13, height: 13, flexShrink: 0 }}
              >
                <path d="M8 1C4.13 1 1 4.13 1 8c0 3.1 2 5.7 4.8 6.6.35.07.48-.15.48-.34v-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.82-.78-1.04-.78-1.04-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.24-.76.44-.94-1.56-.18-3.2-.78-3.2-3.48 0-.77.28-1.4.72-1.89-.07-.18-.31-.9.07-1.87 0 0 .59-.19 1.92.72a6.6 6.6 0 013.5 0c1.33-.91 1.92-.72 1.92-.72.38.97.14 1.69.07 1.87.45.49.72 1.12.72 1.89 0 2.71-1.65 3.3-3.22 3.48.25.22.48.65.48 1.31v1.94c0 .19.13.41.48.34C13 13.7 15 11.1 15 8c0-3.87-3.13-7-7-7z" />
              </svg>
              Sign in with GitHub
            </button>
          )}
        </div>
      </nav>

      {/* Mobile drawer — shows links for both anon and authed */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0"
          style={{
            background: "var(--navy)",
            borderRight: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <SheetHeader
            className="px-4 py-5"
            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <SheetTitle className="text-left">
              <div style={{ display: "flex", alignItems: "center" }}>
                <GitPMLogo variant="dark" size="sm" />
                <BetaBadge onDark />
              </div>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-0.5 px-3 py-4">
            {links.map((link) => {
              const active = isLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors"
                  style={{
                    color: active ? "var(--white)" : "var(--text-inverse-muted)",
                    background: active
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {link.label}
                  {link.badge === "NEW" && <NewBadge />}
                </Link>
              );
            })}
          </nav>

          {navUser && (
            <div
              className="px-3 pt-2"
              style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors"
                style={{
                  color: "var(--text-inverse-muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  textAlign: "left",
                }}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
