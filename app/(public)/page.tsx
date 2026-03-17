import {
  CheckCircle,
  Link2,
  FileText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SignInButton } from "@/components/landing/SignInButton";
import { BadgePill } from "@/components/shared/BadgePill";

// ------------------------------------------------------------------
// Static mock data — no DB calls, zero latency
// ------------------------------------------------------------------

interface MockProject {
  name: string;
  description: string;
  buildTool: string;
  hosting: string;
  stack: string;
  verified: boolean;
  commits: number;
}

interface MockProfile {
  username: string;
  displayName: string;
  headline: string;
  avatarInitials: string;
  avatarColor: string;
  projects: MockProject[];
}

const MOCK_PROFILES: MockProfile[] = [
  {
    username: "alexchen",
    displayName: "Alex Chen",
    headline: "Senior PM at Stripe · Shipping with Cursor + v0",
    avatarInitials: "AC",
    avatarColor: "#6C5CE7",
    projects: [
      {
        name: "InvoiceFlow",
        description:
          "Automated invoice reconciliation for finance teams. Reduced manual work by 80%.",
        buildTool: "cursor",
        hosting: "vercel",
        stack: "Next.js",
        verified: true,
        commits: 142,
      },
      {
        name: "MetricsBoard",
        description:
          "Real-time dashboard pulling from Stripe, Mixpanel, and Postgres in one view.",
        buildTool: "v0",
        hosting: "vercel",
        stack: "React",
        verified: true,
        commits: 87,
      },
    ],
  },
  {
    username: "priyankam",
    displayName: "Priyanka M.",
    headline: "Product @ Notion · Building internal tools with Lovable",
    avatarInitials: "PM",
    avatarColor: "#0A7558",
    projects: [
      {
        name: "FeatureVault",
        description:
          "Internal feature flag manager with Slack integration. 30 engineers use it daily.",
        buildTool: "lovable",
        hosting: "lovable",
        stack: "React",
        verified: true,
        commits: 64,
      },
      {
        name: "UserResearchHub",
        description:
          "Centralised repo for user interview notes with AI summaries and tagging.",
        buildTool: "cursor",
        hosting: "vercel",
        stack: "Next.js",
        verified: false,
        commits: 39,
      },
    ],
  },
];

const FEATURES = [
  {
    icon: Link2,
    iconColor: "text-purple",
    iconBg: "bg-purple/10",
    title: "One URL for everything you've shipped",
    description:
      "Aggregate all your projects from GitHub, Vercel, and Lovable into a single shareable portfolio at gitpm.dev/yourname.",
  },
  {
    icon: ShieldCheck,
    iconColor: "text-teal",
    iconBg: "bg-teal/10",
    title: "OAuth-verified deployment badges",
    description:
      "Connect your platforms. GitPM confirms you actually deployed what you claim — no more taking your word for it.",
  },
  {
    icon: FileText,
    iconColor: "text-forest",
    iconBg: "bg-forest/10",
    title: "PM-native product context",
    description:
      "Each project shows your problem statement, key decisions, and learnings — not just a README and a demo link.",
  },
];

const TRUST_ITEMS = [
  "Free forever for PMs",
  "GitHub OAuth — no new password",
  "Your projects, verified",
  "No hiring manager gatekeeping",
];

// ------------------------------------------------------------------
// Subcomponents
// ------------------------------------------------------------------

function MockProfileCard({ profile }: { profile: MockProfile }) {
  return (
    <div className="rounded-xl border border-gitpm-border/30 bg-surface-dark/60 overflow-hidden">
      {/* Profile header */}
      <div className="bg-navy/80 border-b border-gitpm-border/20 px-5 py-4 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: profile.avatarColor }}
        >
          {profile.avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">
            {profile.displayName}
          </p>
          <p className="text-white/40 text-xs leading-tight truncate">
            {profile.headline}
          </p>
        </div>
      </div>

      {/* Projects */}
      <div className="px-5 py-4 space-y-3">
        {profile.projects.map((project) => (
          <div
            key={project.name}
            className="rounded-lg border border-gitpm-border/20 bg-navy/40 px-3 py-3"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-white text-sm font-medium leading-tight">
                {project.name}
              </p>
              {project.verified && (
                <span className="flex-shrink-0 flex items-center gap-1 text-teal text-xs font-mono">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-white/40 text-xs leading-snug line-clamp-2 mb-2">
              {project.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <BadgePill variant="purple" label={project.buildTool} />
              <BadgePill variant="teal" label={project.hosting} />
              <BadgePill variant="default" label={project.stack} />
              <span className="ml-auto text-xs text-white/25 font-mono">
                {project.commits} commits
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <p className="text-xs font-mono text-white/20">
          gitpm.dev/{profile.username}
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-purple/5 blur-3xl" />
        </div>

        <p className="relative text-xs font-mono text-teal uppercase tracking-widest mb-5">
          Portfolio for PMs who build with AI
        </p>

        <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight mb-6 max-w-3xl">
          Your shipped projects.{" "}
          <span className="text-teal">Verified.</span>
        </h1>

        <p className="relative text-lg sm:text-xl text-white/50 mb-10 max-w-xl leading-relaxed">
          One shareable URL that aggregates every project you&apos;ve
          shipped — with OAuth-confirmed deployment badges from GitHub,
          Vercel, and Lovable.
        </p>

        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          <SignInButton size="lg" label="Sign up with GitHub — it's free" />
          <a
            href="#examples"
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            See an example
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Trust tagline */}
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="text-xs text-white/25 font-mono">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-20 border-t border-gitpm-border/20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest text-center mb-12">
            Why GitPM
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gitpm-border/25 bg-surface-dark/40 p-6"
                >
                  <div
                    className={`h-10 w-10 rounded-lg ${feature.iconBg} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Example Profiles ──────────────────────────────────────── */}
      <section id="examples" className="px-4 py-16 sm:py-20 border-t border-gitpm-border/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-3">
              Real portfolios. Verified by deployment.
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              What your profile looks like
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_PROFILES.map((profile) => (
              <MockProfileCard key={profile.username} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────── */}
      <section className="border-t border-gitpm-border/20 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 leading-tight">
            Start building your verified portfolio
          </h2>
          <p className="text-white/40 mb-8 text-base">
            Connect GitHub. Add your projects. Share one URL.
          </p>
          <SignInButton size="lg" label="Sign up with GitHub — it's free" />
        </div>
      </section>
    </main>
  );
}
