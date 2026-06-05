"use client";

import { useEffect } from "react";

import { readAndBumpLastVisit, readDismissed } from "@lib/storage";

/**
 * Runs once after hydration to apply client-only state to the
 * server-rendered DOM:
 *
 *  1. Stamps the previous lastVisit into `devpulse.lastVisit.prev` so each
 *     CardActions can read it synchronously without racing.
 *  2. Hides every card whose URL is in the dismissed set.
 *
 * Renders nothing. Lives once per page.
 */
export function PostMountFilters() {
  useEffect(() => {
    const prevVisit = readAndBumpLastVisit();
    try {
      localStorage.setItem("devpulse.lastVisit.prev", String(prevVisit));
    } catch {
      /* ignore */
    }

    const dismissed = readDismissed();
    if (dismissed.size === 0) return;
    document.querySelectorAll<HTMLElement>("[data-card-url]").forEach((el) => {
      const url = el.getAttribute("data-card-url");
      if (url && dismissed.has(url)) {
        const li = el.closest("li");
        if (li) (li as HTMLElement).style.display = "none";
      }
    });
  }, []);

  return null;
}
