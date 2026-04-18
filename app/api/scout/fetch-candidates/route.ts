import { NextRequest, NextResponse } from "next/server";

const SUBREDDITS = [
  "SideProject",
  "VibeCodeDevs",
  "indiehackers",
  "lovable",
  "cursor",
  "vibecoding",
  "buildinpublic",
];

const TRIGGER_KEYWORDS = [
  "built", "shipped", "launched", "made",
  "vibecoded", "vibe coded", "vibe-coded",
  "cursor", "lovable", "v0", "bolt",
  "claude code", "replit", "ai-built", "made by ai",
  "showoff", "show off",
  "my app", "my project", "my site",
  "created", "finished",
];

const REDDIT_HOSTS = [
  "reddit.com", "www.reddit.com", "old.reddit.com",
  "i.redd.it", "v.redd.it", "imgur.com", "i.imgur.com",
];

const USER_AGENT = "gitpm-lead-scout/1.0";

type RedditPost = {
  permalink: string;
  url: string;
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
  // Enrichment fields — populated by enrichCandidate()
  site_reachable: boolean;
  site_fetch_error?: string;
  site_title?: string;
  site_snippet?: string;
  found_email?: string;
};

type FetchResult = {
  sub: string;
  posts: RedditPost[];
  error?: string;
};

// --- XML parsing helpers (unchanged) ---
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}
function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}
function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ");
}
function extractExternalUrlFromContent(content: string): string {
  const decoded = decodeHtml(content);
  const match = decoded.match(/<a href="([^"]+)">\[link\]<\/a>/);
  return match ? match[1] : "";
}

function parseRedditRss(xml: string): RedditPost[] {
  const entryBlocks = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return entryBlocks.map((entry) => {
    const title = decodeHtml(extractTag(entry, "title"));
    const updated = extractTag(entry, "updated");
    const content = extractTag(entry, "content");
    const externalUrl = extractExternalUrlFromContent(content);
    const authorBlock = extractTag(entry, "author");
    const authorRaw = extractTag(authorBlock, "name");
    const author = authorRaw.replace(/^\/u\//, "");
    const permalinkFull = extractAttr(entry, "link", "href");
    let permalink = "";
    try { permalink = new URL(permalinkFull).pathname; } catch { permalink = ""; }
    const createdUtc = updated ? Math.floor(new Date(updated).getTime() / 1000) : 0;
    return {
      permalink,
      url: externalUrl || permalinkFull,
      title,
      selftext: "",
      author,
      created_utc: createdUtc,
    };
  }).filter(p => p.permalink && p.author);
}

async function fetchSubreddit(sub: string): Promise<FetchResult> {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey) return { sub, posts: [], error: "SCRAPERAPI_KEY not configured" };

  const redditUrl = `https://www.reddit.com/r/${sub}/new.rss?limit=25`;
  const proxiedUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(redditUrl)}`;

  try {
    const res = await fetch(proxiedUrl, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      const errText = await res.text();
      return { sub, posts: [], error: `${res.status}: ${errText.slice(0, 200)}` };
    }
    const xml = await res.text();
    return { sub, posts: parseRedditRss(xml) };
  } catch (err) {
    return { sub, posts: [], error: `threw: ${String(err).slice(0, 200)}` };
  }
}

// --- Enrichment: fetch candidate's site via ScraperAPI, extract email + snippet ---
async function enrichCandidate(
  c: Omit<Candidate, "site_reachable" | "site_fetch_error" | "site_title" | "site_snippet" | "found_email">
): Promise<Candidate> {
  const apiKey = process.env.SCRAPERAPI_KEY!;
  const proxiedUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(c.external_url)}`;

  try {
    const res = await fetch(proxiedUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15000), // 15s cap per site
    });

    if (!res.ok) {
      return {
        ...c,
        site_reachable: false,
        site_fetch_error: `${res.status}`,
      };
    }

    const html = await res.text();

    // Extract <title> from the HTML
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const siteTitle = titleMatch ? decodeHtml(titleMatch[1]).trim().slice(0, 200) : undefined;

    // Extract first mailto: link (footer, contact, about)
    const mailtoMatch = html.match(/mailto:([^"'?\s<>]+)/i);
    const foundEmail = mailtoMatch ? mailtoMatch[1].trim() : undefined;

    // Strip HTML tags and get a text snippet (first ~500 visible chars)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const snippet = text.slice(0, 800);

    return {
      ...c,
      site_reachable: true,
      site_title: siteTitle,
      site_snippet: snippet,
      found_email: foundEmail,
    };
  } catch (err) {
    return {
      ...c,
      site_reachable: false,
      site_fetch_error: `threw: ${String(err).slice(0, 100)}`,
    };
  }
}

function hasExternalUrl(post: RedditPost): boolean {
  if (!post.url) return false;
  try {
    const host = new URL(post.url).hostname.toLowerCase();
    return !REDDIT_HOSTS.some(h => host === h || host.endsWith("." + h));
  } catch { return false; }
}

function qualifiesAsCandidate(post: RedditPost, threeHoursAgoUnix: number): boolean {
  if (post.created_utc < threeHoursAgoUnix) return false;
  if (!hasExternalUrl(post)) return false;
  const text = `${post.title} ${post.selftext}`.toLowerCase();
  if (!TRIGGER_KEYWORDS.some(kw => text.includes(kw))) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.SCOUT_CRON_SECRET}`;
  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const threeHoursAgo = Math.floor(Date.now() / 1000) - 3 * 60 * 60;

  // Sequential fetch to respect ScraperAPI free-tier concurrency
  const results: FetchResult[] = [];
  for (const sub of SUBREDDITS) {
    results.push(await fetchSubreddit(sub));
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  const flat = results.flatMap(r => r.posts);
  const fetchErrors = results.filter(r => r.error).map(r => ({ sub: r.sub, error: r.error }));

  // Deduplicate by post_url (in case a post appears in multiple subs)
  const seen = new Set<string>();
  const preCandidates = flat
    .filter(p => qualifiesAsCandidate(p, threeHoursAgo))
    .filter(p => {
      const key = p.permalink;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10) // cap before enrichment to control credit burn
    .map(p => ({
      source: "Reddit" as const,
      post_url: `https://www.reddit.com${p.permalink}`,
      handle: `u/${p.author}`,
      profile_url: `https://www.reddit.com/user/${p.author}`,
      external_url: p.url,
      post_text: p.title.slice(0, 1000),
      created_utc: p.created_utc,
    }));

  console.log(`Scout: pre-enrichment ${preCandidates.length} candidates`);

  if (debug) {
    const recentPosts = flat.filter(p => p.created_utc >= threeHoursAgo);
    const recentWithExternalUrl = recentPosts.filter(hasExternalUrl);
    return NextResponse.json({
      total_posts_fetched: flat.length,
      posts_in_last_3h: recentPosts.length,
      posts_in_last_3h_with_external_url: recentWithExternalUrl.length,
      qualified_candidates: preCandidates.length,
      fetch_errors: fetchErrors,
      per_sub_counts: results.map(r => ({ sub: r.sub, count: r.posts.length })),
      almost_qualified_sample: recentWithExternalUrl.slice(0, 10).map(p => ({
        title: p.title,
        url: p.url,
        subreddit_hint: p.permalink.split("/")[2],
      })),
    });
  }

  if (preCandidates.length === 0) {
    return NextResponse.json({
      candidates_found: 0,
      routine_triggered: false,
      fetch_errors: fetchErrors,
    });
  }

  // --- Enrich each candidate with site HTML via ScraperAPI ---
  const candidates: Candidate[] = [];
  for (const c of preCandidates) {
    candidates.push(await enrichCandidate(c));
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const reachableCount = candidates.filter(c => c.site_reachable).length;
  console.log(`Scout: post-enrichment ${candidates.length} candidates (${reachableCount} reachable)`);

  const routineRes = await fetch(process.env.ROUTINE_API_URL!, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.ROUTINE_API_TOKEN}`,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "experimental-cc-routine-2026-04-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: `Here are ${candidates.length} pre-enriched candidates from Reddit. Each has site_title, site_snippet, and found_email already extracted (or site_reachable=false if fetch failed). Write every candidate to Notion — do NOT skip unreachable ones, just mark them accordingly. Run dedupe and draft emails per the prompt.\n\nCandidates:\n\n${JSON.stringify(candidates, null, 2)}`,
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
    reachable_sites: reachableCount,
    routine_triggered: true,
    session_url: routineData.claude_code_session_url ?? null,
  });
}