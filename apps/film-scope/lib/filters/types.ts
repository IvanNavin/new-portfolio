/**
 * The response half of the API contract (schema.ts is the request half).
 * Also import-free of Next/React — moves to packages/film-scope-core as-is.
 */
import type { RatingSource } from "./schema";

export type MediaType = "movie" | "tv";

export type RatingValue = {
  /** 0..10 */
  value: number;
  votes: number;
};

export type Ratings = {
  tmdb: RatingValue | null;
  /** Populated from the IMDb dataset index — null until Stage 2 lands. */
  imdb: RatingValue | null;
};

export type TitleCard = {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  /** ISO yyyy-mm-dd; release date for movies, first air date for TV. */
  releaseDate: string | null;
  year: number | null;
  genreIds: number[];
  originCountries: string[];
  originalLanguage: string;
  runtime: number | null;
  popularity: number;
  ratings: Ratings;
  /** Our Bayesian weighted rating for the chosen source, 0..10. */
  score: number;
};

export type CreditPerson = {
  id: number;
  name: string;
  profilePath: string | null;
  /** Character for cast, job for crew. */
  role: string;
  order?: number;
};

export type WatchProvider = {
  id: number;
  name: string;
  logoPath: string | null;
  monetization: string;
};

export type Video = {
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
  language: string;
};

export type TitleDetails = TitleCard & {
  tagline: string;
  status: string;
  imdbId: string | null;
  homepage: string | null;
  genres: { id: number; name: string }[];
  productionCompanies: { id: number; name: string; logoPath: string | null }[];
  productionCountries: { code: string; name: string }[];
  spokenLanguages: { code: string; name: string }[];
  budget: number | null;
  revenue: number | null;
  certification: string | null;
  /** TV only. */
  seasons: number | null;
  episodes: number | null;
  cast: CreditPerson[];
  crew: CreditPerson[];
  keywords: { id: number; name: string }[];
  videos: Video[];
  providers: { region: string; link: string | null; items: WatchProvider[] };
  similar: TitleCard[];
  collection: {
    id: number;
    name: string;
    posterPath: string | null;
    parts: TitleCard[];
  } | null;
  /** True when the localized overview was missing and we fell back to English. */
  overviewFallback: boolean;
};

export type DiscoverResponse = {
  results: TitleCard[];
  page: number;
  totalPages: number;
  totalResults: number;
  /**
   * Stage 1 samples a candidate window from TMDB and re-ranks locally, so with
   * exclusion filters on, totalResults is a lower bound and the ordering is
   * exact only within the window. The UI surfaces this. Stage 2 (Postgres
   * index) always returns false here.
   */
  approximate: boolean;
  /** Candidates pulled from upstream before post-filtering. */
  scanned: number;
  ratingSource: RatingSource;
  source: "tmdb" | "index" | "fixtures";
};
