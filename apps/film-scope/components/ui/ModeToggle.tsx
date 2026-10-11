"use client";

import { cn } from "@/lib/cn";
import type { MatchMode } from "@/lib/filters/schema";

/**
 * AND / OR for a set facet. Only rendered once two values are picked, because
 * with a single value the distinction is meaningless and just adds noise.
 */
export const ModeToggle = ({
  mode,
  onChange,
  anyLabel,
  allLabel,
}: {
  mode: MatchMode;
  onChange: (mode: MatchMode) => void;
  anyLabel: string;
  allLabel: string;
}) => (
  <div className="inline-flex rounded-md border border-edge bg-surface p-0.5 text-[11px]">
    {(["any", "all"] as const).map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={cn(
          "rounded px-2 py-0.5 transition-colors",
          option === mode
            ? "bg-accent-soft text-accent"
            : "text-ink-faint hover:text-ink",
        )}
      >
        {option === "any" ? anyLabel : allLabel}
      </button>
    ))}
  </div>
);
