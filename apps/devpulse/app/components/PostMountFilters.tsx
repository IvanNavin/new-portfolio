"use client";

import {
  onStorageChange,
  readAndBumpLastVisit,
  readDismissed,
  readReadSet,
} from "@lib/storage";
import { useEffect } from "react";

/**
 * Runs once after hydration to apply client-only state to the
 * server-rendered DOM:
 *
 *  1. Stamps the previous lastVisit into `devpulse.lastVisit.prev` so each
 *     CardActions can read it synchronously without racing.
 *  2. Hides every card whose URL is in the dismissed set.
 *  3. Tags read cards with data-read="true" so CSS can desaturate them.
 *
 * Re-runs on storage events so AuthedStateSync's cross-device pull is
 * reflected without a page reload.
 *
 * Renders nothing.
 */
export function PostMountFilters() {
  useEffect(() => {
    const prevVisit = readAndBumpLastVisit();
    try {
      localStorage.setItem("devpulse.lastVisit.prev", String(prevVisit));
    } catch {
      /* ignore */
    }

    const apply = () => {
      const dismissed = readDismissed();
      const read = readReadSet();
      document
        .querySelectorAll<HTMLElement>("[data-card-url]")
        .forEach((el) => {
          const url = el.getAttribute("data-card-url");
          if (!url) return;
          const li = el.closest("li");
          if (li) {
            (li as HTMLElement).style.display = dismissed.has(url)
              ? "none"
              : "";
          }
          el.dataset.read = read.has(url) ? "true" : "";
        });
    };
    apply();
    return onStorageChange(apply);
  }, []);

  return null;
}
