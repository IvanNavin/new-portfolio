"use client";

import { ReactNode } from "react";

type Side = "top" | "bottom";

type Props = {
  label: string;
  /** "top" by default. "bottom" useful when the trigger is near the
   *  top of the viewport where a top tooltip would be clipped. */
  side?: Side;
  children: ReactNode;
};

/**
 * Tiny CSS-only hover/focus tooltip.
 *
 * - Reveals on hover (after 150ms) AND on keyboard focus — covers mouse,
 *   touch (via focus on tap), and keyboard users alike.
 * - Hidden from assistive tech (`aria-hidden`); the trigger button is
 *   expected to carry its own descriptive `aria-label`, which is what
 *   screen readers actually use. The tooltip is a visual nudge for sighted
 *   pointer users — duplicate text would just create double announcements.
 * - Pointer-events-none so the tooltip can't intercept clicks.
 *
 * Wrap a single focusable child (button, link). Don't add Tooltip around
 * non-interactive elements: there's no consistent way to surface the
 * label to keyboard users in that case.
 */
export function Tooltip({ label, side = "top", children }: Props) {
  return (
    // Named group `tt` so `group-hover/tt:` only matches THIS tooltip's
    // wrapper, never an outer card or section. Without the name, every
    // tooltip inside any element marked `group` (like the NewsCard <a>)
    // would fire together on a hover anywhere in that ancestor.
    <span className="group/tt relative inline-flex">
      {children}
      <span
        aria-hidden="true"
        role="presentation"
        // max-w + whitespace-normal keeps long tooltip text (the email
        // attribution on the avatar chip, the canary-version aria-label)
        // from blowing out horizontally and forcing the page to scroll.
        // normal-case overrides parent .uppercase from the live-feed
        // header so labels read in regular sentence case.
        className={[
          "pointer-events-none absolute left-1/2 z-30 max-w-[min(80vw,240px)] -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 text-xs tracking-normal whitespace-normal text-[var(--text)] normal-case opacity-0 shadow-lg transition-opacity delay-150 duration-150",
          "group-hover/tt:opacity-100 group-hover/tt:delay-0 group-focus-within/tt:opacity-100 group-focus-within/tt:delay-0",
          side === "top" ? "-top-1 -translate-y-full" : "top-full mt-1",
        ].join(" ")}
      >
        {label}
      </span>
    </span>
  );
}
