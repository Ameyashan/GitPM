# GitPM — Phase 1 Architecture

> The portfolio platform for product managers who build.
> Phase 1 ships the consolidation layer with lightweight verification.

---

## What GitPM Does (Phase 1)

GitPM gives PMs a single shareable URL (`gitpm.dev/username`) that aggregates all their shipped projects from multiple platforms, with OAuth-verified deployment badges to prove they actually built what they claim.

Phase 1 = Profile + Projects + Multi-platform verification (GitHub, Vercel, Lovable).
No scoring, no community features, no hiring manager accounts.

---

## Tech Stack

| Layer              | Technology                    | Notes                                                                 |
|--------------------|-------------------------------|-----------------------------------------------------------------------|
| Framework          | Next.js 14 (App Router)       | Server components for public profiles, API routes for backend         |
| Language           | TypeScript (strict)           | Everywhere — frontend, API, types                                     |
| Styling            | Tailwind CSS + shadcn/ui      | Dark-tilting palette, Linear/Vercel aesthetic                         |
| Database           | Supabase (PostgreSQL)         | Built-in auth, RLS, storage, free tier                                |
| Auth               | Supabase Auth + GitHub OAuth  | GitHub OAuth = sign-up + repo access in one step                      |
| File Storage       | Supabase Storage              | Profile images, screenshots. Videos stay on Loom/YouTube (embed URLs) |
| Hosting            | Vercel                        | Hobby tier for MVP, auto-deploy from GitHub                           |
| Thumbnail Gen      | Puppeteer (serverless)        | Headless screenshots of live URLs via Vercel serverless function      |
| Transactional Email| Resend                        | Welcome emails, profile view notifications                            |
| Analytics          | PostHog or Plausible           | Privacy-friendly, event tracking for funnels                          |

---

## Folder Structure

```
gitpm/
├── app/
│   ├── (public)/                  # Public routes (no auth required)
│   │   ├── [username]/            # Public profile page
│   │   │   ├── page.tsx
│   │   │   └── [project-slug]/    # Project detail page
│   │   │       └── page.tsx
│   │   └── page.tsx               # Landing page (/)
│   ├── (auth)/                    # Auth-required routes
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── projects/
│   │   │   │   ├── new/page.tsx   # Add project (stepped form)
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── connections/page.tsx  # OAuth connections management
│   │   │   └── settings/page.tsx
│   │   └── onboarding/page.tsx    # Post-signup profile setup
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts  # GitHub OAuth callback
│   │   │   └── vercel/
│   │   │       ├── connect/route.ts
│   │   │       └── callback/route.ts
│   │   ├── projects/
│   │   │   ├── route.ts           # CRUD
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── verify/route.ts
│   │   │       └── enrich/route.ts  # Auto-detect tech stack, commits
│   │   ├── github/
│   │   │   ├── repos/route.ts
│   │   │   └── detect-lovable/route.ts
│   │   ├── vercel/
│   │   │   └── deployments/route.ts
│   │   ├── upload/route.ts        # Supabase Storage uploads
│   │   └── cron/
│   │       └── thumbnails/route.ts  # Puppeteer thumbnail generation
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── profile/                   # Public profile components
│   │   ├── ProfileHeader.tsx
│   │   ├── AggregateStats.tsx
│   │   ├── ToolsUsed.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ProjectGrid.tsx
│   ├── project/                   # Project detail components
│   │   ├── ProjectHero.tsx
│   │   ├── VerifiedBadge.tsx
│   │   ├── TechStackPills.tsx
│   │   ├── ProjectStats.tsx
│   │   └── ProductContext.tsx
│   ├── dashboard/                 # Dashboard components
│   │   ├── ProjectForm.tsx        # Stepped form
│   │   ├── ConnectionCard.tsx
│   │   └── ProjectList.tsx
│   └── shared/                    # Cross-cutting components
│       ├── VideoEmbed.tsx
│       ├── BadgePill.tsx
│       └── Navigation.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client (for server components)
│   │   ├── admin.ts               # Service role client (for public reads)
│   │   └── middleware.ts          # Session refresh middleware
│   ├── github.ts                  # GitHub API helpers
│   ├── vercel.ts                  # Vercel API helpers
│   ├── lovable.ts                 # Lovable repo detection logic
│   ├── thumbnails.ts              # Puppeteer screenshot helper
│   └── utils.ts                   # Shared utilities
├── types/
│   ├── database.ts                # Generated Supabase types
│   ├── github.ts
│   ├── vercel.ts
│   └── project.ts
├── supabase/
│   └── migrations/                # SQL migration files
│       ├── 001_users.sql
│       ├── 002_projects.sql
│       ├── 003_connected_accounts.sql
│       ├── 004_screenshots.sql
│       └── 005_rls_policies.sql
├── public/
├── .cursorrules
├── .env.local.example
├── middleware.ts                   # Supabase auth + rate limiting
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

### users
| Column          | Type              | Notes                              |
|-----------------|-------------------|------------------------------------|
| id              | UUID (PK)         | Supabase Auth UID                  |
| username        | TEXT (unique)     | URL slug: gitpm.dev/username       |
| display_name    | TEXT              | Full name                          |
| headline        | TEXT              | One-line professional headline     |
| bio             | TEXT (nullable)   | Optional longer bio                |
| avatar_url      | TEXT (nullable)   | Supabase Storage URL               |
| github_username | TEXT (nullable)   | From GitHub OAuth                  |
| linkedin_url    | TEXT (nullable)   | Manual entry                       |
| website_url     | TEXT (nullable)   | Personal site                      |
| created_at      | TIMESTAMPTZ       | Registration date                  |
| updated_at      | TIMESTAMPTZ       | Last profile edit                  |

### projects
| Column              | Type                    | Notes                                          |
|---------------------|-------------------------|-------------------------------------------------|
| id                  | UUID (PK)               | Auto-generated                                  |
| user_id             | UUID (FK → users)       | Owner                                           |
| slug                | TEXT                    | URL slug: /username/slug                        |
| name                | TEXT                    | Project display name                            |
| description         | TEXT                    | One-line description                            |
| live_url            | TEXT                    | Deployed URL                                    |
| github_repo_url     | TEXT (nullable)         | Linked GitHub repo                              |
| thumbnail_url       | TEXT (nullable)         | Auto-generated or custom                        |
| demo_video_url      | TEXT (nullable)         | Loom or YouTube embed URL                       |
| build_tools         | TEXT[]                  | Array: ["cursor", "lovable", "v0"]              |
| hosting_platform    | TEXT (nullable)         | Auto-detected: vercel, lovable, github_pages    |
| tech_stack          | TEXT[]                  | Auto from package.json or manual                |
| category_tags       | TEXT[]                  | User-selected: ["saas", "dashboard"]            |
| problem_statement   | TEXT                    | Required PM context                             |
| target_user         | TEXT (nullable)         | Optional                                        |
| key_decisions       | TEXT (nullable)         | Optional free text                              |
| learnings           | TEXT (nullable)         | Optional                                        |
| metrics_text        | TEXT (nullable)         | Manual metrics/traction                         |
| commit_count        | INTEGER (nullable)      | Auto from GitHub API                            |
| first_commit_at     | TIMESTAMPTZ (nullable)  | Auto from GitHub API                            |
| latest_deploy_at    | TIMESTAMPTZ (nullable)  | Auto from platform API                          |
| is_solo             | BOOLEAN                 | Auto from commit authors                        |
| is_verified         | BOOLEAN default false   | True if OAuth confirms ownership                |
| verification_method | TEXT (nullable)         | "vercel_oauth", "lovable_repo", "github_pages"  |
| display_order       | INTEGER                 | For manual reordering                           |
| is_published        | BOOLEAN default false   | Draft vs public                                 |
| created_at          | TIMESTAMPTZ             |                                                  |
| updated_at          | TIMESTAMPTZ             |                                                  |

### connected_accounts
| Column            | Type                    | Notes                        |
|-------------------|-------------------------|------------------------------|
| id                | UUID (PK)               |                              |
| user_id           | UUID (FK → users)       |                              |
| provider          | TEXT                    | "github", "vercel", "lovable"|
| provider_user_id  | TEXT                    | External account ID          |
| access_token      | TEXT (encrypted)        | OAuth token for API calls    |
| refresh_token     | TEXT (encrypted, nullable)|                            |
| token_expires_at  | TIMESTAMPTZ (nullable)  |                              |
| provider_username | TEXT (nullable)         | Display name on platform     |
| connected_at      | TIMESTAMPTZ             |                              |

### screenshots
| Column        | Type                   | Notes                |
|---------------|------------------------|----------------------|
| id            | UUID (PK)              |                      |
| project_id    | UUID (FK → projects)   |                      |
| image_url     | TEXT                   | Supabase Storage URL |
| display_order | INTEGER                | Gallery ordering     |
| created_at    | TIMESTAMPTZ            |                      |

---

## Row Level Security (RLS) Policies

```sql
-- Users: read own, public read display fields only
-- Projects: owner full CRUD, public read where is_published = true
-- Connected accounts: owner only (read, insert, delete)
-- Screenshots: owner CRUD, public read via published project
```

---

## Auth Flow

1. User clicks "Sign up with GitHub" → Supabase Auth handles GitHub OAuth
2. On callback: Supabase creates user, stores GitHub token
3. User completes onboarding (username, headline, bio)
4. Vercel OAuth: separate connect flow, token stored in `connected_accounts`
5. Lovable: no extra OAuth — detected via GitHub repos already connected

---

## API Integrations

### GitHub (via OAuth token from sign-up)
- `GET /user` — verify identity
- `GET /user/repos` — list repos for linking
- `GET /repos/:owner/:repo/commits` — commit count and timeline
- `GET /repos/:owner/:repo/languages` — tech stack detection
- `GET /repos/:owner/:repo` — repo metadata

### Vercel (via separate OAuth)
- `GET /v9/projects` — list user projects
- `GET /v6/deployments` — list deployments
- Verification: match project `live_url` to Vercel deployment URL

### Lovable (repo-based detection, no OAuth)
- Scan GitHub repos for Lovable markers (naming pattern `lovable-*`, config files)
- Match repo to `*.lovable.app` deployment URL
- Parse `package.json` for tech stack

---

## Design System

| Token           | Value                                               |
|-----------------|-----------------------------------------------------|
| Primary color   | #0D1B2A (deep navy) — headings, primary actions      |
| Accent 1        | #0A7558 (teal) — verification badges, success        |
| Accent 2        | #6C5CE7 (purple) — build tool pills, interactive     |
| Accent 3        | #2D6A4F (forest green) — secondary badges, heatmap   |
| Dark surface    | #1B2838 — card backgrounds in dark mode              |
| Neutral surface | #F0F2F0 — light mode card backgrounds                |
| Border          | #C8CCC8 at 0.5px                                    |
| Primary font    | Inter (body), system sans-serif fallback             |
| Display font    | Inter Tight or Geist (headings, stats)               |
| Mono font       | Geist Mono (URLs, tech pills, code)                  |
| Direction       | Dark-tilting. Public profiles: dark header/hero, lighter content below |

---

## Key Conventions

- All Supabase queries go through `lib/supabase/` helpers (never raw client in components)
- Server components by default; client components only when interactivity is required
- All API routes in `app/api/` with proper error handling and typed responses
- OAuth tokens encrypted before storage in `connected_accounts`
- Rate limiting via Vercel Edge Middleware: 100 req/min public, 300 authenticated
- CORS restricted to `gitpm.dev` only
- Environment variables follow `.env.local.example` template

---

## What Phase 1 Does NOT Include

- Build Confidence Score (Phase 2)
- Commit timeline visualization (Phase 2)
- Community features — upvotes, comments (Phase 3)
- Hiring manager accounts (Phase 3)
- Builder tiers / reputation (Phase 2)
- Netlify, Replit, Cloudflare Pages integrations (Phase 2)
- Search and discovery / explore page (Phase 2)
- Mobile app (Phase 4+)
