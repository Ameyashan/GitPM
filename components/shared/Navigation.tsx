"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ExternalLink,
  LogOut,
  LayoutDashboard,
  Menu,
  FolderOpen,
  Plug,
  Settings,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Tables } from "@/types/database";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard", icon: FolderOpen },
  { label: "Connections", href: "/dashboard/connections", icon: Plug },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface NavUser {
  id: string;
  email: string | undefined;
  profile: Pick<
    Tables<"users">,
    "username" | "display_name" | "avatar_url"
  > | null;
}

export function Navigation() {
  const [navUser, setNavUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  function isMobileNavActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

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
  }, []);

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

  return (
    <>
      <nav
        className="sticky top-0 z-[100] flex items-center justify-between"
        style={{
          background: "var(--navy)",
          height: "52px",
          padding: "0 40px",
        }}
      >
        {/* Left: hamburger (mobile, authenticated only) + logo */}
        <div className="flex items-center gap-3">
          {navUser && (
            <button
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-md transition-colors"
              style={{ color: "var(--text-inverse-muted)" }}
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo: gitpm.dev in JetBrains Mono, git=white pm=teal-light */}
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: 400,
              letterSpacing: "-0.2px",
              color: "var(--white)",
              textDecoration: "none",
            }}
          >
            git<span style={{ color: "var(--teal-light)" }}>pm</span>.dev
          </Link>
        </div>

        {/* Right: auth state */}
        <div className="flex items-center gap-5">
          {loading ? (
            <div
              className="h-6 w-16 rounded animate-pulse"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          ) : navUser ? (
            /* ── Authenticated dashboard state ── */
            <>
              {navUser.profile?.username && (
                <Link
                  href={`/${navUser.profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 transition-colors"
                  style={{
                    fontSize: "13px",
                    color: "var(--text-inverse-muted)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "var(--white)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "var(--text-inverse-muted)")
                  }
                >
                  View public profile
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="transition-colors"
                style={{
                  background: "transparent",
                  color: "var(--white)",
                  border: "0.5px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "5px 12px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.5)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.2)")
                }
              >
                Sign out
              </button>
            </>
          ) : (
            /* ── Unauthenticated landing state ── */
            <>
              <Link
                href="#example"
                className="hidden sm:block transition-colors"
                style={{
                  fontSize: "13px",
                  color: "var(--text-inverse-muted)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--white)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--text-inverse-muted)")
                }
              >
                Example profile
              </Link>

              <button
                onClick={handleSignIn}
                style={{
                  background: "var(--white)",
                  color: "var(--navy)",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
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
                Sign in with GitHub
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile navigation drawer — authenticated only */}
      {navUser && (
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
              <SheetTitle
                className="text-left"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "var(--white)",
                  letterSpacing: "-0.2px",
                }}
              >
                git<span style={{ color: "var(--teal-light)" }}>pm</span>.dev
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-0.5 px-3 py-4">
              {MOBILE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isMobileNavActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "font-medium"
                        : ""
                    )}
                    style={{
                      color: active
                        ? "var(--white)"
                        : "var(--text-inverse-muted)",
                      background: active
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out in mobile drawer */}
            <div className="px-3 pt-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
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
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
