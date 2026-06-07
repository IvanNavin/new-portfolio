"use client";

import { useEffect, useState } from "react";

/**
 * Small "NEW" pill rendered inline in the news-card meta row when an item
 * was published since the visitor's previous visit. Previously this lived
 * inside CardActions in the top-right corner — but it competed with the
 * save/dismiss buttons for the same space and pushed the time-ago label
 * underneath. Living in the meta row keeps it semantically with source +
 * category and avoids the overlay collision entirely.
 *
 * Reads `devpulse.lastVisit.prev` written by PostMountFilters on mount.
 */
export function NewBadge({ publishedAtIso }: { publishedAtIso: string }) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    try {
      const lastVisit = parseInt(
        localStorage.getItem("devpulse.lastVisit.prev") ?? "0",
        10,
      );
      if (lastVisit > 0) {
        setIsNew(new Date(publishedAtIso).getTime() > lastVisit);
      }
    } catch {
      /* ignore */
    }
  }, [publishedAtIso]);

  if (!isNew) return null;
  return (
    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-300 uppercase">
      new
    </span>
  );
}
