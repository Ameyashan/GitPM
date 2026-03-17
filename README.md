# GitPM

> The portfolio platform for product managers who build with AI coding tools.

GitPM gives PMs a single shareable URL (`gitpm.dev/username`) that aggregates all their shipped projects from multiple platforms, with OAuth-verified deployment badges to prove they actually built what they claim. Phase 1 covers profile creation, project consolidation, and multi-platform verification (GitHub, Vercel, Lovable).

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components by default |
| Language | TypeScript (strict) | No `any`, no `@ts-ignore` |
| Styling | Tailwind CSS + shadcn/ui | Dark-tilting design system |
| Database | Supabase (PostgreSQL) | Auth, RLS, Storage |
| Auth | Supabase Auth + GitHub OAuth | Single OAuth for sign-up + repo access |
| Hosting | Vercel | Hobby tier for MVP |
| Email | Resend | Welcome emails, notifications |
| Analytics | PostHog | Privacy-respecting event tracking |
| Monitoring | Sentry | Error capture across client, server, edge |

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9+ (or pnpm / yarn)
- **Supabase CLI** — `npm install -g supabase`
- A [Supabase](https://supabase.com) project
- A [GitHub OAuth App](https://github.com/settings/developers)
- A [Vercel Integration](https://vercel.com/docs/integrations) (for Vercel verification feature)

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/gitpm.git
cd gitpm
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in every value. See [Environment Variables](#environment-variables) below for details on each one.

### 3. Run Supabase migrations

Apply all schema migrations to your Supabase project via the dashboard:

1. Open the [Supabase SQL editor](https://supabase.com/dashboard/project/_/sql)
2. Paste and run the contents of `supabase/migrations/combined_run_in_dashboard.sql`

This creates all tables, RLS policies, triggers, and indexes in one shot.

Alternatively, use the Supabase CLI if you have it linked:

```bash
supabase db push
```

### 4. Generate TypeScript types

After running migrations, regenerate types to keep `types/database.ts` in sync:

```bash
npx supabase gen types typescript --project-id your_project_id > types/database.ts
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app will prompt you to sign in with GitHub.

---

## Environment Variables

All required variables are documented in [`.env.local.example`](.env.local.example). Key groups:

| Group | Variables | Where to get them |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API |
| GitHub OAuth | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub → Settings → Developer settings → OAuth Apps |
| Vercel Integration | `VERCEL_CLIENT_ID`, `VERCEL_CLIENT_SECRET` | Vercel dashboard → Integrations |
| Token encryption | `TOKEN_ENCRYPTION_KEY` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| Email | `RESEND_API_KEY` | [resend.com](https://resend.com) |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | [sentry.io](https://sentry.io) |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | [posthog.com](https://posthog.com) |
| Thumbnails | `CHROME_EXECUTABLE_PATH` | Local Chrome path (dev only; leave unset on Vercel) |

---

## OAuth Setup

### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New OAuth App
2. Set **Authorization callback URL** to:
   - Local: `http://localhost:3000/api/auth/callback`
   - Production: `https://gitpm.dev/api/auth/callback`
3. Copy the Client ID and Client Secret into `.env.local`
4. In Supabase dashboard → Auth → Providers → GitHub, enter the same Client ID and Secret

### Vercel Integration

1. Go to [Vercel Integrations](https://vercel.com/docs/integrations) and create a new integration
2. Set the redirect URL to `https://gitpm.dev/api/auth/vercel/callback`
3. Copy the Client ID and Secret into `.env.local`

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com/new)
2. Add all environment variables from `.env.local` to the Vercel project settings
3. Add `SENTRY_AUTH_TOKEN` in Vercel environment variables for source map uploads
4. Set up the custom domain `gitpm.dev` in Vercel → Domains
5. Vercel will auto-deploy on every push to `main`

The cron job for thumbnail generation runs every 6 hours automatically via `vercel.json`.

---

## Project Structure

```
app/
  (auth)/         # Authenticated routes (dashboard, onboarding, settings)
  (public)/       # Public routes (landing page, profile pages)
  api/            # API routes (projects CRUD, GitHub, Vercel, auth callbacks)
components/
  dashboard/      # Dashboard-specific components
  profile/        # Public profile components
  project/        # Project detail components
  shared/         # Cross-cutting components (Navigation, BadgePill, etc.)
  ui/             # shadcn/ui base components
lib/
  supabase/       # Supabase client helpers (client, server, admin, middleware)
  github.ts       # GitHub API helpers
  vercel.ts       # Vercel API helpers
  lovable.ts      # Lovable repo detection
  thumbnails.ts   # Puppeteer screenshot helper
supabase/
  migrations/     # SQL migration files (run via dashboard or CLI)
types/
  database.ts     # Generated Supabase types
  project.ts      # Shared project types
```

---

## Contributing

### Git Conventions

Commit messages follow the `type: description` format:

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behaviour change |
| `style` | Formatting, whitespace |
| `docs` | Documentation only |
| `chore` | Build, config, dependency updates |

One logical change per commit. Keep PRs focused.

### Code Rules

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Server components by default; use `"use client"` only when required
- All Supabase queries go through `lib/supabase/` helpers — never raw client in components
- All API routes must validate input with Zod
- RLS enabled on every table — never disable it

See [`.cursorrules`](.cursorrules) for the full coding standards and [ARCHITECTURE.md](ARCHITECTURE.md) for system-level decisions.

---

## QA Checklist (pre-launch)

- [ ] Cross-browser: Chrome, Safari, Firefox, mobile Safari, mobile Chrome
- [ ] GitHub OAuth sign-up → onboarding → dashboard → publish project
- [ ] Vercel OAuth connect → project verification badge
- [ ] Lovable repo detection → verified badge
- [ ] Empty states: profile with no projects, project with no video, unverified project
- [ ] RLS: confirm user A cannot read/write user B's projects or connected accounts
- [ ] Lighthouse score ≥ 90 on public profile page
- [ ] OG image preview on LinkedIn and Twitter
- [ ] Rate limiting: configure Upstash Redis (see `middleware.ts` TODO)
- [ ] Custom domain `gitpm.dev` resolves in Vercel
- [ ] Sentry receives a test error (trigger via `?debug=throw` or manually)
- [ ] PostHog receives pageview events after sign-in
