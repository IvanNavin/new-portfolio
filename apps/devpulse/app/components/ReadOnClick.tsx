"use client";

import { readReadSet, toggleRead } from "@lib/storage";
import { useEffect } from "react";

/**
 * Global event-delegated handler that auto-marks a story as read when
 * the user actually opens it. Hangs one click listener on document,
 * walks up from the click target to find the wrapping news-card link
 * (data-card-url), and fires the same write-through CardActions used.
 *
 * Action buttons inside cards stopPropagation, so clicks on them never
 * reach this handler — they don't false-flag a card as read.
 *
 * Replaces the manual ✓ button: opening a story IS the read signal,
 * the user shouldn't have to confirm separately.
 */
export function ReadOnClick() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>("a[data-card-url]");
      if (!card) return;
      const url = card.getAttribute("data-card-url");
      if (!url) return;
      if (readReadSet().has(url)) return;
      toggleRead(url);
      card.dataset.read = "true";
      // Best-effort write to DB. /api/read returns 401 for unauth
      // visitors — the localStorage write already happened, so the UI
      // shows the read state even when offline.
      fetch("/api/read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      }).catch(() => {});
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
