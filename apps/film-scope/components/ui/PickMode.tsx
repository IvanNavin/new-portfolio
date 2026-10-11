"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/cn";

export type PickMode = "include" | "exclude";

/**
 * Says out loud what a click will do.
 *
 * The first version cycled off -> include -> exclude on repeated clicks. It was
 * compact and completely unguessable: nothing on screen said a second click
 * meant "exclude", and undoing an accidental exclude meant clicking a third
 * time. Now the mode is visible and sticky, so a click is always one known
 * action and clicking the same chip again just undoes it.
 */
export const PickModeToggle = ({
  mode,
  onChange,
  includeLabel,
  excludeLabel,
}: {
  mode: PickMode;
  onChange: (mode: PickMode) => void;
  includeLabel: string;
  excludeLabel: string;
}) => (
  <div className="inline-flex rounded-md border border-edge bg-surface p-0.5 text-[11px]">
    <button
      type="button"
      onClick={() => onChange("include")}
      aria-pressed={mode === "include"}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
        mode === "include"
          ? "bg-emerald-500/15 text-emerald-300"
          : "text-ink-faint hover:text-ink",
      )}
    >
      <Plus size={10} />
      {includeLabel}
    </button>
    <button
      type="button"
      onClick={() => onChange("exclude")}
      aria-pressed={mode === "exclude"}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
        mode === "exclude"
          ? "bg-danger/15 text-danger"
          : "text-ink-faint hover:text-ink",
      )}
    >
      <Minus size={10} />
      {excludeLabel}
    </button>
  </div>
);

/** Applies one click in the given mode to a facet's two buckets. */
export const applyPick = <T,>(
  value: T,
  mode: PickMode,
  include: readonly T[],
  exclude: readonly T[],
): { include: T[]; exclude: T[] } => {
  const bucket = mode === "include" ? include : exclude;
  const stripped = {
    include: include.filter((item) => item !== value),
    exclude: exclude.filter((item) => item !== value),
  };
  // Clicking something already in the active bucket removes it — the same
  // gesture undoes itself, which is the part the cycle got wrong.
  if (bucket.includes(value)) return stripped;
  return mode === "include"
    ? { ...stripped, include: [...stripped.include, value] }
    : { ...stripped, exclude: [...stripped.exclude, value] };
};
