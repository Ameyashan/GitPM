"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { sendGtagPagePath } from "@/lib/gtag";

function PagePathTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    let path = pathname;
    const query = searchParams?.toString();
    if (query) {
      path += `?${query}`;
    }

    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    sendGtagPagePath(measurementId, path);
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GoogleAnalyticsPageView({
  measurementId,
}: {
  measurementId: string;
}) {
  return (
    <Suspense fallback={null}>
      <PagePathTracker measurementId={measurementId} />
    </Suspense>
  );
}
