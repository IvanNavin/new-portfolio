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
    <span className="group relative inline-flex">
      {children}
      <span
        aria-hidden="true"
        role="presentation"
        className={[
          "pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 text-xs text-[var(--text)] opacity-0 shadow-lg transition-opacity delay-150 duration-150",
          "group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0",
          side === "top" ? "-top-1 -translate-y-full" : "top-full mt-1",
        ].join(" ")}
      >
        {label}
      </span>
    </span>
  );
}
