"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Mirrors the user's DB-stored saved + dismissed lists into localStorage
 * once per page load when they're authenticated. Existing components
 * (CardActions, SavedFeed, PostMountFilters) keep reading from
 * localStorage — this sync just makes the local copy reflect the truth
 * on the server, which gives instant cross-device parity.
 *
 * Writes are write-through: CardActions calls /api/saved + /api/dismissed
 * alongside its localStorage mutations, so the DB stays the source of
 * truth even between visits.
 */
const SYNCED_KEY = "devpulse.synced.session";

export function AuthedStateSync() {
  const { data: session, status } = useSession();
  const didRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (didRef.current) return;
    const sessionEmail = session?.user?.email;
    if (!sessionEmail) return;
    // Skip if we already synced for THIS session-email this load.
    try {
      if (localStorage.getItem(SYNCED_KEY) === sessionEmail) return;
    } catch {
      /* ignore */
    }
    didRef.current = true;

    Promise.all([
      fetch("/api/saved", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { urls: [] }))
        .catch(() => ({ urls: [] })),
      fetch("/api/dismissed", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { urls: [] }))
        .catch(() => ({ urls: [] })),
    ]).then(([savedRes, dismissedRes]) => {
      try {
        const savedUrls: string[] = Array.isArray(savedRes.urls)
          ? savedRes.urls
          : [];
        const dismissedUrls: string[] = Array.isArray(dismissedRes.urls)
          ? dismissedRes.urls
          : [];
        localStorage.setItem("devpulse.saved", JSON.stringify(savedUrls));
        localStorage.setItem(
          "devpulse.dismissed",
          JSON.stringify(dismissedUrls),
        );
        localStorage.setItem(SYNCED_KEY, sessionEmail);
        window.dispatchEvent(
          new CustomEvent("devpulse:storage", {
            detail: { key: "devpulse.saved" },
          }),
        );
        window.dispatchEvent(
          new CustomEvent("devpulse:storage", {
            detail: { key: "devpulse.dismissed" },
          }),
        );
      } catch {
        /* ignore */
      }
    });
  }, [status, session]);

  return null;
}
