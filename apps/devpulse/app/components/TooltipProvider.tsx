"use client";

import * as RT from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

/** Single Tooltip.Provider mounted at the root so every <Tooltip> in the
 *  tree shares the same delay group. delayDuration = 250ms matches the
 *  feel of the old hand-rolled CSS tooltip but flips to instant once the
 *  user is already hovering siblings (skipDelayDuration). */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RT.Provider delayDuration={250} skipDelayDuration={300}>
      {children}
    </RT.Provider>
  );
}
