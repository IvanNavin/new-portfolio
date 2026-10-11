"use client";

import { useTranslations } from "next-intl";

import { useFilters } from "@/components/filters/useFilters";
import { Chip } from "@/components/ui/Chip";
import { buildPresets } from "@/lib/filters/presets";
import { serializeFilterQuery } from "@/lib/filters/schema";

/** @param currentYear resolved on the server so client and server agree. */
export const PresetChips = ({ currentYear }: { currentYear: number }) => {
  const t = useTranslations("presets");
  const { query, replace } = useFilters();

  const presets = buildPresets(currentYear);
  // Compare ignoring page size — it is a view preference, not part of a preset.
  const active = serializeFilterQuery({
    ...query,
    page: 1,
    perPage: 20,
  }).toString();

  const yearFor = (id: string): number | undefined => {
    if (id.endsWith("ThisYear")) return currentYear;
    if (id.endsWith("LastYear")) return currentYear - 1;
    return undefined;
  };

  return (
    // Nine stacked chips would push the results below the fold on a phone, so
    // the row scrolls sideways there and only wraps once there is width for it.
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {presets.map((preset) => {
        const serialized = serializeFilterQuery({
          ...preset.query,
          perPage: 20,
        }).toString();
        const year = yearFor(preset.id);
        return (
          <Chip
            key={preset.id}
            active={serialized === active}
            onClick={() => replace({ ...preset.query, perPage: query.perPage })}
          >
            {year === undefined ? t(preset.id) : t(preset.id, { year })}
          </Chip>
        );
      })}
    </div>
  );
};
