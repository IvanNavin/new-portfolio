/**
 * Fire-and-forget visit tracking. Beacons a pageview to the visit-stat app,
 * which enriches it server-side (geo/ip/ua) and stores it. Analytics must
 * never block or break the SPA, so every failure is swallowed.
 */

const VISIT_STAT_URL =
  import.meta.env.VITE_VISIT_STAT_URL ?? "https://visit-stat.vercel.app";

const SESSION_KEY = "sessionId";

const getSessionId = (): string => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
};

export const trackVisit = (path: string): void => {
  // Skip local dev so it doesn't pollute the stats.
  if (import.meta.env.DEV || location.hostname === "localhost") return;
  if (typeof navigator.sendBeacon !== "function") return;

  const payload = JSON.stringify({
    domain: window.location.origin,
    path,
    referrer: document.referrer,
    sessionId: getSessionId(),
    event: "pageview",
  });

  try {
    // text/plain keeps this a CORS "simple" request (no preflight) so the
    // cross-origin beacon actually goes out.
    const blob = new Blob([payload], { type: "text/plain" });
    navigator.sendBeacon(`${VISIT_STAT_URL}/api/track`, blob);
  } catch {
    // ignore
  }
};
