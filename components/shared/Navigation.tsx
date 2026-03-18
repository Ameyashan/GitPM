"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Github,
  LogOut,
  LayoutDashboard,
  User,
  Menu,
  FolderOpen,
  Plug,
  Settings,
} from "lucide-react";
import type { Tables } from "@/types/database";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects/new", icon: FolderOpen },
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
    <nav className="border-b border-gitpm-border/50 bg-navy sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger — only shown for authenticated dashboard users */}
          {navUser && (
            <button
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-white/60 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/"
            className="font-display font-bold text-white tracking-tight hover:text-white/80 transition-colors"
          >
            GitPM
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
          ) : navUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple/60"
                aria-label="User menu"
              >
                {navUser.profile?.avatar_url ? (
                  <Image
                    src={navUser.profile.avatar_url}
                    alt={navUser.profile.display_name ?? "Avatar"}
                    width={32}
                    height={32}
                    className="rounded-full ring-1 ring-white/20"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple" />
                  </div>
                )}
                <span className="text-sm text-white/80 hidden sm:block">
                  {navUser.profile?.username ?? navUser.email}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 bg-surface-dark border-gitpm-border/50"
              >
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-white truncate">
                    {navUser.profile?.display_name ?? navUser.email}
                  </p>
                  {navUser.profile?.username && (
                    <p className="text-xs text-white/40 truncate">
                      @{navUser.profile.username}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-gitpm-border/30" />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {navUser.profile?.username && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer"
                    onClick={() =>
                      router.push(`/${navUser.profile!.username}`)
                    }
                  >
                    <User className="h-4 w-4" />
                    Public Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gitpm-border/30" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-white/60 hover:text-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={handleSignIn}
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-white text-navy hover:bg-white/90 font-medium gap-2"
              )}
            >
              <Github className="h-4 w-4" />
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>

    {/* Mobile navigation drawer — only rendered when authenticated */}
    {navUser && (
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-64 bg-navy border-gitpm-border/20 p-0"
        >
          <SheetHeader className="px-4 py-5 border-b border-gitpm-border/20">
            <SheetTitle className="font-display font-bold text-white text-left">
              GitPM
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
                      ? "bg-white/8 text-white font-medium"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    )}
    </>
  );
}
