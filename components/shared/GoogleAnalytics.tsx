import type { ReactNode } from "react";
import Script from "next/script";
import { GoogleAnalyticsPageView } from "@/components/shared/GoogleAnalyticsPageView";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics(): ReactNode {
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
      <GoogleAnalyticsPageView measurementId={measurementId} />
    </>
  );
}
