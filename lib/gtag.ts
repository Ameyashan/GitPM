/**
 * GA4 gtag — SPA route changes (initial load handled by gtag config in layout).
 */
export function sendGtagPagePath(
  measurementId: string,
  pagePath: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  interface WindowWithGtag extends Window {
    gtag?: (...args: unknown[]) => void;
  }

  const gtag = (window as WindowWithGtag).gtag;
  if (typeof gtag !== "function") {
    return;
  }

  gtag("config", measurementId, { page_path: pagePath });
}
