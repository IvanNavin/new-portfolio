import { KEYWORD_BOOSTS } from "./keywords";
import { DEFAULT_SOURCE_WEIGHT } from "./sources";
import type { SourceWeightMap } from "./sourcesDb";

export type ScoredFields = {
  /** Final sort score = sourceWeight + sum(matched keyword weights). */
  score: number;
  /** True iff at least one keyword from lib/keywords.ts matched. */
  boosted: boolean;
  /** Labels of every keyword group that matched, for display chips. */
  matches: string[];
};

export type ItemForScoring = {
  title: string;
  excerpt: string | null;
  source: string;
};

/**
 * Hot path: called once per row on every feed render (~80 rows). Builds the
 * haystack once, runs an `indexOf` per term. No regex, no allocations in
 * the inner loop beyond the matches array.
 *
 * The weight map is passed in (rather than imported) so the caller can
 * fetch it once per request from the DB and reuse across N items — keeps
 * scoring synchronous and removes N round-trips.
 */
export function scoreItem(
  item: ItemForScoring,
  weights: SourceWeightMap,
): ScoredFields {
  const haystack = (item.title + " " + (item.excerpt ?? "")).toLowerCase();
  const base = weights.get(item.source) ?? DEFAULT_SOURCE_WEIGHT;
  let bonus = 0;
  const matches: string[] = [];

  for (const boost of KEYWORD_BOOSTS) {
    for (const term of boost.terms) {
      if (haystack.includes(term)) {
        bonus += boost.weight;
        matches.push(boost.label);
        break; // one match per boost group is enough
      }
    }
  }

  return {
    score: base + bonus,
    boosted: bonus > 0,
    matches,
  };
}
