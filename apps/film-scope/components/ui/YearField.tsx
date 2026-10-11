"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { inputClass } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { cn } from "@/lib/cn";
import type { RangeFacet } from "@/lib/filters/schema";

export type YearLabels = {
  label: string;
  exact: string;
  range: string;
  from: string;
  to: string;
  addBand: string;
  bandsTitle: string;
  /** ICU template with {decade}, e.g. "{decade}s". */
  decade: string;
};

type YearFieldProps = {
  range: RangeFacet;
  onChange: (range: RangeFacet) => void;
  labels: YearLabels;
  currentYear: number;
  minYear: number;
};

const DECADE_COUNT = 5;

/**
 * "Best films of 2008" has to be one click, not two typed numbers.
 *
 * A bare from/to pair made the most common intent — a single year — the most
 * awkward thing to express. So the default mode is one year (min = max), a
 * range is one toggle away, and the years people actually reach for sit right
 * there as chips.
 */
export const YearField = ({
  range,
  onChange,
  labels,
  currentYear,
  minYear,
}: YearFieldProps) => {
  const isExact = range.min !== undefined && range.min === range.max;
  const [mode, setMode] = useState<"exact" | "range">(
    isExact || (range.min === undefined && range.max === undefined)
      ? "exact"
      : "range",
  );

  const parse = (value: string): number | undefined => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const setExact = (year: number | undefined) =>
    onChange({ ...range, min: year, max: year });

  const setDecade = (start: number) =>
    onChange({ ...range, min: start, max: start + 9 });

  const activeYear = isExact ? range.min : undefined;
  const decades = Array.from(
    { length: DECADE_COUNT },
    (_, index) => Math.floor(currentYear / 10) * 10 - index * 10,
  );

  const isDecade = (start: number) =>
    range.min === start && range.max === start + 9;

  const chipClass = (active: boolean) =>
    cn(
      "rounded-full border px-2.5 py-1 text-xs transition-colors",
      active
        ? "border-accent/60 bg-accent-soft text-accent"
        : "border-edge bg-surface-raised text-ink-dim hover:border-edge-strong hover:text-ink",
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {labels.label}
        </span>
        <Segmented<"exact" | "range">
          value={mode}
          onChange={(next) => {
            setMode(next);
            // Switching to a range from a single year keeps it as the lower
            // bound rather than silently discarding what was typed.
            if (next === "range" && isExact)
              onChange({ ...range, max: undefined });
          }}
          options={[
            { value: "exact", label: labels.exact },
            { value: "range", label: labels.range },
          ]}
        />
      </div>

      {mode === "exact" ? (
        <input
          type="number"
          inputMode="numeric"
          min={minYear}
          max={currentYear + 5}
          placeholder={String(currentYear)}
          value={activeYear ?? ""}
          onChange={(event) => setExact(parse(event.target.value))}
          className={cn(
            inputClass,
            activeYear !== undefined && "border-accent/40",
          )}
        />
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={minYear}
            placeholder={labels.from}
            value={range.min ?? ""}
            onChange={(event) =>
              onChange({ ...range, min: parse(event.target.value) })
            }
            className={inputClass}
          />
          <span className="text-ink-faint">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={minYear}
            placeholder={labels.to}
            value={range.max ?? ""}
            onChange={(event) =>
              onChange({ ...range, max: parse(event.target.value) })
            }
            className={inputClass}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => {
              setMode("exact");
              setExact(activeYear === year ? undefined : year);
            }}
            className={chipClass(activeYear === year)}
          >
            {year}
          </button>
        ))}
        {decades.map((start) => (
          <button
            key={start}
            type="button"
            onClick={() => {
              setMode("range");
              if (isDecade(start))
                onChange({ ...range, min: undefined, max: undefined });
              else setDecade(start);
            }}
            className={chipClass(isDecade(start))}
          >
            {labels.decade.replace("{decade}", String(start))}
          </button>
        ))}
      </div>

      {range.exclude.length ? (
        <div className="space-y-1.5 rounded-lg border border-danger/30 bg-danger/5 p-2">
          <p className="text-[11px] uppercase tracking-wide text-danger">
            {labels.bandsTitle}
          </p>
          {range.exclude.map((band, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                placeholder={labels.from}
                value={band.min ?? ""}
                onChange={(event) =>
                  onChange({
                    ...range,
                    exclude: range.exclude.map((entry, position) =>
                      position === index
                        ? { ...entry, min: parse(event.target.value) }
                        : entry,
                    ),
                  })
                }
                className={cn(inputClass, "py-1.5")}
              />
              <span className="text-ink-faint">—</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder={labels.to}
                value={band.max ?? ""}
                onChange={(event) =>
                  onChange({
                    ...range,
                    exclude: range.exclude.map((entry, position) =>
                      position === index
                        ? { ...entry, max: parse(event.target.value) }
                        : entry,
                    ),
                  })
                }
                className={cn(inputClass, "py-1.5")}
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...range,
                    exclude: range.exclude.filter(
                      (_, position) => position !== index,
                    ),
                  })
                }
                aria-label={labels.bandsTitle}
                className="rounded-md p-1.5 text-ink-faint transition-colors hover:text-danger"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onChange({ ...range, exclude: [...range.exclude, {}] })}
        className="inline-flex items-center gap-1 text-[11px] text-ink-faint transition-colors hover:text-danger"
      >
        <Plus size={11} />
        {labels.addBand}
      </button>
    </div>
  );
};
