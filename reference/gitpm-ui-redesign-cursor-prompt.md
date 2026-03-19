# GitPM UI Redesign — Cursor Prompt

> **Goal:** Restyle the GitPM app to match the attached design mockup. This is a **pure appearance/UI overhaul** — no feature additions, no new functionality, no data model changes. Every page and component that exists today should still exist and work the same way afterward; it should just *look* different.

---

## 1. Global Theme Change: Dark → Light

The single biggest change across the entire app is switching from a **dark navy theme** to a **warm light theme**. This affects every page.

### Color Palette (CSS custom properties to define globally)

```
--navy: #0D1B2A           (used for nav bar, hero sections, CTA banners — NOT page backgrounds)
--navy-mid: #152238
--navy-light: #1E3150
--dark-surface: #1B2838   (project card hero areas only)
--teal: #0A7558
--teal-light: #0F9B72
--teal-bg: #0A75581a
--purple: #6C5CE7
--purple-light: #8B7EF0
--purple-bg: #6C5CE71a
--forest: #2D6A4F
--forest-bg: #2D6A4F1a
--surface-light: #EDECEA  (light warm gray, used for section backgrounds)
--surface-card: #FFFFFF
--border: #C8C5BE
--border-light: #DDD9D3
--text-primary: #0D1B2A   (dark text on light backgrounds)
--text-secondary: #555B6E
--text-muted: #8A8F9C
--text-inverse: #E8ECF0   (light text on dark backgrounds — hero, nav)
--text-inverse-muted: #9BA8B9
--white: #FFFFFF
--page-bg: #F5F3EE        (warm off-white — THE MAIN PAGE BACKGROUND)
```

### Typography (load from Google Fonts)

```
--font-body: 'DM Sans', system-ui, sans-serif
--font-mono: 'JetBrains Mono', monospace
--font-serif: 'Instrument Serif', Georgia, serif
```

Load: `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap`

### Border Radius

```
--radius: 10px
--radius-lg: 14px
```

### Key global rules

- `body` background changes from dark navy to `var(--page-bg)` (#F5F3EE warm off-white).
- All card and content area backgrounds become `var(--white)` (#FFFFFF).
- All text on light backgrounds uses `var(--text-primary)` / `var(--text-secondary)` / `var(--text-muted)`.
- Borders throughout the app change from the current subtle dark borders to `0.5px solid var(--border-light)` (#DDD9D3).
- The navy color is ONLY used for: the top nav bar, profile hero section background, landing page hero, and CTA banner sections.

---

## 2. Navigation Bar

**Current:** Dark nav bar with "GitPM" logo text (white, no special styling) and user avatar + name on right.

**Target:**
- Keep the dark navy background (`--navy`), height 52px, sticky top.
- Logo becomes monospace styled: `git` in white + `pm` in teal (`--teal-light`) + `.dev` — rendered in `JetBrains Mono`, 14px, font-weight 400, letter-spacing -0.2px. The format is `gitpm.dev`.
- Right side: navigation links in `--text-inverse-muted` (13px), hovering to white. Include a "Sign in with GitHub" button (white bg, navy text, 12px, 6px 14px padding, border-radius 6px) on the landing page. On the dashboard, show "View public profile" link and a ghost-style "Sign out" button (transparent bg, white text, 0.5px white border at 20% opacity).
- Remove the current user avatar/photo from the nav. The nav should be clean and minimal.

---

## 3. Landing Page

The landing page needs the most dramatic visual overhaul.

### Hero Section
**Current:** Full-dark background, "Your shipped projects. Verified." headline in white with "Verified" in green, description below, green CTA button + outline "See an example" button, trust badges below.

**Target:**
- Keep the dark navy background for the hero section only.
- Add subtle radial gradient overlays: a teal-tinted one (8% opacity, 900px circle) in the upper-right and a purple-tinted one (6% opacity, 700px circle) in the lower-left. These are purely decorative.
- Add a small pill/badge above the headline: "Now in beta" with a pulsing green dot, styled as a subtle bordered pill (border: 0.5px solid rgba(255,255,255,0.08), background: rgba(255,255,255,0.03), text in teal-light, font-size 12px).
- **Headline:** Change from the current layout to: "One link to prove / you can *ship*" where "ship" is in italic serif font (`Instrument Serif`) and colored teal-light. The headline should be `DM Sans`, 54px, font-weight 300, white, line-height 1.08, letter-spacing -1.5px. Use `<strong>` for weight 500 emphasis and `<em>` with the serif font for "ship".
- **Subtitle:** 17px, `--text-inverse-muted`, font-weight 300, line-height 1.65, max-width 480px, centered. Text: "GitPM gives product managers a verified portfolio. Connect Vercel, Lovable, or GitHub. Show hiring managers the projects you actually built."
- **CTA buttons:** Two side-by-side: (1) Primary: white background, navy text, 14px, font-weight 500, padding 13px 28px, border-radius 8px, with a GitHub icon. On hover: translateY(-1px) + box-shadow. (2) Secondary: transparent background, white text, 0.5px border at 25% white opacity. No box-shadow.
- Below CTAs: small text "Free forever. No credit card. Takes 3 minutes." in 12px, inverse-muted, 70% opacity.

### Product Screenshot Preview (NEW visual element)
**Current:** Does not exist.

**Target:** Below the hero, overlapping it by about 70px (negative margin-top), add a dark card that acts as a "browser window preview" of a profile. This card has:
- A fake browser chrome bar (3 small circles + a URL in monospace).
- Inside: a mini profile preview showing avatar initials, name, headline, stats (projects/commits/verified), and two mini project cards.
- Dark surface background, rounded corners (12px), subtle border, strong box-shadow (0 24px 80px rgba(0,0,0,0.4)).
- On hover: translateY(-4px) lift effect.
- This is a static visual element (clickable to navigate to example profile).

### Social Proof Strip
**Current:** Trust badges ("Free forever for PMs", "GitHub OAuth", etc.) shown as a horizontal row below CTA.

**Target:** Replace with a "PMs building with" strip showing tool names (Cursor, Lovable, v0, Bolt, Replit, Vercel) in monospace font at 50% opacity. Small uppercase label above: "PMs building with" in 12px, muted, uppercase, letter-spacing 0.08em.

### How It Works Section (NEW visual treatment)
**Current:** "WHY GITPM" section with 3 bordered feature cards in a grid.

**Target:** Replace with a "How it works" section with 3 numbered steps:
- Section header: "How it works" in teal, uppercase, 12px, with a horizontal line extending to the right.
- Three columns, each with: step number in monospace teal (e.g., "01"), a bold title (16px, weight 500), and description paragraph (14px, text-secondary).
- Steps: 01 "Sign up with GitHub", 02 "Add your projects", 03 "Get verified".
- No card borders — clean open layout.

### Features Grid
**Current:** 3-card grid with icons.

**Target:** Replace with a 2x2 grid of feature blocks, separated by 1px borders (achieved via background color on the grid container with gap:1px). Each cell has white background, 32px padding. Each has:
- A small monospace label in a different color per feature (teal for "VERIFICATION", purple for "CONSOLIDATION", forest for "PRODUCT THINKING", navy for "DEMO-FIRST").
- A title (17px, weight 500) and description (13px, text-secondary).

### Example Profiles Section
**Current:** "What your profile looks like" with 2 large example profile cards showing nested project sub-cards.

**Target:** Replace with 3 simpler profile cards in a row. Each card has:
- White background, rounded corners (14px), 0.5px border, 20px padding.
- Top row: colored avatar circle (44px, gradient), name (14px bold), role (12px muted).
- Stats row: "X projects · Y commits · Z verified" in monospace 12px.
- Tool pills at bottom.
- On hover: border darkens, translateY(-2px).
- Section has a light background (`--surface-light`).

### Bottom CTA Banner
**Current:** "Start building your verified portfolio" with serif headline on dark background.

**Target:** Keep the dark navy background. Add:
- A small monospace label: "FREE FOREVER FOR PMS" in teal-light, uppercase.
- Headline: "Your builds deserve a profile" in 36px, weight 300, white, letter-spacing -0.8px.
- Subtitle: "Join the PMs who are proving they can ship." in 15px, inverse-muted.
- White CTA button with GitHub icon.

### Footer
**Current:** Not visible / part of dark background.

**Target:** Simple single line: "GitPM · The portfolio platform for PMs who build · 2026" in 12px muted text, centered, with top border (0.5px solid border-light), padding 24px 40px.

---

## 4. Profile Page (Public View)

### Profile Hero
**Current:** Dark background with photo avatar, name, headline, stats displayed inline with dividers, a "BUILT WITH" section showing tool pills.

**Target:**
- Keep dark navy background for the hero area.
- Replace photo with an **initials avatar** (64px circle, gradient from purple to teal, white text, 22px font-size). This is a display change — use the user's initials instead of their photo.
- Name: 24px, weight 500, white.
- Headline: 14px, `--text-inverse-muted`, weight 300, max-width 520px.
- Add social links row below headline: GitHub and LinkedIn links in monospace 12px, inverse-muted, with small icons. On hover: teal-light color.

### Stats Row
**Current:** Stats (Projects, Commits, Verified) shown inline in the hero area with dividers.

**Target:** Pull the stats into a separate **floating stats bar** that overlaps the hero/content boundary (margin-top: -28px, position: relative, z-index: 10). This bar is:
- A 5-column grid (Projects, Commits, Verified, Avg score, Users).
- White background cards separated by 1px gaps (achieved with border-light background color on the container).
- Rounded corners (14px), subtle box-shadow.
- Each cell: stat value in 22px monospace weight 500, label in 10px uppercase muted.

### Tier Card (NEW)
**Current:** Does not exist.

**Target:** Below the stats, add a "tier card" showing the user's builder tier:
- Horizontal card with: teal icon (star) in a circle, tier name ("Verified builder"), tier description, and a heatmap grid on the right showing build activity (12 weeks of small colored squares).

### Tools Section
**Current:** "BUILT WITH" shown in the hero area.

**Target:** Move to the light content area below the stats. Section header with "Tools used" label and a horizontal line. Tool chips displayed as small bordered pills with count badges (e.g., "Cursor 4").

### Project Grid
**Current:** 2-column grid of project cards with dark hero images showing the project screenshot, title, description, tool pills, and a "Solo" indicator.

**Target:** Keep the 2-column grid. Restyle each card:
- White background, 0.5px border-light border, rounded corners (14px).
- **Card hero area** (120px height): dark surface background with abstract mesh blobs (colored blurred circles at low opacity) and a wireframe placeholder graphic. If the project has a video, show a play button (white circle with navy play arrow).
- **Card body** (white, padded): title row with project name (15px weight 500) and a "Verified" inline badge (teal background, teal text, small checkmark icon). Description (13px, text-secondary, 2-line clamp). Pill row: tool pills (purple-bg), host pills (teal-bg), stack pills (surface-light bg). Meta row: commits, days, users in 11px monospace muted, plus a confidence score dot + number aligned right.

---

## 5. Project Detail Modal

**Current:** Full page view showing project screenshot at top, then title, description, tool pills, URL, stats, problem statement, and PM context sections.

**Target:** Change to a **modal overlay** (not a full page):
- Backdrop: semi-transparent navy (rgba(13,27,42,0.5)) with backdrop-filter: blur(4px).
- Modal card: white, max-width 700px, centered, rounded corners (12px), slide-up animation.
- Close button: top-right, 32px circle, semi-transparent white background.
- Hero area (240px): dark surface with mesh blobs and wireframe, play button if video exists.
- Body: title + verified badge, description, clickable URL in teal monospace with icon, pill tags, enhanced metrics (2-column layout with commit sparkline chart and stats grid), confidence score bar, then PM context sections (Problem, Key decisions, Target user, What I learned) with subtle left-border styling on decision items.
- Footer: author card with avatar initials, name, role, and a sparkline visualization.

---

## 6. Dashboard

### Layout
**Current:** Dark background, left sidebar (Dashboard, Projects, Connections, Settings), main content area with dark cards.

**Target:**
- Sidebar: white background (`--surface-card`), right border (0.5px solid border-light). Items are 14px, text-secondary, with icon + text. Active item: text-primary, weight 500, surface-light background, and a 2px teal right border. At the bottom of sidebar: a teal-bg card linking to public profile with monospace URL.
- Main content area: light background, max-width 880px, padded.

### Dashboard Home (Projects Tab)
**Current:** "Hey, Ameya 👋" greeting, 3 stat cards (Total projects, Published, View public profile link), then a project list with thumbnails, status badges, and action icons.

**Target:**
- **Welcome banner:** Navy gradient background, rounded corners. "Welcome back, Ameya" in 18px white. Subtitle with stats. White "View public profile" button on the right.
- **Quick stats:** 4-column grid (Projects, Commits, Verified, Views 7d) — each a simple surface-light card with number and uppercase label.
- **Project list:** Section title "Your projects" in uppercase muted style with bottom border. Each project is a horizontal row card with: a small dark thumbnail (56x38px) with colored mesh blobs, project name + verified badge, monospace meta text (commits, build days, users, URL), tool pills, a Published/Draft status badge, and an Edit button. On hover: border darkens.
- **Add project button:** Dashed border, full-width, with + icon. On hover: teal border and teal text with teal-bg fill.

### Import from Vercel / Import from Lovable
**Current:** Separate full pages within the dashboard layout showing "IMPORT PROJECTS" header, description, and list of detected repos.

**Target:** Replace with a **unified modal flow** (overlay on top of the dashboard):
- Modal: white, max-width 680px, centered, rounded corners (16px), strong box-shadow, backdrop blur.
- **Phase 1 — Source picker:** 3-column grid of source cards (Vercel, Lovable, Manual). Each card: bordered, 10px radius, icon in a colored square, source name, short description. Vercel gets a "Connected" badge (teal), Lovable gets an "Auto-detect" badge (purple).
- **Phase 2 — Project selection:** List of importable projects as selectable cards with radio buttons. Each card shows: source icon, project name, URL + repo in monospace meta. When selected: purple border, expanded preview showing auto-fill chips ("URL & hosting ✓", "87 commits ✓", "Tech stack ✓", "Verified badge ✓", "You add: PM context"). Projects already in GitPM are grayed out.
- **Phase 3 — Form:** Single scrollable form (NOT multi-step pages). Four numbered sections: (1) Basics (purple accent), (2) Build details (teal accent), (3) Product context (forest accent, with "What sets you apart" badge), (4) Media. Each section has a colored number badge and label. Imported fields show green "autofilled" styling. Form inputs: white bg, 0.5px border, 7px radius, 13px font.
- **Progress bar:** Thin horizontal bar at top showing 33% / 66% / 100% fill in teal.
- **Footer:** Sticky bottom bar with back button, hint text, and a continue/publish button (purple, or teal for final publish).

### Connections Page
**Current:** Vertical list of connection cards (GitHub, Vercel) with Connected status badges and a "How verification works" info section, all on dark background.

**Target:**
- 2-column grid of connection cards on light background.
- Each card: white, bordered, padded. Top row: icon + platform name + connected/disconnected status badge. User info in monospace. Action button (disconnect = surface-light bg, connect = navy bg white text).
- Include: GitHub (connected), Vercel (connected), Lovable (auto-detected, "Re-scan repos" button), Netlify (coming soon, 60% opacity, disabled).

### Settings Page
**Current:** "Settings — coming soon" placeholder.

**Target:** "Profile settings" page with form fields: Username (with gitpm.dev/ prefix), Display name, Headline, Bio (textarea), LinkedIn URL. Standard form styling (white inputs, 0.5px borders, 8px radius). "Save changes" navy button.

---

## 7. Summary of Key Visual Differences

| Aspect | Current | Target |
|--------|---------|--------|
| Page background | Dark navy (#0D1B2A everywhere) | Warm off-white (#F5F3EE) |
| Card backgrounds | Dark semi-transparent | White (#FFFFFF) |
| Text color (main) | Light gray on dark | Dark navy on light |
| Borders | Subtle dark borders | 0.5px solid #DDD9D3 |
| Font family | System/default sans-serif | DM Sans + JetBrains Mono + Instrument Serif |
| Nav logo | Plain "GitPM" text | Monospace `gitpm.dev` with teal accent |
| Profile avatar | Photo | Gradient circle with initials |
| Add project flow | Multi-step pages in dashboard | Unified modal overlay with 3 phases |
| Project detail | Full page | Modal overlay with backdrop blur |
| Landing hero | Dark with green accent | Dark with serif italic + radial gradients |
| Feature section | 3 icon cards | 2x2 grid separated by hairline borders |
| Dashboard stats | 3 large dark cards | 4 small light stat blocks + welcome banner |
| Settings page | "Coming soon" placeholder | Functional settings form |

---

## 8. Important Constraints

- **No feature changes.** Every button, link, and interaction that works today should work the same way after.
- **No data model changes.** Don't add new fields, APIs, or database columns.
- **Responsive:** The mock includes responsive breakpoints at 768px. On mobile: single column grids, hide sidebar, hide heatmap, full-width modal.
- **Transitions:** Add subtle hover transitions (0.15s–0.2s) on cards, buttons, and links for a polished feel.
- **Anti-aliasing:** Use `-webkit-font-smoothing: antialiased` on body.
- **Keep the existing project screenshot/image** in the project cards and detail view as a fallback — the mesh blob wireframe hero is for projects without screenshots.

---

## Reference

The attached HTML file (`gitpm-full-mock_5 (2).html`) is the complete design reference with all CSS and HTML for every page, component, and state. Use it as the single source of truth for exact spacing, colors, font sizes, and component structure.
