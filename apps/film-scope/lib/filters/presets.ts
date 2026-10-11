/**
 * One-click starting points. A preset is just a fully-formed FilterQuery, so
 * clicking one lands the user in the normal filter UI with everything set —
 * nothing is hidden or magic, and every knob stays adjustable afterwards.
 *
 * Labels are i18n keys resolved by the UI as `presets.<id>`.
 */
import { MOVIE_GENRES } from "../tmdb/genres";
import { DEFAULT_FILTERS, type FilterQuery, type SetFacet } from "./schema";

export type Preset = {
  id: string;
  query: FilterQuery;
};

const base = (patch: Partial<FilterQuery>): FilterQuery => ({
  ...DEFAULT_FILTERS,
  ...patch,
});

const set = <T>(include: T[], mode: "any" | "all" = "any"): SetFacet<T> => ({
  include,
  exclude: [],
  mode,
});

const votes = (min: number, max?: number) => ({ min, max, exclude: [] });
const value = (min?: number, max?: number) => ({ min, max, exclude: [] });
const years = (min?: number, max?: number) => ({ min, max, exclude: [] });

const rating = (
  patch: Partial<FilterQuery["rating"]>,
): FilterQuery["rating"] => ({
  ...DEFAULT_FILTERS.rating,
  ...patch,
});

const sort = (by: FilterQuery["sort"]["by"]): FilterQuery["sort"] => ({
  by,
  dir: "desc",
});

/**
 * @param currentYear passed in rather than read from the clock so the caller
 *   controls it (server render, tests, and the extension all differ).
 */
export const buildPresets = (currentYear: number): Preset[] => [
  {
    id: "bestMoviesThisYear",
    query: base({
      type: "movie",
      year: years(currentYear, currentYear),
      // A film released weeks ago has not accumulated votes yet, so the usual
      // 300 threshold would return an empty page for the current year.
      rating: rating({ votes: votes(50) }),
      sort: sort("score"),
    }),
  },
  {
    id: "bestMoviesLastYear",
    query: base({
      type: "movie",
      year: years(currentYear - 1, currentYear - 1),
      rating: rating({ votes: votes(200) }),
      sort: sort("score"),
    }),
  },
  {
    id: "bestTvThisYear",
    query: base({
      type: "tv",
      year: years(currentYear, currentYear),
      rating: rating({ votes: votes(30) }),
      sort: sort("score"),
    }),
  },
  {
    id: "bestTvLastYear",
    query: base({
      type: "tv",
      year: years(currentYear - 1, currentYear - 1),
      rating: rating({ votes: votes(100) }),
      sort: sort("score"),
    }),
  },
  {
    id: "bestFamilyFiveYears",
    query: base({
      type: "movie",
      genres: set([MOVIE_GENRES.family]),
      // Genre alone lets through titles merely *tagged* family; the age
      // certification is what actually makes the list safe to watch together.
      certification: { region: "US", max: "PG" },
      year: years(currentYear - 5, currentYear),
      rating: rating({ votes: votes(200) }),
      sort: sort("score"),
    }),
  },
  {
    id: "bestOfAllTime",
    query: base({
      type: "movie",
      rating: rating({ votes: votes(5000) }),
      sort: sort("score"),
    }),
  },
  {
    id: "hiddenGems",
    query: base({
      type: "movie",
      // Enough votes for the score to mean something, few enough that the
      // title never reached a mainstream audience.
      rating: rating({ votes: votes(300, 5000), value: value(7) }),
      sort: sort("score"),
    }),
  },
  {
    id: "shortAndGood",
    query: base({
      type: "movie",
      runtime: { max: 100, exclude: [] },
      rating: rating({ votes: votes(1000), value: value(7) }),
      sort: sort("score"),
    }),
  },
  {
    id: "finishedTv",
    query: base({
      type: "tv",
      // Status 3 = Ended, 4 = Cancelled: shows you can binge without waiting.
      tvStatus: [3, 4],
      rating: rating({ votes: votes(500) }),
      sort: sort("score"),
    }),
  },
  {
    id: "ongoingTv",
    query: base({
      type: "tv",
      // 0 = Returning Series.
      tvStatus: [0],
      rating: rating({ votes: votes(300) }),
      sort: sort("score"),
    }),
  },
];
