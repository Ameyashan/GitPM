"use client";

import { BadgePill } from "@/components/shared/BadgePill";
import { StatCard } from "@/components/shared/StatCard";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { VerifiedBadge } from "@/components/project/VerifiedBadge";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AggregateStats } from "@/components/profile/AggregateStats";
import { ToolsUsed } from "@/components/profile/ToolsUsed";
import { ProjectCard } from "@/components/profile/ProjectCard";
import { ProjectGrid } from "@/components/profile/ProjectGrid";
import { ProjectStats } from "@/components/project/ProjectStats";
import { TechStackPills } from "@/components/project/TechStackPills";
import { ProductContext } from "@/components/project/ProductContext";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { ConnectionCard } from "@/components/dashboard/ConnectionCard";
import { Separator } from "@/components/ui/separator";
import type { User, Project } from "@/types/project";

const MOCK_USER: User = {
  id: "mock-user-1",
  username: "alexpm",
  display_name: "Alex Rivera",
  headline: "Senior PM @ Acme · Built 6 shipped products with AI tools",
  bio: "I believe the best PMs ship code. Using Cursor and Lovable to build real products, not just decks.",
  avatar_url: null,
  github_username: "alexrivera",
  linkedin_url: "https://linkedin.com/in/alexrivera",
  website_url: "https://alexrivera.pm",
  medium_url: null,
  substack_url: null,
  youtube_url: null,
  twitter_url: null,
  github_contributions: null,
  github_contributions_synced_at: null,
  profile_view_count: 0,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
};

const MOCK_PROJECT: Project = {
  id: "mock-project-1",
  user_id: "mock-user-1",
  slug: "gitpm-mvp",
  name: "GitPM MVP",
  description:
    "A portfolio platform for PMs who build with AI tools — aggregate all your shipped projects with OAuth-verified deployment badges.",
  live_url: "https://gitpm.dev",
  github_repo_url: "https://github.com/alexrivera/gitpm",
  thumbnail_url: null,
  demo_video_url: null,
  build_tools: ["cursor", "v0"],
  hosting_platform: "vercel",
  tech_stack: ["Next.js", "Supabase", "Tailwind"],
  category_tags: ["saas", "portfolio"],
  problem_statement:
    "PMs who build with AI tools have no credible way to showcase their shipped products. LinkedIn doesn't cut it and GitHub profiles are built for engineers.",
  target_user: "Product managers who use AI coding tools to ship real products.",
  key_decisions:
    "Chose Supabase over Planetscale for auth + storage in one. Used App Router server components for public profile performance. Opted for Puppeteer thumbnails over manual uploads.",
  learnings:
    "Lovable detection is harder than expected — many repos don't follow the naming convention. OAuth scoping matters a lot for UX.",
  metrics_text: "50 beta users, 120 projects created",
  commit_count: 87,
  first_commit_at: "2024-03-01T09:00:00Z",
  latest_deploy_at: "2024-06-01T14:30:00Z",
  is_solo: true,
  is_verified: true,
  verification_method: "vercel_oauth",
  display_order: 1,
  is_published: true,
  created_at: "2024-03-01T09:00:00Z",
  updated_at: "2024-06-01T14:30:00Z",
};

const MOCK_PROJECTS: Project[] = [
  MOCK_PROJECT,
  {
    ...MOCK_PROJECT,
    id: "mock-project-2",
    slug: "demand-pulse",
    name: "DemandPulse",
    description:
      "Real-time demand sensing dashboard for e-commerce ops teams. Reduced stockout events by 34%.",
    build_tools: ["lovable"],
    hosting_platform: "lovable",
    tech_stack: ["React", "Vite"],
    is_verified: true,
    verification_method: "lovable_repo",
    commit_count: 42,
    is_solo: false,
  },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-mono text-purple uppercase tracking-widest">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ComponentShowcasePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-12 w-full">
      <div>
        <p className="text-xs font-mono text-teal uppercase tracking-widest mb-1">
          Internal
        </p>
        <h1 className="text-2xl font-display font-bold text-white">
          Component Showcase
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Visual verification of all Ticket 4 components with mock data.
        </p>
      </div>

      <Separator className="bg-gitpm-border/20" />

      {/* Shared primitives */}
      <Section title="BadgePill">
        <div className="flex flex-wrap gap-2">
          <BadgePill label="cursor" variant="purple" />
          <BadgePill label="lovable" variant="purple" />
          <BadgePill label="vercel" variant="teal" />
          <BadgePill label="lovable.app" variant="teal" />
          <BadgePill label="Next.js" variant="default" />
          <BadgePill label="React" variant="default" />
          <BadgePill label="saas" variant="forest" />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="StatCard">
        <div className="flex items-center gap-8">
          <StatCard value={87} label="Commits" />
          <StatCard value={6} label="Projects" />
          <StatCard value={4} label="Verified" accent="teal" />
          <StatCard value="12w" label="Build time" />
          <StatCard value="Solo" label="Team size" accent="purple" />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="SectionLabel">
        <div className="space-y-1">
          <SectionLabel>Problem Statement</SectionLabel>
          <SectionLabel>Key Decisions</SectionLabel>
          <SectionLabel>Target User</SectionLabel>
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="VerifiedBadge — inline + full">
        <div className="flex flex-wrap gap-3">
          <VerifiedBadge method="vercel_oauth" size="inline" />
          <VerifiedBadge method="lovable_repo" size="inline" />
          <VerifiedBadge method="vercel_oauth" size="full" />
          <VerifiedBadge method="lovable_repo" size="full" />
          <VerifiedBadge method="github_pages" size="full" />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ProfileHeader">
        <div className="rounded-xl bg-navy/60 p-6">
          <ProfileHeader user={MOCK_USER} tierLabel="Builder" skillPills={["React", "TypeScript", "Next.js"]} verifiedSources={["vercel_oauth"]} />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="AggregateStats">
        <div className="rounded-xl bg-surface-dark/40 border border-gitpm-border/30 p-5">
          <AggregateStats
            totalProjects={6}
            totalCommits={342}
            verifiedCount={4}
            profileViews={128}
            newProjectsThisQuarter={2}
          />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ToolsUsed">
        <ToolsUsed
          tools={[
            { name: "Cursor", count: 4 },
            { name: "Lovable", count: 2 },
            { name: "v0", count: 1 },
          ]}
        />
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ProjectCard">
        <div className="max-w-sm">
          <ProjectCard project={MOCK_PROJECT} onClick={() => {}} />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ProjectGrid">
        <ProjectGrid projects={MOCK_PROJECTS} user={MOCK_USER} />
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="TechStackPills">
        <TechStackPills
          buildTools={["cursor", "v0"]}
          hosting="vercel"
          stack={["Next.js", "Supabase", "Tailwind"]}
          categories={["saas"]}
        />
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ProjectStats">
        <div className="rounded-xl bg-surface-dark/40 border border-gitpm-border/30 p-5">
          <ProjectStats project={MOCK_PROJECT} />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ProductContext">
        <div className="rounded-xl bg-surface-dark/40 border border-gitpm-border/30 p-5">
          <ProductContext project={MOCK_PROJECT} />
        </div>
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ProjectList (Dashboard)">
        <ProjectList projects={MOCK_PROJECTS} />
      </Section>

      <Separator className="bg-gitpm-border/20" />

      <Section title="ConnectionCard">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "560px" }}>
          <ConnectionCard
            provider="github"
            isConnected={true}
            statusText="Connected"
            infoText="@alexrivera"
            actionVariant="disconnect"
          />
          <ConnectionCard
            provider="vercel"
            isConnected={false}
            statusText="Not connected"
            actionVariant="connect"
            connectHref="/api/auth/vercel/connect"
          />
        </div>
      </Section>
    </div>
  );
}
