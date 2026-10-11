"use client";

import { Plus, X } from "lucide-react";

import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import type { Band, RangeFacet } from "@/lib/filters/schema";

export type RangeLabels = {
  from: string;
  to: string;
  addBand: string;
  bandsTitle: string;
};

type RangeFieldProps = {
  label: string;
  range: RangeFacet;
  onChange: (range: RangeFacet) => void;
  labels: RangeLabels;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  /**
   * Carve-outs are only offered where the underlying field is present in the
   * list payload, so our post-filter can apply them exactly.
   */
  allowBands?: boolean;
};

const parse = (value: string, step: number): number | undefined => {
  const parsed =
    step < 1 ? Number.parseFloat(value) : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * The one control every range-shaped filter uses: year, runtime, rating value,
 * vote count. Bounds plus any number of excluded bands, so "1990–2026 but not
 * 2010–2014" is expressible in the same place as a plain minimum.
 */
export const RangeField = ({
  label,
  range,
  onChange,
  labels,
  min,
  max,
  step = 1,
  hint,
  allowBands = true,
}: RangeFieldProps) => {
  const setBand = (index: number, patch: Partial<Band>) => {
    const exclude = range.exclude.map((band, position) =>
      position === index ? { ...band, ...patch } : band,
    );
    onChange({ ...range, exclude });
  };

  const active =
    range.min !== undefined ||
    range.max !== undefined ||
    range.exclude.length > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </span>
        {allowBands ? (
          <button
            type="button"
            onClick={() =>
              onChange({ ...range, exclude: [...range.exclude, {}] })
            }
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-ink-faint transition-colors hover:text-danger"
            title={labels.addBand}
          >
            <Plus size={11} />
            {labels.addBand}
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          placeholder={labels.from}
          value={range.min ?? ""}
          onChange={(event) =>
            onChange({ ...range, min: parse(event.target.value, step) })
          }
          className={cn(inputClass, active && "border-accent/40")}
        />
        <span className="text-ink-faint">—</span>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          placeholder={labels.to}
          value={range.max ?? ""}
          onChange={(event) =>
            onChange({ ...range, max: parse(event.target.value, step) })
          }
          className={cn(inputClass, active && "border-accent/40")}
        />
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
                min={min}
                max={max}
                step={step}
                placeholder={labels.from}
                value={band.min ?? ""}
                onChange={(event) =>
                  setBand(index, { min: parse(event.target.value, step) })
                }
                className={cn(inputClass, "py-1.5")}
              />
              <span className="text-ink-faint">—</span>
              <input
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                step={step}
                placeholder={labels.to}
                value={band.max ?? ""}
                onChange={(event) =>
                  setBand(index, { max: parse(event.target.value, step) })
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

      {hint ? (
        <p className="text-[11px] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
};
