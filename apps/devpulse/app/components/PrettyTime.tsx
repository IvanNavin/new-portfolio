"use client";

import { useEffect, useState } from "react";

import { timeAgo } from "./timeAgo";
import { Tooltip } from "./Tooltip";

type Props = { iso: string };

/**
 * Server renders a stable absolute date (YYYY-MM-DD); client swaps to
 * the relative "13h ago" string after mount and keeps it ticking every
 * minute. This eliminates React 19 error #418 — the hydration mismatch
 * we'd hit when `timeAgo()` produced "12h" on the server and "13h" on
 * the client a few seconds later. The Tooltip label updates with the
 * locale-formatted absolute date once Intl.DateTimeFormat is available.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function PrettyTime({ iso }: Props) {
  const initial = shortDate(iso); // deterministic on both sides
  const [rel, setRel] = useState<string>(initial);
  const [pretty, setPretty] = useState<string>(iso);

  useEffect(() => {
    const date = new Date(iso);
    const tick = () => setRel(timeAgo(date));
    tick();
    const id = setInterval(tick, 60_000);

    const fmt = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setPretty(fmt.format(date));

    return () => clearInterval(id);
  }, [iso]);

  return (
    <Tooltip label={pretty} side="bottom">
      <time
        dateTime={iso}
        className="text-[var(--text-dim)]"
        aria-label={`Published ${pretty}`}
      >
        {rel}
      </time>
    </Tooltip>
  );
}
