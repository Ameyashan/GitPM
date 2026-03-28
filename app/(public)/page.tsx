import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/landing/SignInButton";
import { getProfilesWithHeadline, type PublicProfileForLanding } from "@/lib/featured-profiles";
import { createClient } from "@/lib/supabase/server";

// Always show up-to-date featured builders (requires SUPABASE_SERVICE_ROLE_KEY at runtime).
export const dynamic = "force-dynamic";

// ------------------------------------------------------------------
// Featured profiles (server-fetched: users with published projects)
// ------------------------------------------------------------------

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Sign up with GitHub",
    description:
      "One click. We pull your repos, avatar, and profile. No forms to fill.",
  },
  {
    step: "02",
    title: "Add your projects",
    description:
      "Import from Vercel or Lovable, or paste any URL. We auto-detect the tech stack and commit history.",
  },
  {
    step: "03",
    title: "Get verified",
    description:
      "Connect your deployment platform. We confirm ownership and your profile earns a trust badge.",
  },
];

const FEATURES = [
  {
    label: "VERIFICATION",
    labelColor: "var(--teal)",
    title: "Prove you built it",
    description:
      "OAuth-verified deployment ownership. Commit history. A confidence score hiring managers can trust.",
  },
  {
    label: "CONSOLIDATION",
    labelColor: "var(--purple)",
    title: "One URL for everything",
    description:
      "Projects on Vercel, Lovable, GitHub Pages? Stop sharing 5 links. One profile, auto-detected metadata.",
  },
  {
    label: "PRODUCT THINKING",
    labelColor: "var(--forest)",
    title: "Show the why, not just the what",
    description:
      "Problem statements, key decisions, target users. The product thinking is what separates a PM from a developer.",
  },
  {
    label: "DEMO-FIRST",
    labelColor: "var(--navy)",
    title: "A 2-min video beats any resume",
    description:
      "Embed Loom or YouTube walkthroughs. Let hiring managers watch your build before the interview starts.",
  },
];

const TOOL_NAMES = ["Cursor", "Lovable", "v0", "Bolt", "Replit", "Vercel"];

// ------------------------------------------------------------------
// Subcomponents
// ------------------------------------------------------------------


function CommunityProfileCard({ profile }: { profile: PublicProfileForLanding }) {
  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: "14px",
        border: "0.5px solid var(--border-light)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      className="community-profile-card"
    >
      {profile.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt={profile.name}
          width={44}
          height={44}
          sizes="44px"
          className="shrink-0 rounded-full object-cover"
          style={{ border: "0.5px solid var(--border-light)", flexShrink: 0 }}
        />
      ) : (
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--white)",
            flexShrink: 0,
          }}
        >
          {profile.initials}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {profile.headline}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

export default async function LandingPage() {
  // If a signed-in user has no headline yet, send them straight to onboarding.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("headline")
      .eq("id", user.id)
      .single();
    if (!profile?.headline) {
      redirect("/onboarding");
    }
  }

  const communityProfiles = await getProfilesWithHeadline(12);

  return (
    <main className="flex-1 flex flex-col bg-page-bg">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="landing-hero-section flex flex-col items-center justify-center text-center bg-navy"
        style={{ padding: "80px 40px 140px" }}
      >
        <div className="relative z-[1] w-full" style={{ maxWidth: "680px" }}>

          {/* Beta badge */}
          <div
            className="inline-flex items-center gap-1.5"
            style={{
              padding: "5px 14px",
              borderRadius: "20px",
              border: "0.5px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              fontSize: "12px",
              color: "var(--teal-light)",
              letterSpacing: "0.02em",
              marginBottom: "36px",
            }}
          >
            <span
              className="pulse-dot"
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--teal-light)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Now in beta
          </div>

          {/* Headline */}
          <h1
            className="text-white"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "54px",
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              marginBottom: "20px",
            }}
          >
            <span className="block sm:hidden" style={{ fontSize: "36px" }}>
              One link to prove
              <br />
              you can{" "}
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--teal-light)",
                  fontWeight: 400,
                }}
              >
                ship
              </em>
            </span>
            <span className="hidden sm:block">
              One link to prove
              <br />
              you can{" "}
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--teal-light)",
                  fontWeight: 400,
                }}
              >
                ship
              </em>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "17px",
              color: "var(--text-inverse-muted)",
              lineHeight: 1.65,
              maxWidth: "480px",
              margin: "0 auto 36px",
              fontWeight: 300,
            }}
          >
            GitPM gives product managers a verified portfolio. Connect Vercel,
            Lovable, or GitHub. Show hiring managers the projects you actually
            built.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <SignInButton variant="white" label="Start building your profile" />
          </div>
        </div>
      </section>

      {/* ── Product Screenshot Preview ─────────────────────────────── */}
      <div
        style={{
          padding: "0 40px",
          marginTop: "-70px",
          position: "relative",
          zIndex: 10,
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
        }}
      >
        <a href="#examples" style={{ textDecoration: "none" }}>
          <div
            className="product-preview-card"
            style={{
              background: "var(--dark-surface)",
              borderRadius: "12px",
              border: "0.5px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            }}
          >
            {/* Fake browser chrome */}
            <div
              style={{
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" }}
              />
              <div
                style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" }}
              />
              <div
                style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  marginLeft: "12px",
                }}
              >
                gitpm.dev/ameyag
              </span>
            </div>

            {/* Profile preview */}
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--purple), var(--teal))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "white",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                AG
              </div>

              {/* Info + stats */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: "18px", fontWeight: 500, color: "var(--white)" }}
                >
                  Ameya Shanbhag
                </div>
                <div
                  style={{ fontSize: "13px", color: "var(--text-inverse-muted)", marginTop: "2px" }}
                >
                  Senior PM at Goldman Sachs
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                  {[
                    { value: "6", label: "Projects", color: "var(--white)" },
                    { value: "347", label: "Commits", color: "var(--white)" },
                    { value: "5", label: "Verified", color: "var(--teal-light)" },
                  ].map(({ value, label, color }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: 500, color }}>{value}</div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-inverse-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini project cards — hidden on mobile */}
              <div
                className="hidden md:grid"
                style={{
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  width: "280px",
                  flexShrink: 0,
                }}
              >
                {[
                  { name: "Metric Pulse", commits: "87 commits · 18d" },
                  { name: "ShipLog", commits: "104 commits · 24d" },
                ].map(({ name, commits }) => (
                  <div
                    key={name}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}
                    >
                      <div
                        style={{ fontSize: "12px", fontWeight: 500, color: "var(--white)" }}
                      >
                        {name}
                      </div>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8.5L6.5 12L13 4"
                          stroke="#0F9B72"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div
                      style={{ fontSize: "10px", color: "var(--text-inverse-muted)" }}
                    >
                      {commits}
                    </div>
                    <div style={{ display: "flex", gap: "3px", marginTop: "6px" }}>
                      <span
                        style={{
                          fontSize: "9px",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          background: "rgba(108,92,231,0.15)",
                          color: "var(--purple-light)",
                        }}
                      >
                        Cursor
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          background: "rgba(10,117,88,0.15)",
                          color: "var(--teal-light)",
                        }}
                      >
                        Vercel
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* ── Social Proof Strip ────────────────────────────────────── */}
      <section style={{ padding: "48px 40px 0", textAlign: "center" }}>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          PMs building with
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            flexWrap: "wrap",
            opacity: 0.5,
          }}
        >
          {TOOL_NAMES.map((tool) => (
            <span
              key={tool}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section
        style={{
          padding: "72px 40px",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Section header with line */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "var(--teal)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            How it works
          </span>
          <div
            style={{ flex: 1, height: "0.5px", background: "var(--border-light)" }}
          />
        </div>

        {/* 3-column steps */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "40px" }}
        >
          {HOW_IT_WORKS.map(({ step, title, description }) => (
            <div key={step}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--teal)",
                  marginBottom: "12px",
                }}
              >
                {step}
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  marginBottom: "6px",
                  letterSpacing: "-0.2px",
                  color: "var(--text-primary)",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────── */}
      <section
        style={{
          padding: "0 40px 72px",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{
            gap: "1px",
            background: "var(--border-light)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {FEATURES.map(({ label, labelColor, title, description }) => (
            <div
              key={label}
              style={{ padding: "32px", background: "var(--white)" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: labelColor,
                  marginBottom: "12px",
                }}
              >
                {label}
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 500,
                  marginBottom: "6px",
                  letterSpacing: "-0.2px",
                  color: "var(--text-primary)",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Example Profiles ──────────────────────────────────────── */}
      <section
        id="examples"
        style={{
          padding: "56px 40px 64px",
          background: "var(--surface-light)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 500,
                  letterSpacing: "-0.3px",
                  color: "var(--text-primary)",
                }}
              >
                PMs on GitPM
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
                Sign in to appear here.
              </p>
            </div>
          </div>

          {/* Cards — any user who has set a headline */}
          {communityProfiles.length === 0 ? (
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Be the first — sign in with GitHub and set your headline to appear here.
            </p>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-3"
              style={{ gap: "16px" }}
            >
              {communityProfiles.map((profile) => (
                <Link
                  key={profile.username}
                  href={`/${profile.username}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <CommunityProfileCard profile={profile} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA Banner ─────────────────────────────────────── */}
      <section
        style={{
          background: "var(--navy)",
          padding: "72px 40px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--teal-light)",
            letterSpacing: "0.08em",
            marginBottom: "16px",
            textTransform: "uppercase",
          }}
        >
          FREE FOREVER FOR PMS
        </p>
        <h2
          style={{
            fontSize: "36px",
            fontWeight: 300,
            color: "var(--white)",
            marginBottom: "8px",
            letterSpacing: "-0.8px",
          }}
        >
          Your builds deserve a profile
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "var(--text-inverse-muted)",
            marginBottom: "32px",
            fontWeight: 300,
          }}
        >
          Join the PMs who are proving they can ship.
        </p>
        <SignInButton variant="white" label="Get started with GitHub" />
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: "24px 40px",
          textAlign: "center",
          fontSize: "12px",
          color: "var(--text-muted)",
          borderTop: "0.5px solid var(--border-light)",
          background: "var(--page-bg)",
        }}
      >
        GitPM · The portfolio platform for PMs who build · 2026
      </footer>
    </main>
  );
}
