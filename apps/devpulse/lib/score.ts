import { KEYWORD_BOOSTS, KeywordBoost } from "./keywords";
import { DEFAULT_SOURCE_WEIGHT } from "./sources";
import type { SourceWeightMap } from "./sourcesDb";
import type { UserBoost } from "./userBoosts";

export type ScoredFields = {
  /** Final sort score = sourceWeight + sum(matched keyword weights). */
  score: number;
  /** True iff at least one keyword from the curated or personal list matched. */
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
 * Merge curated + per-user boosts into one list. Curated take priority
 * (label collisions favor the curated definition), then user adds on
 * top. Returns a stable array — the caller can cache it across N items.
 */
export function mergeBoosts(userBoosts: UserBoost[]): KeywordBoost[] {
  const seenLabels = new Set(KEYWORD_BOOSTS.map((b) => b.label));
  const merged: KeywordBoost[] = [...KEYWORD_BOOSTS];
  for (const b of userBoosts) {
    if (seenLabels.has(b.label)) continue;
    merged.push({ label: b.label, terms: b.terms, weight: b.weight });
  }
  return merged;
}

/**
 * Hot path: called once per row on every feed render (~80 rows).
 * The boosts list is passed in (curated alone for unauth, merged with
 * the user's personal list for signed-in renders) so the caller can
 * fetch it once per request and reuse across N items.
 */
export function scoreItem(
  item: ItemForScoring,
  weights: SourceWeightMap,
  boosts: KeywordBoost[] = KEYWORD_BOOSTS,
): ScoredFields {
  const haystack = (item.title + " " + (item.excerpt ?? "")).toLowerCase();
  const base = weights.get(item.source) ?? DEFAULT_SOURCE_WEIGHT;
  let bonus = 0;
  const matches: string[] = [];

  for (const boost of boosts) {
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
