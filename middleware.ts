import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ---------------------------------------------------------------------------
// TODO: Distributed Rate Limiting (post-launch)
//
// Add rate limiting using Upstash Redis + @upstash/ratelimit.
// Thresholds per ARCHITECTURE.md: 100 req/min (public), 300 req/min (authed).
//
// Setup steps:
//   1. Create a free Redis database at https://console.upstash.com
//   2. npm install @upstash/ratelimit @upstash/redis
//   3. Add to .env.local:
//        UPSTASH_REDIS_REST_URL=...
//        UPSTASH_REDIS_REST_TOKEN=...
//   4. Replace the stub below with:
//
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
//
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });
//
// const publicLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(100, "1 m"),
//   prefix: "rl:public",
// });
//
// const authedLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(300, "1 m"),
//   prefix: "rl:authed",
// });
//
// Then, before the auth check in middleware():
//
//   const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
//   const limiter = user ? authedLimiter : publicLimiter;
//   const { success, limit, remaining } = await limiter.limit(ip);
//   if (!success) {
//     return new NextResponse("Too Many Requests", {
//       status: 429,
//       headers: {
//         "X-RateLimit-Limit": String(limit),
//         "X-RateLimit-Remaining": String(remaining),
//         "Retry-After": "60",
//       },
//     });
//   }
// ---------------------------------------------------------------------------

// Auth-required route prefixes
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|api/scout|api/cron|api/jobs|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
