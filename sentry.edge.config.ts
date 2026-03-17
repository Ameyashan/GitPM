import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Lower sample rate for edge functions (high volume)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

  debug: false,
});
