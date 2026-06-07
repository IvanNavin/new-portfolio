"use client";

import * as RT from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

type Side = "top" | "right" | "bottom" | "left";

type Props = {
  label: string;
  /** Defaults to "top". Radix flips to the opposite side automatically
   *  when there's not enough room, so a top-tooltip near the viewport
   *  top will swap to bottom on its own. */
  side?: Side;
  children: ReactNode;
};

/**
 * Thin wrapper around @radix-ui/react-tooltip. Battle-tested for all
 * the edge cases I was hitting with the hand-rolled version:
 *  - portals to <body> so card overflow can't clip the bubble
 *  - smart collision avoidance against viewport edges
 *  - per-content sizing (no more "Save / for / later" vertical wrap)
 *  - proper aria semantics, keyboard delivery, dismissal on Escape
 *
 * Provider is mounted once in the root layout (TooltipProvider).
 */
export function Tooltip({ label, side = "top", children }: Props) {
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className="z-50 max-w-[min(90vw,260px)] rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 text-xs tracking-normal whitespace-normal text-[var(--text)] normal-case shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0"
        >
          {label}
          <RT.Arrow className="fill-[var(--bg-elev)] stroke-[var(--border)]" />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}
