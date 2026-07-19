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
      fetch("/api/read", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { urls: [] }))
        .catch(() => ({ urls: [] })),
    ]).then(([savedRes, dismissedRes, readRes]) => {
      try {
        const serverUrls = (res: { urls?: unknown }): string[] =>
          Array.isArray(res.urls)
            ? res.urls.filter((u): u is string => typeof u === "string")
            : [];

        // Merge with the server list instead of overwriting — a first sign-in
        // must not wipe guest-saved items. Guest-only entries are pushed to the
        // server too, so they survive across devices.
        const mergeAndUpload = (
          key: string,
          endpoint: string,
          urls: string[],
        ) => {
          let localUrls: string[] = [];
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || "[]");
            if (Array.isArray(parsed)) {
              localUrls = parsed.filter((u) => typeof u === "string");
            }
          } catch {
            /* ignore */
          }

          const serverSet = new Set(urls);
          const localOnly = localUrls.filter((u) => !serverSet.has(u));
          const union = [...urls, ...localOnly];

          localStorage.setItem(key, JSON.stringify(union));

          for (const url of localOnly) {
            fetch(endpoint, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ url }),
            }).catch(() => {});
          }
        };

        mergeAndUpload("devpulse.saved", "/api/saved", serverUrls(savedRes));
        mergeAndUpload(
          "devpulse.dismissed",
          "/api/dismissed",
          serverUrls(dismissedRes),
        );
        mergeAndUpload("devpulse.read", "/api/read", serverUrls(readRes));

        localStorage.setItem(SYNCED_KEY, sessionEmail);
        for (const k of [
          "devpulse.saved",
          "devpulse.dismissed",
          "devpulse.read",
        ]) {
          window.dispatchEvent(
            new CustomEvent("devpulse:storage", { detail: { key: k } }),
          );
        }
      } catch {
        /* ignore */
      }
    });
  }, [status, session]);

  return null;
}
