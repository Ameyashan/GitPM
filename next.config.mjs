import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage public URLs (screenshots, thumbnails, avatars)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // GitHub avatar URLs (populated from OAuth)
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent the page from being embedded in an iframe (clickjacking protection)
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control how much referrer info is sent
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Disable browser features not used by this app
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Force HTTPS for 2 years (only effective in production with HTTPS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Content Security Policy — scoped to known origins
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self, PostHog, Sentry CDN
              // PostHog: SDK may load from app/us; events go to us.i / eu.i ingest hosts
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.posthog.com https://us.posthog.com https://us.i.posthog.com https://eu.i.posthog.com https://browser.sentry-cdn.com",
              // Styles: self + inline (Tailwind generates inline styles)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self, Supabase Storage, GitHub avatars, data URIs (Next.js image optimizer)
              "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com",
              // Connections: self, Supabase, PostHog, Sentry, GitHub API
              "connect-src 'self' https://*.supabase.co https://app.posthog.com https://us.posthog.com https://us.i.posthog.com https://eu.i.posthog.com https://o*.ingest.sentry.io https://api.github.com https://api.vercel.com",
              // Frames: allow Loom and YouTube embeds
              "frame-src https://www.loom.com https://www.youtube.com https://www.youtube-nocookie.com",
              // Workers: self (Sentry uses workers)
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project slugs (set in .env)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps to Sentry for readable stack traces in production
  // Requires SENTRY_AUTH_TOKEN to be set in the Vercel environment
  silent: !process.env.CI,

  // Only upload source maps when the auth token is actually present
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Tree-shake Sentry logger statements
  disableLogger: true,

  // Automatically instrument React component names in error reports
  reactComponentAnnotation: { enabled: true },
});
