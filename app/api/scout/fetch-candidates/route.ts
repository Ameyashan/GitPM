import { NextRequest, NextResponse } from "next/server";

const SUBREDDITS = [
  "SideProject",
  "VibeCodeDevs",
  "indiehackers",
  "lovable",
  "cursor",
  "vibecoding",
  "buildinpublic",
  "VibeCodeDevs",
];

const TRIGGER_KEYWORDS = [
    "built", "shipped", "launched", "made",
    "vibecoded", "vibe coded", "vibe-coded",  // variants
    "cursor", "lovable", "v0", "bolt",
    "claude code", "replit", "ai-built", "made by ai",  // variants
    "showoff", "show off",  // Reddit's weekly show-off threads
    "my app", "my project", "my site", "my site",  // first-person possessives
    "created", "finished",  // common vibecoder phrasings
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
};

type FetchResult = {
  sub: string;
  posts: RedditPost[];
  error?: string;
};

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
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
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
    try {
      permalink = new URL(permalinkFull).pathname;
    } catch {
      permalink = "";
    }

    const createdUtc = updated
      ? Math.floor(new Date(updated).getTime() / 1000)
      : 0;

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
  if (!apiKey) {
    return { sub, posts: [], error: "SCRAPERAPI_KEY not configured" };
  }

  // ScraperAPI: we pass the target URL as a query param; it fetches and returns
  // the content from a non-blocked IP pool.
  const redditUrl = `https://www.reddit.com/r/${sub}/new.rss?limit=25`;
  const proxiedUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(redditUrl)}`;

  try {
    const res = await fetch(proxiedUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
      const errText = await res.text();
      return { sub, posts: [], error: `${res.status}: ${errText.slice(0, 200)}` };
    }
    const xml = await res.text();
    const posts = parseRedditRss(xml);
    return { sub, posts };
  } catch (err) {
    return { sub, posts: [], error: `threw: ${String(err).slice(0, 200)}` };
  }
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

  const results: FetchResult[] = [];
    for (const sub of SUBREDDITS) {
        results.push(await fetchSubreddit(sub));
        // Respect ScraperAPI free-tier concurrency limit: 1 in-flight request at a time
        await new Promise(resolve => setTimeout(resolve, 500));
    }


  const flat = results.flatMap(r => r.posts);
  const fetchErrors = results.filter(r => r.error).map(r => ({ sub: r.sub, error: r.error }));

  const candidates: Candidate[] = flat
    .filter(p => qualifiesAsCandidate(p, threeHoursAgo))
    .map(p => ({
      source: "Reddit" as const,
      post_url: `https://www.reddit.com${p.permalink}`,
      handle: `u/${p.author}`,
      profile_url: `https://www.reddit.com/user/${p.author}`,
      external_url: p.url,
      post_text: p.title.slice(0, 1000),
      created_utc: p.created_utc,
    }));

  console.log(`Scout: found ${candidates.length} candidates across ${SUBREDDITS.length} subreddits`);

  if (debug) {
    const recentPosts = flat.filter(p => p.created_utc >= threeHoursAgo);
    const recentWithExternalUrl = recentPosts.filter(hasExternalUrl);

    return NextResponse.json({
      total_posts_fetched: flat.length,
      posts_in_last_3h: recentPosts.length,
      posts_in_last_3h_with_external_url: recentWithExternalUrl.length,
      qualified_candidates: candidates.length,
      fetch_errors: fetchErrors,
      per_sub_counts: results.map(r => ({ sub: r.sub, count: r.posts.length })),
      almost_qualified_sample: recentWithExternalUrl.slice(0, 10).map(p => ({
        title: p.title,
        url: p.url,
        subreddit_hint: p.permalink.split("/")[2],
      })),
    });
  }

  if (candidates.length === 0) {
    return NextResponse.json({
      candidates_found: 0,
      routine_triggered: false,
      fetch_errors: fetchErrors,
    });
  }

  const routineRes = await fetch(process.env.ROUTINE_API_URL!, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.ROUTINE_API_TOKEN}`,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "experimental-cc-routine-2026-04-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: `Here are ${candidates.length} fresh candidates from Reddit. Run the qualification, enrichment, dedupe, and Notion-write steps for each one. Candidates:\n\n${JSON.stringify(candidates, null, 2)}`,
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
    session_url: routineData.claude_code_session_url ?? null,
    });
}