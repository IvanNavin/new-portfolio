"use client";

import { useRouter } from "next/navigation";

/**
 * Click-to-filter tag chip inside a news card. Implemented as a button
 * (not <Link>) because the card itself is wrapped in an <a> — nesting
 * anchors is invalid HTML5, and modern browsers auto-restructure the
 * DOM during parsing, which React 19 sees as a hydration mismatch and
 * raises as error #418. router.push gives us the same navigation
 * behaviour without the structural violation.
 */
export function TagChip({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/?tag=${encodeURIComponent(label)}`);
      }}
      className="relative z-10 rounded-md bg-[var(--c-accent-soft)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[var(--c-accent-fg)] uppercase hover:brightness-110"
    >
      ★ {label}
    </button>
  );
}
