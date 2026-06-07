"use client";

import { useEffect, useState } from "react";

import { timeAgo } from "./timeAgo";
import { Tooltip } from "./Tooltip";

type Props = { iso: string };

/**
 * Relative time with a pretty absolute-time tooltip. Client component so
 * we can format the date in the visitor's locale + timezone without
 * causing a hydration mismatch — the initial render uses the same ISO
 * the server sent; the prettier version only appears after mount.
 */
export function PrettyTime({ iso }: Props) {
  const [pretty, setPretty] = useState<string>(iso);

  useEffect(() => {
    // Intl.DateTimeFormat is locale-aware and respects the user's
    // OS timezone. Picks something like "Jun 6, 2026, 9:35 PM" without
    // hard-coding a format.
    const fmt = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setPretty(fmt.format(new Date(iso)));
  }, [iso]);

  return (
    <Tooltip label={pretty} side="bottom">
      <time
        dateTime={iso}
        className="text-[var(--text-dim)]"
        aria-label={`Published ${pretty}`}
      >
        {timeAgo(new Date(iso))}
      </time>
    </Tooltip>
  );
}
