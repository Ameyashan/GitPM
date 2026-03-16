# GitPM Phase 1 — Build Tickets

> Feed each ticket to Claude Code in Cursor as a focused session.
> Always say: "Read ARCHITECTURE.md for full context before starting."
> Complete and test each ticket before moving to the next.

---

## Ticket 1: Project Scaffolding & Supabase Setup
**Estimated time: Day 1-2**

### What to build
- Initialize Next.js 14 project with App Router and TypeScript strict mode
- Install and configure Tailwind CSS + shadcn/ui
- Create Supabase project and connect to Next.js
- Set up `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`
- Create `.env.local.example` with all required environment variables
- Set up Supabase auth middleware in `middleware.ts` for session refresh
- Create the folder structure defined in ARCHITECTURE.md
- Deploy to Vercel and confirm the app loads

### Acceptance criteria
- `npm run dev` starts without errors
- Supabase client connects from both server and client components
- Deployed to Vercel at a preview URL
- Folder structure matches ARCHITECTURE.md

### Key context from blueprint
- Tech stack: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase
- Supabase free tier (500MB, 50K rows)
- Vercel Hobby tier for MVP

---

## Ticket 2: Database Schema & RLS Policies
**Estimated time: Day 2-3**

### What to build
Create all Supabase migrations in `supabase/migrations/`:

**001_users.sql**
- `users` table with all columns from ARCHITECTURE.md
- Unique constraint on `username`
- Trigger to auto-create user row on Supabase auth sign-up
- RLS: users can read/update own row, public can read display fields

**002_projects.sql**
- `projects` table with all columns from ARCHITECTURE.md
- Foreign key to `users.id`
- Unique constraint on `(user_id, slug)`
- RLS: owner has full CRUD, public can read where `is_published = true`

**003_connected_accounts.sql**
- `connected_accounts` table
- RLS: owner only (no public access)

**004_screenshots.sql**
- `screenshots` table
- RLS: owner CRUD, public read via published project join

**005_rls_policies.sql**
- Consolidated RLS policies if not inline above
- Enable RLS on all tables

Generate TypeScript types: `npx supabase gen types typescript`

### Acceptance criteria
- All migrations run cleanly on Supabase
- RLS policies prevent cross-user data access (test with two test users)
- TypeScript types generated in `types/database.ts`
- Can insert and query test data via Supabase dashboard

---

## Ticket 3: GitHub OAuth & User Onboarding
**Estimated time: Day 3-5**

### What to build
- Configure Supabase Auth with GitHub OAuth provider
- Create sign-up / sign-in flow using Supabase Auth helpers
- Build `app/api/auth/callback/route.ts` to handle GitHub OAuth redirect
- On first sign-up: extract `github_username` and `avatar_url` from GitHub profile
- Build onboarding page at `app/(auth)/onboarding/page.tsx`:
  - Fields: username (validate uniqueness), display_name, headline, bio, linkedin_url
  - Save to `users` table
  - Redirect to dashboard on completion
- Build basic navigation with auth state (sign in / sign out / avatar)
- Create `app/(auth)/dashboard/page.tsx` as an authenticated shell (placeholder content for now)

### Acceptance criteria
- User can sign up with GitHub and land on onboarding
- Onboarding saves profile and redirects to dashboard
- Username uniqueness is validated in real-time
- GitHub username and avatar are auto-populated
- Sign-out works and redirects to landing page
- Unauthenticated users are redirected from /dashboard to sign-in

---

## Ticket 4: Design System & UI Foundation
**Estimated time: Day 5-7**

### What to build

**Tailwind config with custom design tokens** in `tailwind.config.ts`:
- Add all brand colors from ARCHITECTURE.md as custom Tailwind colors:
  - `navy: #0D1B2A` (primary — headings, dark surfaces)
  - `teal: #0A7558` (verification badges, success states)
  - `purple: #6C5CE7` (build tool pills, interactive elements)
  - `forest: #2D6A4F` (secondary badges, heatmap fills)
  - `dark-surface: #1B2838` (card backgrounds in dark mode)
  - `neutral-surface: #F0F2F0` (light mode card backgrounds)
  - `border: #C8CCC8` (0.5px card edges, dividers)
- Configure fonts: Inter (body), Inter Tight or Geist (headings/stats), Geist Mono (URLs, tech pills)
- Load fonts via `next/font/google` or `next/font/local`

**shadcn/ui theming:**
- Install shadcn/ui and initialize with the dark-tilting palette
- Override default shadcn theme variables to match GitPM's design tokens
- Install these shadcn components upfront: Button, Card, Badge, Input, Textarea, Select, Dialog, Dropdown Menu, Toast (sonner), Tabs, Avatar, Skeleton, Separator

**Reusable components** in `components/shared/`:
- `Navigation.tsx` — top nav bar: GitPM logo (left), sign in/avatar+dropdown (right). Dark background (#0D1B2A). Responsive with mobile hamburger menu
- `BadgePill.tsx` — configurable pill component with variants: `tool` (purple bg), `hosting` (teal bg), `stack` (gray bg), `category` (outline). Mono font for text
- `VerifiedBadge.tsx` — "Verified Owner" badge: teal background, white text, checkmark icon. Two sizes: inline (for cards) and full (for detail pages)
- `VideoEmbed.tsx` — accepts Loom or YouTube URL, parses to extract embed ID, renders responsive 16:9 iframe. Includes play button overlay variant for card thumbnails
- `StatCard.tsx` — numeric stat with label below. Neutral surface background, no border, centered. Used in aggregate stats row
- `SectionLabel.tsx` — uppercase, 12px, muted color label used as section headers (e.g., "PROBLEM STATEMENT", "KEY DECISIONS")

**Profile components** in `components/profile/`:
- `ProfileHeader.tsx` — avatar (72px circle) + name (22px bold) + headline (14px muted) + social link icons (GitHub, LinkedIn, website). Dark navy background
- `AggregateStats.tsx` — horizontal row of StatCard components. Props: total projects, total commits, verified count
- `ToolsUsed.tsx` — horizontal row of BadgePill components with usage counts (e.g., "Cursor ×4", "Lovable ×2")
- `ProjectCard.tsx` — card component for the project grid:
  - Thumbnail area (placeholder gradient if no image) with play button overlay if video exists
  - Title + VerifiedBadge inline
  - Description (2-line clamp via `line-clamp-2`)
  - Pills row: build tool, hosting, tech stack (max 3 visible + "+N more")
  - Meta row: commit count, build time, solo/collab icon
  - Dark surface background, 0.5px border, hover state (subtle lift or border color change)
- `ProjectGrid.tsx` — 2-column grid wrapper with responsive breakpoint (1-column on mobile)

**Project detail components** in `components/project/`:
- `ProjectHero.tsx` — full-width area: VideoEmbed if video exists, or screenshot gallery with navigation. 16:9 aspect ratio container
- `TechStackPills.tsx` — row of BadgePill components for build tool (purple), hosting (teal), tech stack (gray), category (outline)
- `ProjectStats.tsx` — horizontal row of StatCards: commits, build duration, solo/collaborative, users
- `ProductContext.tsx` — renders problem statement, key decisions (with left accent line), target user, and learnings sections using SectionLabel

**Dashboard components** in `components/dashboard/`:
- `ProjectList.tsx` — list of user's projects with edit/delete/publish controls. Each row shows thumbnail, name, status badge (draft/published), and action buttons
- `ConnectionCard.tsx` — card showing a connected platform (GitHub, Vercel) with status, username, and disconnect button

**Layout shells:**
- `app/(public)/layout.tsx` — public layout: dark header with nav, lighter content area below
- `app/(auth)/layout.tsx` — authenticated layout: sidebar navigation (Dashboard, Projects, Connections, Settings) + main content area
- Both layouts use Navigation.tsx

**Storybook-style test page** (optional but recommended):
- Create `app/(auth)/dashboard/components/page.tsx` — a temporary page that renders every component with sample data so you can visually verify them all before building real pages

### Acceptance criteria
- All design tokens are defined in `tailwind.config.ts` and accessible as Tailwind classes (e.g., `bg-navy`, `text-teal`, `border-border`)
- Fonts load correctly: Inter for body, display font for headings, Geist Mono for technical text
- shadcn/ui components render with the GitPM dark-tilting theme, not default shadcn styling
- All shared components render correctly with sample/mock data
- Profile components match the blueprint spec: dark header, card-based layout, pill metadata
- ProjectCard has proper hover state, 2-line clamp, and responsive behavior
- VideoEmbed correctly handles both Loom and YouTube URLs
- Layouts render correctly: public pages have dark header + lighter content, dashboard has sidebar
- Components look intentional and polished — closer to Linear/Vercel than generic shadcn defaults
- Mobile responsive: navigation collapses, project grid goes single-column, profile header stacks

### Key design references from blueprint
- Design direction: "Dark-tilting palette. Public profiles render with a dark header/hero area (deep navy) with lighter content below. Cards use subtle dark surfaces with teal/green accents for verification and purple for interactive elements. The overall feel is closer to Linear or Raycast than to a typical SaaS landing page."
- Trust-forward: verification badges and stats are prominent, not hidden
- Scannable: card-based layout, pill-based metadata, aggregate stats at top
- PM-centric: problem statement and key decisions displayed prominently
- Minimal chrome: flat design, 0.5px borders, generous whitespace, no gradients
- Demo-first: video play button is the largest interactive element on project cards

---

## Ticket 5: Project CRUD & Public Profile
**Estimated time: Day 7-10**

### What to build

**Project creation form** at `app/(auth)/dashboard/projects/new/page.tsx`:
- Stepped form with 4 steps:
  - Step 1 (Basics): name, slug (auto-generated from name), description, live_url, category_tags
  - Step 2 (Build details): build_tools (multi-select from predefined list), hosting_platform
  - Step 3 (Product context): problem_statement (required), target_user, key_decisions, learnings
  - Step 4 (Media): demo_video_url (Loom/YouTube URL), screenshot upload (up to 6)
- Save to `projects` table via API route
- Edit project at `app/(auth)/dashboard/projects/[id]/edit/page.tsx`

**Dashboard project list** at `app/(auth)/dashboard/page.tsx`:
- List user's projects with edit/delete/publish toggle
- Drag-and-drop reordering (updates `display_order`)

**Public profile page** at `app/(public)/[username]/page.tsx`:
- Profile header: avatar, name, headline, social links
- Aggregate stats row: total projects, total commits (sum), verified count
- Project grid: 2-column card layout
  - Each card: thumbnail (placeholder if none), title, description (2-line clamp), tool/host/stack pills, meta row
- Footer: "Profile last updated X days ago"

**Project detail page** at `app/(public)/[username]/[project-slug]/page.tsx`:
- Hero: video embed or screenshot gallery
- Title + verified badge (if applicable)
- Pills: build tool, hosting, tech stack, category
- Stats: commits, build duration, solo/collaborative
- Problem statement, key decisions, target user, learnings sections

### Acceptance criteria
- Can create, edit, delete, and publish projects
- Public profile renders at `/username` with all published projects
- Project detail page renders at `/username/project-slug`
- Stepped form validates required fields (especially problem_statement)
- Cards are responsive (2-column desktop, 1-column mobile)

---

## Ticket 6: GitHub API Integration
**Estimated time: Day 10-12**

### What to build
- `lib/github.ts` — GitHub API helper using stored OAuth token
- `app/api/github/repos/route.ts` — fetch and return user's repos
- In the project form (Step 2): allow user to link a GitHub repo from a searchable dropdown
- When a repo is linked, auto-fetch and populate:
  - `commit_count` from commit history
  - `first_commit_at` from earliest commit
  - `is_solo` from unique commit authors
  - `tech_stack` parsed from `package.json` (frameworks/libraries) and GitHub languages API
- `app/api/projects/[id]/enrich/route.ts` — endpoint to re-fetch GitHub data for a project
- Store `github_repo_url` on the project

### Acceptance criteria
- Repos list loads in project form after GitHub is connected
- Selecting a repo auto-populates commit count, tech stack, and solo/collab status
- Tech stack pills render correctly on public profile
- Enrichment endpoint can refresh data on demand
- Handles rate limiting gracefully (GitHub allows 5000 req/hr with auth)

---

## Ticket 7: Vercel OAuth & Verification
**Estimated time: Day 12-14**

### What to build
- Register Vercel integration app (you'll need to do this manually in Vercel dashboard)
- `lib/vercel.ts` — Vercel API helper
- `app/api/auth/vercel/connect/route.ts` — initiate Vercel OAuth
- `app/api/auth/vercel/callback/route.ts` — handle callback, store token in `connected_accounts`
- `app/(auth)/dashboard/connections/page.tsx` — manage connected accounts (connect/disconnect Vercel)
- `app/api/vercel/deployments/route.ts` — list user's Vercel deployments
- Verification logic: when a project's `live_url` matches a Vercel deployment URL:
  - Set `is_verified = true`
  - Set `verification_method = "vercel_oauth"`
- `app/api/projects/[id]/verify/route.ts` — trigger verification check
- Auto-populate `hosting_platform = "vercel"` and `latest_deploy_at` from deployment data
- Display "Verified Owner" badge (green, teal accent) on project cards and detail pages

### Acceptance criteria
- User can connect Vercel from dashboard connections page
- Vercel deployments are listed and can be matched to projects
- Projects with matching Vercel deployments show verified badge
- Disconnecting Vercel removes verified status from affected projects
- Token is stored encrypted in `connected_accounts`

---

## Ticket 8: Lovable Detection & Media Layer
**Estimated time: Day 14-17**

### What to build

**Lovable repo detection:**
- `lib/lovable.ts` — detection logic:
  - Scan user's GitHub repos for Lovable markers: naming pattern (`lovable-*`), config files (`lovable.config.ts`, `.lovable/` directory)
  - Match detected repos to `*.lovable.app` URLs
  - If match found: set `is_verified = true`, `verification_method = "lovable_repo"`
- `app/api/github/detect-lovable/route.ts` — endpoint to trigger detection
- In project form: auto-suggest Lovable projects detected from GitHub
- Parse `package.json` from Lovable repos for tech stack (typically Vite + React)

**Demo video embedding:**
- `components/shared/VideoEmbed.tsx` — handles both Loom and YouTube URLs
  - Parse URL to extract embed ID
  - Render responsive iframe (16:9 aspect ratio)
  - Play button overlay on project cards

**Screenshot upload:**
- `app/api/upload/route.ts` — upload to Supabase Storage
- Gallery component for project detail page (up to 6 images)
- Image optimization and display order

**Auto-thumbnail generation:**
- `lib/thumbnails.ts` — Puppeteer helper to screenshot live URLs
- `app/api/cron/thumbnails/route.ts` — Vercel cron job to generate thumbnails for projects without custom ones
- Store generated thumbnails in Supabase Storage

### Acceptance criteria
- Lovable repos are auto-detected and suggested during project creation
- Lovable projects with matching *.lovable.app URLs get verified badge
- YouTube and Loom videos embed and play correctly
- Screenshots upload to Supabase Storage and display in gallery
- Thumbnails auto-generate for projects with a live_url but no custom thumbnail

---

## Ticket 9: Profile Polish & Responsive Design
**Estimated time: Day 17-20**

### What to build

**Aggregate stats section:**
- Total projects count
- Total commits (sum across all projects)
- Verified projects count
- Tools-used section: horizontal row of tool chips with usage counts

**Design polish (match blueprint spec):**
- Apply the full design system from ARCHITECTURE.md:
  - Dark-tilting palette: dark header/hero on public profiles, lighter content below
  - Color tokens: navy primary, teal verification, purple interactive
  - Typography: Inter body, Inter Tight/Geist headings, Geist Mono for URLs/pills
  - 0.5px borders, generous whitespace, flat design
- Project card refinements: thumbnail with play button overlay, verified check, 2-line clamp, pill row
- Project detail polish: hero section, stats row, dividers, product context sections

**Responsive design:**
- Mobile-first pass on all pages
- Project grid: 2-column desktop, 1-column mobile
- Navigation: mobile menu
- Profile header: stack vertically on mobile
- Test on Chrome, Safari, Firefox

**SEO:**
- `og:image` meta tags for public profiles (generate social card)
- `og:title`, `og:description` for profile and project pages
- Proper `<title>` tags and meta descriptions

### Acceptance criteria
- Public profile matches the design spec from the blueprint
- All pages are fully responsive
- Design tokens (colors, fonts, spacing) are consistent
- OG meta tags render correct preview cards when shared on LinkedIn/Twitter
- Cross-browser testing passes (Chrome, Safari, Firefox)

---

## Ticket 10: Landing Page & Onboarding Flow
**Estimated time: Day 20-22**

### What to build

**Landing page** at `app/(public)/page.tsx`:
- Value proposition: "The portfolio platform for PMs who build"
- Example profiles section (create 2-3 demo profiles with realistic data)
- Feature highlights: consolidation, verification, product context
- CTA: "Sign up with GitHub" button
- Trust signals: "Free forever for PMs", "Your projects, verified"

**Onboarding flow refinement:**
- Smooth post-signup flow: GitHub OAuth → onboarding form → "Add first project" prompt
- Progress indicator in onboarding
- Skip options for optional fields
- Welcome email via Resend on first sign-up

**Error handling pass:**
- Global error boundary
- API route error handling with typed error responses
- Toast notifications for success/error states
- Loading states and skeletons for all async data
- 404 pages for invalid usernames and project slugs

### Acceptance criteria
- Landing page loads fast and communicates the value prop in < 5 seconds
- New user can go from landing page to published profile in under 5 minutes
- All error states are handled gracefully (no white screens)
- Welcome email sends on sign-up
- 404 pages render for invalid routes

---

## Ticket 11: QA, Performance & Launch Prep
**Estimated time: Day 22-25**

### What to build

**Quality assurance:**
- Cross-browser testing: Chrome, Safari, Firefox, mobile Safari, mobile Chrome
- Test all OAuth flows end-to-end (GitHub sign-up, Vercel connect, Lovable detection)
- Test RLS policies: verify users cannot access other users' data
- Test edge cases: empty profiles, projects with no video, unverified projects

**Performance:**
- Lighthouse audit on public profile page (target: 90+ performance)
- Optimize images (next/image with proper sizing)
- Server component optimization (minimize client JS)
- Database query optimization (add indexes on username, slug, user_id)

**Rate limiting:**
- Vercel Edge Middleware: 100 req/min for public, 300 for authenticated
- GitHub API: cache responses, only fetch on project creation or manual refresh

**Launch prep:**
- Set up custom domain: gitpm.dev
- Configure Plausible/PostHog analytics
- Set up Sentry for error monitoring
- Create `.env.local.example` with all required variables documented
- Write a README with setup instructions for future contributors
- Invite 50 beta PMs and collect feedback

### Acceptance criteria
- No critical bugs in core flows
- Lighthouse performance score ≥ 90
- Rate limiting prevents abuse
- Custom domain resolves
- Analytics tracking events fire correctly
- Beta users can sign up and create profiles without support