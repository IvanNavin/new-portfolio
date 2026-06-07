"use client";

import Link from "next/link";

/**
 * Click-to-filter tag chip inside a news card. Lives in its own client
 * component because we need `stopPropagation` on the click so the
 * wrapping card <a> doesn't open the story when the user clicks the
 * chip — and onClick handlers can't be passed from a server component
 * down to next/link directly.
 */
export function TagChip({ label }: { label: string }) {
  return (
    <Link
      href={`/?tag=${encodeURIComponent(label)}`}
      prefetch={false}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 rounded-md bg-[var(--c-accent-soft)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[var(--c-accent-fg)] uppercase hover:brightness-110"
    >
      ★ {label}
    </Link>
  );
}
