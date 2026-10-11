"use client";

import { useState } from "react";

import { ModeToggle } from "@/components/ui/ModeToggle";
import {
  applyPick,
  type PickMode,
  PickModeToggle,
} from "@/components/ui/PickMode";
import { cn } from "@/lib/cn";
import type { MatchMode, SetFacet } from "@/lib/filters/schema";

export type ChipOption = { value: string; label: string };

type ChipFacetProps = {
  label: string;
  options: ChipOption[];
  facet: SetFacet<string>;
  onChange: (facet: SetFacet<string>) => void;
  matchAny: string;
  matchAll: string;
  includeLabel: string;
  excludeLabel: string;
  allowMode?: boolean;
  allowExclude?: boolean;
  /** Optional note under the chips, for when the option list itself needs explaining. */
  hint?: string;
};

/**
 * Tri-state picker for short, fixed option lists — genres above all.
 *
 * A popover was the wrong call here: the list is nineteen items that never
 * change, and "thriller + comedy" is the single most common thing anyone does
 * on a film site. Burying it behind open -> search -> click made the common
 * case slower than the rare one. Chips are scannable and cost one click.
 *
 * Same semantics as FacetSelect: click to require, click again to forbid,
 * a third time to clear.
 */
export const ChipFacet = ({
  label,
  options,
  facet,
  onChange,
  hint,
  matchAny,
  matchAll,
  includeLabel,
  excludeLabel,
  allowMode = true,
  allowExclude = true,
}: ChipFacetProps) => {
  const [pick, setPick] = useState<PickMode>("include");

  const stateOf = (value: string) => {
    if (facet.include.includes(value)) return "include" as const;
    if (facet.exclude.includes(value)) return "exclude" as const;
    return "off" as const;
  };

  const pickOne = (value: string) => {
    const next = applyPick(
      value,
      allowExclude ? pick : "include",
      facet.include,
      facet.exclude,
    );
    onChange({ ...next, mode: facet.mode });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </span>
        {allowExclude ? (
          <PickModeToggle
            mode={pick}
            onChange={setPick}
            includeLabel={includeLabel}
            excludeLabel={excludeLabel}
          />
        ) : null}
        {allowMode && facet.include.length > 1 ? (
          <ModeToggle
            mode={facet.mode}
            onChange={(mode: MatchMode) => onChange({ ...facet, mode })}
            anyLabel={matchAny}
            allLabel={matchAll}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const state = stateOf(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => pickOne(option.value)}
              aria-pressed={state !== "off"}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                state === "off" &&
                  "border-edge bg-surface-raised text-ink-dim hover:border-edge-strong hover:text-ink",
                state === "include" &&
                  "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
                state === "exclude" &&
                  "border-danger/50 bg-danger/10 text-danger line-through decoration-danger/60",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {hint ? (
        <p className="text-[11px] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
};
