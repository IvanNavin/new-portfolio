"use client";

import { useEffect, useState } from "react";

import { timeAgo } from "./timeAgo";
import { Tooltip } from "./Tooltip";

type Props = { iso: string };

/**
 * Belt-and-braces against React 19 hydration error #418.
 *
 * The previous attempt kept the wrapping Tooltip during SSR and just
 * swapped the inner text after mount. That still tripped the hydration
 * detector for reasons that don't show up in dev mode — possibly
 * Radix's portal/state attributes diverging between server and client.
 *
 * Final shape: render a plain `<time>` with the deterministic
 * absolute date during SSR and the first client paint. Only AFTER the
 * mount effect do we swap in the Tooltip-wrapped, relative-time
 * version. The server HTML and the first client render are now
 * byte-identical and there's no opportunity for mismatch.
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
  const [mounted, setMounted] = useState(false);
  const [rel, setRel] = useState<string>("");
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
    setMounted(true);

    return () => clearInterval(id);
  }, [iso]);

  if (!mounted) {
    // Server render + first client paint — identical, no Tooltip.
    return (
      <time dateTime={iso} className="text-[var(--text-dim)]">
        {shortDate(iso)}
      </time>
    );
  }

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
