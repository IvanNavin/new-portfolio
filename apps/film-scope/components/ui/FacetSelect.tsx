"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Minus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip } from "@/components/ui/Chip";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
  applyPick,
  type PickMode,
  PickModeToggle,
} from "@/components/ui/PickMode";
import { cn } from "@/lib/cn";
import type { MatchMode, SetFacet } from "@/lib/filters/schema";

export type FacetOptionItem = { value: string; label: string };

type Tri = "off" | "include" | "exclude";

export type FacetLabels = {
  search: string;
  empty: string;
  any: string;
  include: string;
  exclude: string;
  matchAny: string;
  matchAll: string;
};

type FacetSelectProps = {
  label: string;
  options: FacetOptionItem[];
  facet: SetFacet<string>;
  onChange: (facet: SetFacet<string>) => void;
  labels: FacetLabels;
  /**
   * Some facets are include-only because neither TMDB nor our post-filter can
   * deliver the exclusion (TV status, TV type). Hiding the affordance is
   * honest; offering a control that silently does nothing is not.
   */
  allowExclude?: boolean;
  allowMode?: boolean;
  hint?: string;
};

const STATE_STYLE: Record<Tri, string> = {
  off: "text-ink-dim",
  include: "text-emerald-400",
  exclude: "text-danger",
};

/**
 * The one control every set-shaped filter uses.
 *
 * Click an option once to require it, again to forbid it, a third time to
 * clear. That is what makes "every country except Russia" a two-click
 * operation instead of a separate UI.
 */
export const FacetSelect = ({
  label,
  options,
  facet,
  onChange,
  labels,
  allowExclude = true,
  allowMode = true,
  hint,
}: FacetSelectProps) => {
  const [term, setTerm] = useState("");
  const [pick, setPick] = useState<PickMode>("include");

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(needle),
    );
  }, [options, term]);

  const labelOf = (value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  const stateOf = (value: string): Tri => {
    if (facet.include.includes(value)) return "include";
    if (facet.exclude.includes(value)) return "exclude";
    return "off";
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

  const remove = (value: string) =>
    onChange({
      include: facet.include.filter((item) => item !== value),
      exclude: facet.exclude.filter((item) => item !== value),
      mode: facet.mode,
    });

  const active = facet.include.length + facet.exclude.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </span>
        {allowMode && facet.include.length > 1 ? (
          <ModeToggle
            mode={facet.mode}
            onChange={(mode: MatchMode) => onChange({ ...facet, mode })}
            anyLabel={labels.matchAny}
            allLabel={labels.matchAll}
          />
        ) : null}
      </div>

      <Popover.Root>
        <Popover.Trigger
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
            active
              ? "border-accent/50 bg-accent-soft text-ink"
              : "border-edge bg-surface-raised text-ink-dim hover:border-edge-strong",
          )}
        >
          <span className="truncate">
            {active
              ? [
                  facet.include.length ? `+${facet.include.length}` : null,
                  facet.exclude.length ? `−${facet.exclude.length}` : null,
                ]
                  .filter(Boolean)
                  .join(" ")
              : labels.any}
          </span>
          <ChevronDown size={16} className="shrink-0 opacity-60" />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align="start"
            className="z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-edge bg-surface-raised p-2 shadow-2xl shadow-black/40"
          >
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={labels.search}
              className="mb-2 w-full rounded-lg border border-edge bg-surface px-2.5 py-1.5 text-sm outline-none placeholder:text-ink-faint focus:border-accent/60"
            />

            {allowExclude ? (
              <div className="pb-2">
                <PickModeToggle
                  mode={pick}
                  onChange={setPick}
                  includeLabel={labels.include}
                  excludeLabel={labels.exclude}
                />
              </div>
            ) : null}

            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-sm text-ink-faint">
                  {labels.empty}
                </p>
              ) : (
                filtered.map((option) => {
                  const state = stateOf(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => pickOne(option.value)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-sunken"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center",
                          STATE_STYLE[state],
                        )}
                      >
                        {state === "include" ? <Check size={14} /> : null}
                        {state === "exclude" ? <X size={14} /> : null}
                        {state === "off" ? (
                          <Minus size={14} className="opacity-25" />
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "truncate",
                          state === "exclude" && "text-danger line-through",
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Selected values stay visible without opening the popover. */}
      {active ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {facet.include.map((value) => (
            <Chip
              key={`in-${value}`}
              tone="include"
              onRemove={() => remove(value)}
            >
              {labelOf(value)}
            </Chip>
          ))}
          {facet.exclude.map((value) => (
            <Chip
              key={`ex-${value}`}
              tone="exclude"
              onRemove={() => remove(value)}
            >
              {labelOf(value)}
            </Chip>
          ))}
        </div>
      ) : null}

      {hint ? (
        <p className="text-[11px] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
};
