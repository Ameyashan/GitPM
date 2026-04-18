import { NextRequest, NextResponse } from "next/server";

// Subreddits to scan
const SUBREDDITS = [
  "SideProject",
  "InternetIsBeautiful",
  "webdev",
  "SomebodyMakeThis",
  "indiehackers",
  "lovable",
  "cursor",
  "vibecoding",
  "vibecoders_",
];

// Keywords that suggest someone is showing off something they built
const TRIGGER_KEYWORDS = [
  "built", "shipped", "launched", "made",
  "vibecoded", "cursor", "lovable", "v0", "bolt",
  "claude code", "replit", "ai-built",
];

// Reddit-owned hosts we want to exclude (we only care about external links)
const REDDIT_HOSTS = [
  "reddit.com", "www.reddit.com", "old.reddit.com",
  "i.redd.it", "v.redd.it", "imgur.com", "i.imgur.com",
];

type RedditPost = {
  permalink: string;
  url: string;          // external URL, if any
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
};

type Candidate = {
  source: "Reddit";
  post_url: string;
  handle: string;
  profile_url: string;
  external_url: string;
  post_text: string;
  created_utc: number;
};

async function fetchSubreddit(sub: string): Promise<RedditPost[]> {
  // Reddit requires a distinctive User-Agent or it returns 429
  const res = await fetch(
    `https://www.reddit.com/r/${sub}/new.json?limit=25`,
    { headers: { "User-Agent": "gitpm-lead-scout/1.0" } }
  );
  if (!res.ok) {
    console.error(`Reddit fetch failed for r/${sub}: ${res.status}`);
    return [];
  }
  const json = await res.json() as { data?: { children?: { data: RedditPost }[] } };
  return json?.data?.children?.map((c) => c.data) ?? [];
}

function hasExternalUrl(post: RedditPost): boolean {
  if (!post.url) return false;
  try {
    const host = new URL(post.url).hostname.toLowerCase();
    return !REDDIT_HOSTS.some(h => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

function qualifiesAsCandidate(post: RedditPost, threeHoursAgoUnix: number): boolean {
  // Recency
  if (post.created_utc < threeHoursAgoUnix) return false;

  // Must have an external URL
  if (!hasExternalUrl(post)) return false;

  // Must mention a trigger keyword
  const text = `${post.title} ${post.selftext}`.toLowerCase();
  if (!TRIGGER_KEYWORDS.some(kw => text.includes(kw))) return false;

  return true;
}

export async function GET(req: NextRequest) {
  // Auth check — Vercel Cron sends this header; manual testers send the secret
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.SCOUT_CRON_SECRET}`;
  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const threeHoursAgo = Math.floor(Date.now() / 1000) - 3 * 60 * 60;

  // Fetch all subreddits in parallel
  const allPosts = await Promise.all(SUBREDDITS.map(fetchSubreddit));
  const flat = allPosts.flat();

  // Qualify candidates
  const candidates: Candidate[] = flat
    .filter(p => qualifiesAsCandidate(p, threeHoursAgo))
    .map(p => ({
      source: "Reddit" as const,
      post_url: `https://www.reddit.com${p.permalink}`,
      handle: `u/${p.author}`,
      profile_url: `https://www.reddit.com/user/${p.author}`,
      external_url: p.url,
      post_text: `${p.title}\n\n${p.selftext}`.slice(0, 1000),
      created_utc: p.created_utc,
    }));

  console.log(`Scout: found ${candidates.length} candidates across ${SUBREDDITS.length} subreddits`);

  // Debug mode — return diagnostics instead of triggering the routine
  if (debug) {
    const recentPosts = flat.filter(p => p.created_utc >= threeHoursAgo);
    const recentWithExternalUrl = recentPosts.filter(hasExternalUrl);

    return NextResponse.json({
      total_posts_fetched: flat.length,
      posts_in_last_3h: recentPosts.length,
      posts_in_last_3h_with_external_url: recentWithExternalUrl.length,
      qualified_candidates: candidates.length,
      // Sample of posts that were recent + had an external URL but failed the keyword filter.
      // Look at these titles to figure out what language you're missing.
      almost_qualified_sample: recentWithExternalUrl.slice(0, 10).map(p => ({
        title: p.title,
        url: p.url,
        subreddit_hint: p.permalink.split("/")[2],
      })),
    });
  }

  // If nothing found, don't burn a routine run
  if (candidates.length === 0) {
    return NextResponse.json({ candidates_found: 0, routine_triggered: false });
  }

  // Fire the routine with the candidates as the prompt input
  const routineRes = await fetch(process.env.ROUTINE_API_URL!, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.ROUTINE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Here are ${candidates.length} fresh candidates from Reddit. Run the qualification, enrichment, dedupe, and Notion-write steps for each one. Candidates:\n\n${JSON.stringify(candidates, null, 2)}`,
    }),
  });

  if (!routineRes.ok) {
    const errText = await routineRes.text();
    console.error("Routine trigger failed:", routineRes.status, errText);
    return NextResponse.json(
      { candidates_found: candidates.length, routine_triggered: false, error: errText },
      { status: 500 }
    );
  }

  const routineData = await routineRes.json();
  return NextResponse.json({
    candidates_found: candidates.length,
    routine_triggered: true,
    session_url: routineData.session_url ?? null,
  });
}