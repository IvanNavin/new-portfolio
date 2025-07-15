import { isLocal } from "@app/constants";
import {
  ETrackVisitEvent,
  TrackVisitBodyType,
  TrackVisitProps,
} from "@app/utils/hooks/trackVisitTypes";
import { useCallback } from "react";

export function useTrackVisit() {
  return useCallback(async (props?: TrackVisitProps) => {
    if (isLocal) return;

    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);
    }

    const { extra, event = ETrackVisitEvent.PAGEVIEW, domain } = props ?? {};

    const body: TrackVisitBodyType = {
      domain: domain || window.location.origin,
      path: window.location.pathname,
      referrer: document.referrer,
      sessionId,
      event,
    };

    if (extra) body.extra = extra;

    await fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }, []);
}
