import { useEffect, useRef } from "react";
import { useRouter } from "@/router/router";
import { trackVisit } from "@/lib/trackVisit";

/**
 * Records a pageview on every route change (and the initial load). Renders
 * nothing. Must live inside <RouterProvider>.
 */
export function VisitTracker() {
  const { path } = useRouter();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === path) return;
    lastTracked.current = path;
    trackVisit(path);
  }, [path]);

  return null;
}
