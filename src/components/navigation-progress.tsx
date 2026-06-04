"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ minimum: 0.15, easing: "ease", speed: 300, showSpinner: false, trickleSpeed: 100 });

export function NavigationProgress() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // Called when Next.js has fully rendered the new page (after server data fetches)
    NProgress.done();
  }, [pathname]);

  return null;
}
