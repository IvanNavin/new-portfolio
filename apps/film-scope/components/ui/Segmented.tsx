"use client";

import { cn } from "@/lib/cn";

type SegmentedProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export const Segmented = <T extends string>({
  value,
  options,
  onChange,
}: SegmentedProps<T>) => (
  <div className="inline-flex rounded-lg border border-edge bg-surface-raised p-0.5">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm transition-colors",
          option.value === value
            ? "bg-accent-soft text-accent"
            : "text-ink-dim hover:text-ink",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);
