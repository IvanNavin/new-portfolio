/**
 * The filter contract.
 *
 * Every filter is one of exactly two shapes, so the UI, the query builder and
 * the URL codec all treat them uniformly and nothing is a special case:
 *
 *   SetFacet   — pick values: include / exclude / match-any-or-all
 *   RangeFacet — pick bounds: min / max, plus any number of excluded bands
 *
 * "Exclude" is only offered where we can actually deliver it — either TMDB has
 * a `without_*` parameter, or the field is present in the list payload (or
 * cheaply resolvable) so our post-filter can do it exactly. Facets where
 * neither is true are include-only and say so in a comment, rather than
 * pretending.
 *
 * Deliberately free of any Next.js / React import so this folder can move to
 * `packages/film-scope-core` untouched when the extension lands.
 */
import { z } from "zod";

import { REGION_GROUPS } from "./regions";

export const TITLE_TYPES = ["movie", "tv", "both"] as const;
export type TitleType = (typeof TITLE_TYPES)[number];

export const RATING_SOURCES = ["tmdb", "imdb", "mixed"] as const;
export type RatingSource = (typeof RATING_SOURCES)[number];

export const SORT_FIELDS = [
  "score",
  "votes",
  "release",
  "runtime",
  "popularity",
  "revenue",
  "title",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const MONETIZATION_TYPES = [
  "flatrate",
  "free",
  "ads",
  "rent",
  "buy",
] as const;
export type Monetization = (typeof MONETIZATION_TYPES)[number];

/** US certification ladder, least to most restrictive. Index = severity. */
export const CERT_LADDER = ["G", "PG", "PG-13", "R", "NC-17"] as const;

/**
 * TMDB documents `with_status` / `with_type` only as "0..5" / "0..6" without
 * naming the codes. These are the community-documented meanings; they drive
 * labels only, so a wrong label would be cosmetic, never a wrong query.
 */
export const TV_STATUS = [
  { value: 0, key: "returning" },
  { value: 1, key: "planned" },
  { value: 2, key: "inProduction" },
  { value: 3, key: "ended" },
  { value: 4, key: "cancelled" },
  { value: 5, key: "pilot" },
] as const;

export const TV_TYPES = [
  { value: 0, key: "documentary" },
  { value: 1, key: "news" },
  { value: 2, key: "miniseries" },
  { value: 3, key: "reality" },
  { value: 4, key: "scripted" },
  { value: 5, key: "talkShow" },
  { value: 6, key: "video" },
] as const;

/**
 * Results per page. Every value is a multiple of TMDB's fixed 20-per-page, so
 * one of our pages maps onto a whole number of upstream pages with no overlap
 * and no gaps.
 */
export const PAGE_SIZES = [20, 40, 60, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 20;

/** Votes threshold below which a rating is statistically meaningless. */
export const DEFAULT_MIN_VOTES = 300;
export const FIRST_FILM_YEAR = 1874;

/* ------------------------------------------------------------------ *
 * The two universal shapes
 * ------------------------------------------------------------------ */

export const MATCH_MODES = ["any", "all"] as const;
export type MatchMode = (typeof MATCH_MODES)[number];

export type SetFacet<T> = {
  include: T[];
  exclude: T[];
  /** 'all' = must have every included value, 'any' = at least one. */
  mode: MatchMode;
};

export type Band = { min?: number; max?: number };

export type RangeFacet = Band & {
  /** Carve-outs inside the range: "1990–2026 but not 2010–2014". */
  exclude: Band[];
};

const setFacet = <T extends z.ZodTypeAny>(item: T) =>
  z
    .object({
      include: z.array(item).default([]),
      exclude: z.array(item).default([]),
      mode: z.enum(MATCH_MODES).default("any"),
    })
    .default({});

const band = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
});

const rangeFacet = (min?: number, max?: number) =>
  z
    .object({
      min: z
        .number()
        .min(min ?? -Infinity)
        .max(max ?? Infinity)
        .optional(),
      max: z
        .number()
        .min(min ?? -Infinity)
        .max(max ?? Infinity)
        .optional(),
      exclude: z.array(band).default([]),
    })
    .default({});

const isoCountry = z.string().length(2).toUpperCase();
const isoLanguage = z.string().min(2).max(3).toLowerCase();
const tmdbId = z.number().int().positive();

/* ------------------------------------------------------------------ *
 * The query
 * ------------------------------------------------------------------ */

export const filterQuerySchema = z.object({
  type: z.enum(TITLE_TYPES).default("movie"),

  /** exclude: TMDB `without_genres`. */
  genres: setFacet(tmdbId),

  /**
   * Animation is a TMDB genre (id 16), but people reach for it as a *type* —
   * every catalog in this market lists Films / Series / Cartoons side by side.
   * It gets its own field rather than riding along in `genres` because it must
   * always AND with whatever genres are picked, and TMDB's `with_genres` takes
   * a single separator: you cannot express "(family OR comedy) AND animation"
   * upstream. Kept separate, we can fold it in when the mode allows and
   * post-filter otherwise — genre ids are in every list payload, so that is exact.
   */
  animation: z.enum(["any", "only", "without"]).default("any"),

  /** exclude: TMDB `without_keywords`. */
  keywords: setFacet(tmdbId),

  /** exclude: TMDB `without_companies`. */
  companies: setFacet(tmdbId),

  /** exclude: resolved from each person's filmography, one request per person. */
  cast: setFacet(tmdbId),
  crew: setFacet(tmdbId),

  /** exclude: our post-filter — TMDB has no `without_origin_country`. */
  countries: setFacet(isoCountry),

  /** exclude: our post-filter — TMDB has no `without_original_language`. */
  languages: setFacet(isoLanguage),

  /** exclude: TMDB `without_watch_providers`. */
  providers: z
    .object({
      region: isoCountry.default("UA"),
      include: z.array(tmdbId).default([]),
      exclude: z.array(tmdbId).default([]),
      mode: z.enum(MATCH_MODES).default("any"),
      monetization: z.array(z.enum(MONETIZATION_TYPES)).default([]),
    })
    .default({}),

  /**
   * Range, not a set: TMDB exposes `certification`, `.gte` and `.lte` only, so
   * a ladder range is the most it can honestly express. Movies only — the TV
   * discover endpoint has no certification filter at all.
   */
  certification: z
    .object({
      region: isoCountry.default("US"),
      min: z.string().max(16).optional(),
      max: z.string().max(16).optional(),
    })
    .default({}),

  /** TV only, include-only: no `without_status` upstream and it is absent from list payloads. */
  tvStatus: z.array(z.number().int().min(0).max(5)).default([]),
  /** TV only, include-only, same reason. */
  tvTypes: z.array(z.number().int().min(0).max(6)).default([]),

  year: rangeFacet(FIRST_FILM_YEAR),
  /** Minutes. Per-episode for TV. */
  runtime: rangeFacet(0),

  rating: z
    .object({
      source: z.enum(RATING_SOURCES).default("tmdb"),
      /** The 0–10 score itself. */
      value: rangeFacet(0, 10),
      /** How many people voted. The single most important control here. */
      votes: z
        .object({
          min: z.number().int().min(0).default(DEFAULT_MIN_VOTES),
          max: z.number().int().min(0).optional(),
          exclude: z.array(band).default([]),
        })
        .default({}),
    })
    .default({}),

  sort: z
    .object({
      by: z.enum(SORT_FIELDS).default("score"),
      dir: z.enum(["asc", "desc"]).default("desc"),
    })
    .default({}),

  page: z.number().int().min(1).max(500).default(1),

  /** A view option rather than a filter — it never narrows anything. */
  perPage: z
    .union([z.literal(20), z.literal(40), z.literal(60), z.literal(100)])
    .default(DEFAULT_PAGE_SIZE),
});

export type FilterQuery = z.infer<typeof filterQuerySchema>;

export const DEFAULT_FILTERS: FilterQuery = filterQuerySchema.parse({});

/** Every set-shaped facet, for generic UI and summary code. */
export const SET_FACET_KEYS = [
  "genres",
  "keywords",
  "companies",
  "cast",
  "crew",
  "countries",
  "languages",
] as const;
export type SetFacetKey = (typeof SET_FACET_KEYS)[number];

export const RANGE_FACET_KEYS = ["year", "runtime"] as const;
export type RangeFacetKey = (typeof RANGE_FACET_KEYS)[number];

/* ------------------------------------------------------------------ *
 * URL codec
 *
 * Dotted and self-describing so a shared link stays readable:
 *   ?genres.include=10751&cast.exclude=1245&year.min=2021&year.exclude=2013-2015
 * ------------------------------------------------------------------ */

const csv = (raw: string | null): string[] | undefined => {
  if (!raw) return undefined;
  const out = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return out.length ? out : undefined;
};

const csvInts = (raw: string | null): number[] | undefined => {
  const parts = csv(raw);
  if (!parts) return undefined;
  const out = parts
    .map((part) => Number.parseInt(part, 10))
    .filter(Number.isFinite);
  return out.length ? out : undefined;
};

const int = (raw: string | null): number | undefined => {
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
};

const num = (raw: string | null): number | undefined => {
  if (!raw) return undefined;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
};

const str = (raw: string | null): string | undefined =>
  raw?.trim() || undefined;

/** "1990-1999,2010-2014" and open-ended "-1959" / "2020-" */
const bands = (raw: string | null): Band[] | undefined => {
  const parts = csv(raw);
  if (!parts) return undefined;
  const out: Band[] = [];
  for (const part of parts) {
    const [from, to] = part.split("-", 2);
    const min = Number.parseFloat(from);
    const max = to === undefined ? min : Number.parseFloat(to);
    const entry: Band = {};
    if (Number.isFinite(min)) entry.min = min;
    if (Number.isFinite(max)) entry.max = max;
    if (entry.min !== undefined || entry.max !== undefined) out.push(entry);
  }
  return out.length ? out : undefined;
};

const encodeBands = (list: readonly Band[]): string =>
  list
    .map((entry) => `${entry.min ?? ""}-${entry.max ?? ""}`)
    .filter((part) => part !== "-")
    .join(",");

const readSet = (params: URLSearchParams, key: string, numeric: boolean) => ({
  include: numeric
    ? csvInts(params.get(`${key}.include`))
    : csv(params.get(`${key}.include`)),
  exclude: numeric
    ? csvInts(params.get(`${key}.exclude`))
    : csv(params.get(`${key}.exclude`)),
  mode: str(params.get(`${key}.mode`)),
});

const readRange = (params: URLSearchParams, key: string) => ({
  min: num(params.get(`${key}.min`)),
  max: num(params.get(`${key}.max`)),
  exclude: bands(params.get(`${key}.exclude`)),
});

/** Lenient by design: a malformed param is dropped, never thrown, so a hand-edited URL still renders. */
export const parseFilterQuery = (params: URLSearchParams): FilterQuery => {
  const draft = {
    type: str(params.get("type")),
    animation: str(params.get("animation")),
    genres: readSet(params, "genres", true),
    keywords: readSet(params, "keywords", true),
    companies: readSet(params, "companies", true),
    cast: readSet(params, "cast", true),
    crew: readSet(params, "crew", true),
    countries: readSet(params, "countries", false),
    languages: readSet(params, "languages", false),
    providers: {
      region: str(params.get("providers.region")),
      include: csvInts(params.get("providers.include")),
      exclude: csvInts(params.get("providers.exclude")),
      mode: str(params.get("providers.mode")),
      monetization: csv(params.get("providers.monetization")),
    },
    certification: {
      region: str(params.get("certification.region")),
      min: str(params.get("certification.min")),
      max: str(params.get("certification.max")),
    },
    tvStatus: csvInts(params.get("tvStatus")),
    tvTypes: csvInts(params.get("tvTypes")),
    year: readRange(params, "year"),
    runtime: readRange(params, "runtime"),
    rating: {
      source: str(params.get("rating.source")),
      value: readRange(params, "rating.value"),
      votes: {
        min: int(params.get("rating.votes.min")),
        max: int(params.get("rating.votes.max")),
        exclude: bands(params.get("rating.votes.exclude")),
      },
    },
    sort: { by: str(params.get("sort.by")), dir: str(params.get("sort.dir")) },
    page: int(params.get("page")),
    perPage: int(params.get("perPage")),
  };

  // Strip undefined so zod's .default() applies to every missing field.
  const pruned = JSON.parse(JSON.stringify(draft));
  const result = filterQuerySchema.safeParse(pruned);
  return result.success ? result.data : DEFAULT_FILTERS;
};

/** Inverse of parseFilterQuery. Omits anything left at its default so shared URLs stay short. */
export const serializeFilterQuery = (query: FilterQuery): URLSearchParams => {
  const params = new URLSearchParams();

  const put = (key: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  };
  const putList = (key: string, list: readonly (string | number)[]) => {
    if (list.length) params.set(key, list.join(","));
  };
  const putSet = (key: string, facet: SetFacet<string | number>) => {
    putList(`${key}.include`, facet.include);
    putList(`${key}.exclude`, facet.exclude);
    // The mode only means anything with more than one included value.
    if (facet.mode !== "any" && facet.include.length > 1)
      put(`${key}.mode`, facet.mode);
  };
  const putRange = (key: string, facet: RangeFacet) => {
    put(`${key}.min`, facet.min);
    put(`${key}.max`, facet.max);
    if (facet.exclude.length) put(`${key}.exclude`, encodeBands(facet.exclude));
  };

  if (query.type !== DEFAULT_FILTERS.type) put("type", query.type);
  if (query.animation !== DEFAULT_FILTERS.animation)
    put("animation", query.animation);

  for (const key of SET_FACET_KEYS) putSet(key, query[key]);

  putList("providers.include", query.providers.include);
  putList("providers.exclude", query.providers.exclude);
  if (query.providers.include.length || query.providers.exclude.length) {
    put("providers.region", query.providers.region);
    if (query.providers.mode !== "any" && query.providers.include.length > 1) {
      put("providers.mode", query.providers.mode);
    }
  }
  putList("providers.monetization", query.providers.monetization);

  if (query.certification.min || query.certification.max) {
    put("certification.region", query.certification.region);
    put("certification.min", query.certification.min);
    put("certification.max", query.certification.max);
  }

  putList("tvStatus", query.tvStatus);
  putList("tvTypes", query.tvTypes);

  putRange("year", query.year);
  putRange("runtime", query.runtime);

  if (query.rating.source !== DEFAULT_FILTERS.rating.source)
    put("rating.source", query.rating.source);
  putRange("rating.value", query.rating.value);
  if (query.rating.votes.min !== DEFAULT_FILTERS.rating.votes.min) {
    put("rating.votes.min", query.rating.votes.min);
  }
  put("rating.votes.max", query.rating.votes.max);
  if (query.rating.votes.exclude.length) {
    put("rating.votes.exclude", encodeBands(query.rating.votes.exclude));
  }

  if (query.sort.by !== DEFAULT_FILTERS.sort.by) put("sort.by", query.sort.by);
  if (query.sort.dir !== DEFAULT_FILTERS.sort.dir)
    put("sort.dir", query.sort.dir);
  if (query.page !== 1) put("page", query.page);
  if (query.perPage !== DEFAULT_PAGE_SIZE) put("perPage", query.perPage);

  return params;
};

/** True when the user has narrowed anything at all (drives the reset button). */
export const hasActiveFilters = (query: FilterQuery): boolean =>
  serializeFilterQuery({
    ...query,
    page: 1,
    perPage: DEFAULT_PAGE_SIZE,
  }).toString().length > 0;

/** Counts country constraints the way the showcase renders them: groups collapse to one. */
const countCountries = (countries: SetFacet<string>): number => {
  const consumed = new Set<string>();
  let count = 0;

  for (const group of REGION_GROUPS) {
    for (const bucket of ["include", "exclude"] as const) {
      const list = countries[bucket];
      if (!group.countries.every((code) => list.includes(code))) continue;
      if (group.countries.some((code) => consumed.has(code))) continue;
      for (const code of group.countries) consumed.add(code);
      count += 1;
    }
  }

  for (const code of [...countries.include, ...countries.exclude]) {
    if (!consumed.has(code)) count += 1;
  }
  return count;
};

/** Total number of distinct constraints, for the "Filters (7)" badge. */
export const countActiveFilters = (query: FilterQuery): number => {
  let count = query.type === DEFAULT_FILTERS.type ? 0 : 1;
  if (query.animation !== DEFAULT_FILTERS.animation) count += 1;

  for (const key of SET_FACET_KEYS) {
    if (key === "countries") {
      // A fully-applied region group shows as one chip in the showcase, so it
      // counts as one constraint here too — otherwise the badge says 15 while
      // the user sees 5.
      count += countCountries(query.countries);
      continue;
    }
    count += query[key].include.length + query[key].exclude.length;
  }
  count += query.providers.include.length + query.providers.exclude.length;
  count += query.providers.monetization.length;
  if (query.certification.min || query.certification.max) count += 1;
  count += query.tvStatus.length + query.tvTypes.length;

  // A bounded range is one constraint however many ends it has — the showcase
  // renders "2010-2019" as a single chip, and the badge has to agree with it.
  const rangeCount = (
    range: { min?: number; max?: number; exclude: Band[] },
    defaultMin?: number,
  ) => {
    const bounded =
      (range.min !== undefined && range.min !== defaultMin) ||
      range.max !== undefined;
    return (bounded ? 1 : 0) + range.exclude.length;
  };

  for (const key of RANGE_FACET_KEYS) count += rangeCount(query[key]);

  count += rangeCount(query.rating.value);
  count += rangeCount(query.rating.votes, DEFAULT_FILTERS.rating.votes.min);

  return count;
};

/** Shared by the post-filter and the offline fixtures. */
export const inBands = (value: number, list: readonly Band[]): boolean =>
  list.some(
    (entry) =>
      (entry.min === undefined || value >= entry.min) &&
      (entry.max === undefined || value <= entry.max),
  );
