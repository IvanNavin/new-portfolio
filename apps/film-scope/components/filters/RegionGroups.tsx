"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { type PickMode, PickModeToggle } from "@/components/ui/PickMode";
import { cn } from "@/lib/cn";
import { groupState, REGION_GROUPS } from "@/lib/filters/regions";
import type { SetFacet } from "@/lib/filters/schema";

/**
 * "Everything except the CIS" as one click.
 *
 * Origin is the one facet where the real intent is usually a bloc, not a
 * country: nobody wants to tick ten checkboxes to say "nothing from over
 * there". Groups write straight into the same country lists the picker below
 * edits, so they are a shortcut and never a separate source of truth.
 */
export const RegionGroups = ({
  countries,
  onChange,
}: {
  countries: SetFacet<string>;
  onChange: (countries: SetFacet<string>) => void;
}) => {
  const t = useTranslations("filters.regions");
  const labels = useTranslations("filters");
  const [pick, setPick] = useState<PickMode>("include");

  const toggle = (groupId: string) => {
    const group = REGION_GROUPS.find((entry) => entry.id === groupId);
    if (!group) return;

    const state = groupState(group, countries.include, countries.exclude);
    const stripped = {
      include: countries.include.filter(
        (code) => !group.countries.includes(code),
      ),
      exclude: countries.exclude.filter(
        (code) => !group.countries.includes(code),
      ),
    };

    // Clicking a group that is already fully applied in the active mode clears it.
    if (state === pick) {
      onChange({ ...stripped, mode: countries.mode });
      return;
    }

    onChange({
      ...stripped,
      [pick]: [...stripped[pick], ...group.countries],
      mode: countries.mode,
    } as SetFacet<string>);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {t("label")}
        </span>
        <PickModeToggle
          mode={pick}
          onChange={setPick}
          includeLabel={labels("include")}
          excludeLabel={labels("exclude")}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {REGION_GROUPS.map((group) => {
          const state = groupState(group, countries.include, countries.exclude);
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => toggle(group.id)}
              aria-pressed={state !== null}
              title={group.countries.join(", ")}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                state === null &&
                  "border-edge bg-surface-raised text-ink-dim hover:border-edge-strong hover:text-ink",
                state === "include" &&
                  "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
                state === "exclude" &&
                  "border-danger/50 bg-danger/10 text-danger line-through decoration-danger/60",
              )}
            >
              {t(group.id)}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] leading-snug text-ink-faint">{t("hint")}</p>
    </div>
  );
};
