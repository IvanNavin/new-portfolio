/**
 * Honest "best of" ranking.
 *
 * Sorting by a raw average is the flaw every other catalog has: a film with
 * three 10/10 votes outranks a masterpiece with 400k votes. We use the same
 * Bayesian weighted rating IMDb uses for its Top 250, which pulls low-vote
 * titles toward the catalog mean until they earn their place.
 *
 *   WR = (v / (v + m)) * R + (m / (v + m)) * C
 */
import type { RatingSource } from "./schema";
import type { Ratings, RatingValue } from "./types";

/**
 * Catalog-wide mean rating per source (the "C" term). These are the prior a
 * title regresses toward when it has few votes. Both sit slightly above the
 * scale midpoint because people mostly rate things they chose to watch.
 */
export const CATALOG_MEAN = {
  tmdb: 6.4,
  imdb: 6.8,
} as const;

export const bayesianScore = (
  rating: RatingValue | null,
  mean: number,
  minVotes: number,
): number | null => {
  if (!rating || rating.votes <= 0) return null;
  // m = 0 would make the prior vanish and reintroduce the 3-votes-10.0 problem,
  // so keep a floor even when the user drags the votes filter to zero.
  const m = Math.max(minVotes, 50);
  const v = rating.votes;
  return (v / (v + m)) * rating.value + (m / (v + m)) * mean;
};

/**
 * Blends every source we have, weighted by how many votes each carries — a
 * title with 500k IMDb votes and 900 TMDB votes should lean IMDb.
 */
const mixedScore = (ratings: Ratings, minVotes: number): number | null => {
  const parts: { score: number; weight: number }[] = [];
  const tmdb = bayesianScore(ratings.tmdb, CATALOG_MEAN.tmdb, minVotes);
  const imdb = bayesianScore(ratings.imdb, CATALOG_MEAN.imdb, minVotes);

  if (tmdb !== null && ratings.tmdb)
    parts.push({ score: tmdb, weight: ratings.tmdb.votes });
  if (imdb !== null && ratings.imdb)
    parts.push({ score: imdb, weight: ratings.imdb.votes });
  if (!parts.length) return null;

  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  if (totalWeight <= 0) return null;
  return parts.reduce(
    (sum, part) => sum + part.score * (part.weight / totalWeight),
    0,
  );
};

/** Returns 0 when the chosen source has no usable rating, so such titles sink. */
export const computeScore = (
  ratings: Ratings,
  source: RatingSource,
  minVotes: number,
): number => {
  const value =
    source === "mixed"
      ? mixedScore(ratings, minVotes)
      : bayesianScore(ratings[source], CATALOG_MEAN[source], minVotes);
  return value === null ? 0 : Math.round(value * 100) / 100;
};

/** The raw rating for the chosen source, for display next to the score. */
export const rawRating = (
  ratings: Ratings,
  source: RatingSource,
): RatingValue | null =>
  source === "mixed" ? (ratings.imdb ?? ratings.tmdb) : ratings[source];
