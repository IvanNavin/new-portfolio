"use client";

import { useTranslations } from "next-intl";

import { Segmented } from "@/components/ui/Segmented";
import type { FilterQuery } from "@/lib/filters/schema";

/**
 * Surfaces "is it a cartoon?" next to the media type, where people look for it.
 *
 * TMDB models animation as a genre, and an animated feature genuinely is a
 * film — so "Films" returning Soul and The Wild Robot is correct, not a bug.
 * But every catalog in this market (Rezka, Kinopoisk) splits Films / Series /
 * Cartoons as top-level categories, and that is the mental model people arrive
 * with. Being technically right about TMDB's taxonomy is not a reason to make
 * the interface surprising.
 *
 * It drives its own query field rather than the genre list, because it has to
 * AND with whatever genres are selected — see the note on `animation` in the
 * schema.
 */
export const AnimationToggle = ({
  value,
  onChange,
}: {
  value: FilterQuery["animation"];
  onChange: (value: FilterQuery["animation"]) => void;
}) => {
  const t = useTranslations("filters.animation");

  return (
    <Segmented<FilterQuery["animation"]>
      value={value}
      onChange={onChange}
      options={[
        { value: "any", label: t("any") },
        { value: "without", label: t("without") },
        { value: "only", label: t("only") },
      ]}
    />
  );
};
