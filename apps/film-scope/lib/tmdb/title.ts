/** Single-title details, assembled in one round trip via append_to_response. */
import type {
  CreditPerson,
  TitleDetails,
  WatchProvider,
} from "../filters/types";
import { hasTmdbToken, REVALIDATE, tmdbFetch, tolerant } from "./client";
import type {
  TmdbCredits,
  TmdbMovieDetails,
  TmdbProviderRegion,
  TmdbTvDetails,
} from "./dto";
import { fixtureTitle } from "./fixtures";
import { normalizeListItem, toRatings } from "./normalize";

const APPEND_MOVIE =
  "credits,keywords,videos,recommendations,release_dates,watch/providers";
const APPEND_TV =
  "credits,keywords,videos,recommendations,content_ratings,external_ids,watch/providers";

const toCast = (credits: TmdbCredits | undefined): CreditPerson[] =>
  (credits?.cast ?? []).slice(0, 40).map((person) => ({
    id: person.id,
    name: person.name,
    profilePath: person.profile_path,
    role: person.character ?? "",
    order: person.order,
  }));

/** Only the departments a viewer actually looks for. */
const KEY_JOBS = new Set([
  "Director",
  "Screenplay",
  "Writer",
  "Story",
  "Original Music Composer",
  "Director of Photography",
  "Producer",
]);

const toCrew = (credits: TmdbCredits | undefined): CreditPerson[] =>
  (credits?.crew ?? [])
    .filter((person) => person.job && KEY_JOBS.has(person.job))
    .slice(0, 20)
    .map((person) => ({
      id: person.id,
      name: person.name,
      profilePath: person.profile_path,
      role: person.job ?? "",
    }));

const toProviders = (
  block: Record<string, TmdbProviderRegion> | undefined,
  region: string,
): { region: string; link: string | null; items: WatchProvider[] } => {
  const entry = block?.[region];
  if (!entry) return { region, link: null, items: [] };

  const items: WatchProvider[] = [];
  const push = (list: TmdbProviderRegion["flatrate"], monetization: string) => {
    for (const provider of list ?? []) {
      items.push({
        id: provider.provider_id,
        name: provider.provider_name,
        logoPath: provider.logo_path,
        monetization,
      });
    }
  };
  push(entry.flatrate, "flatrate");
  push(entry.free, "free");
  push(entry.ads, "ads");
  push(entry.rent, "rent");
  push(entry.buy, "buy");

  return { region, link: entry.link ?? null, items };
};

const usCertification = (
  details: TmdbMovieDetails,
  region: string,
): string | null => {
  const entry =
    details.release_dates?.results?.find((row) => row.iso_3166_1 === region) ??
    details.release_dates?.results?.find((row) => row.iso_3166_1 === "US");
  return (
    entry?.release_dates?.find((row) => row.certification)?.certification ??
    null
  );
};

/**
 * TMDB returns an empty string for `overview` when a locale has no translation
 * — very common for uk-UA. One extra cached call in English keeps the page from
 * showing a blank synopsis.
 */
const withOverviewFallback = async <T extends { overview?: string }>(
  path: string,
  details: T,
  locale: string,
): Promise<{ overview: string; fallback: boolean }> => {
  if (details.overview?.trim())
    return { overview: details.overview, fallback: false };
  if (locale.startsWith("en")) return { overview: "", fallback: false };

  const english = await tolerant(
    tmdbFetch<{ overview?: string }>(
      path,
      { language: "en-US" },
      REVALIDATE.title,
    ),
    {},
  );
  return {
    overview: english.overview ?? "",
    fallback: Boolean(english.overview),
  };
};

export const getMovie = async (
  id: number,
  locale: string,
  region: string,
): Promise<TitleDetails | null> => {
  if (!hasTmdbToken()) return fixtureTitle(id);

  const details = await tolerant(
    tmdbFetch<TmdbMovieDetails>(
      `/movie/${id}`,
      { language: locale, append_to_response: APPEND_MOVIE },
      REVALIDATE.title,
    ),
    null as TmdbMovieDetails | null,
  );
  if (!details) return null;

  const { overview, fallback } = await withOverviewFallback(
    `/movie/${id}`,
    details,
    locale,
  );
  const card = normalizeListItem(
    { ...details, genre_ids: (details.genres ?? []).map((g) => g.id) },
    "movie",
  );

  return {
    ...card,
    overview,
    overviewFallback: fallback,
    runtime: details.runtime ?? null,
    originCountries: details.origin_country?.length
      ? details.origin_country
      : (details.production_countries ?? []).map((entry) => entry.iso_3166_1),
    ratings: toRatings(details.vote_average, details.vote_count),
    tagline: details.tagline ?? "",
    status: details.status ?? "",
    imdbId: details.imdb_id ?? null,
    homepage: details.homepage ?? null,
    genres: (details.genres ?? []).map((genre) => ({
      id: genre.id,
      name: genre.name,
    })),
    productionCompanies: (details.production_companies ?? []).map(
      (company) => ({
        id: company.id,
        name: company.name,
        logoPath: company.logo_path,
      }),
    ),
    productionCountries: (details.production_countries ?? []).map((entry) => ({
      code: entry.iso_3166_1,
      name: entry.name,
    })),
    spokenLanguages: (details.spoken_languages ?? []).map((entry) => ({
      code: entry.iso_639_1,
      name: entry.english_name ?? entry.name ?? entry.iso_639_1,
    })),
    budget: details.budget || null,
    revenue: details.revenue || null,
    certification: usCertification(details, region),
    seasons: null,
    episodes: null,
    cast: toCast(details.credits),
    crew: toCrew(details.credits),
    keywords: (details.keywords?.keywords ?? []).map((kw) => ({
      id: kw.id,
      name: kw.name,
    })),
    videos: (details.videos?.results ?? [])
      .filter((video) => video.site === "YouTube")
      .map((video) => ({
        key: video.key,
        site: video.site,
        type: video.type,
        name: video.name,
        official: video.official,
        language: video.iso_639_1,
      })),
    providers: toProviders(details["watch/providers"]?.results, region),
    similar: (details.recommendations?.results ?? [])
      .slice(0, 12)
      .map((item) => normalizeListItem(item, "movie")),
    collection: details.belongs_to_collection
      ? {
          id: details.belongs_to_collection.id,
          name: details.belongs_to_collection.name,
          posterPath: details.belongs_to_collection.poster_path,
          parts: [],
        }
      : null,
  };
};

export const getShow = async (
  id: number,
  locale: string,
  region: string,
): Promise<TitleDetails | null> => {
  if (!hasTmdbToken()) return fixtureTitle(id);

  const details = await tolerant(
    tmdbFetch<TmdbTvDetails>(
      `/tv/${id}`,
      { language: locale, append_to_response: APPEND_TV },
      REVALIDATE.title,
    ),
    null as TmdbTvDetails | null,
  );
  if (!details) return null;

  const { overview, fallback } = await withOverviewFallback(
    `/tv/${id}`,
    details,
    locale,
  );
  const card = normalizeListItem(
    { ...details, genre_ids: (details.genres ?? []).map((g) => g.id) },
    "tv",
  );

  const rating =
    details.content_ratings?.results?.find((row) => row.iso_3166_1 === region)
      ?.rating ??
    details.content_ratings?.results?.find((row) => row.iso_3166_1 === "US")
      ?.rating ??
    null;

  return {
    ...card,
    overview,
    overviewFallback: fallback,
    ratings: toRatings(details.vote_average, details.vote_count),
    tagline: details.tagline ?? "",
    status: details.status ?? "",
    imdbId: details.external_ids?.imdb_id ?? null,
    homepage: details.homepage ?? null,
    genres: (details.genres ?? []).map((genre) => ({
      id: genre.id,
      name: genre.name,
    })),
    productionCompanies: (details.production_companies ?? []).map(
      (company) => ({
        id: company.id,
        name: company.name,
        logoPath: company.logo_path,
      }),
    ),
    productionCountries: (details.production_countries ?? []).map((entry) => ({
      code: entry.iso_3166_1,
      name: entry.name,
    })),
    spokenLanguages: (details.spoken_languages ?? []).map((entry) => ({
      code: entry.iso_639_1,
      name: entry.english_name ?? entry.name ?? entry.iso_639_1,
    })),
    budget: null,
    revenue: null,
    certification: rating,
    seasons: details.number_of_seasons ?? null,
    episodes: details.number_of_episodes ?? null,
    cast: toCast(details.credits),
    crew: toCrew(details.credits),
    keywords: (details.keywords?.results ?? []).map((kw) => ({
      id: kw.id,
      name: kw.name,
    })),
    videos: (details.videos?.results ?? [])
      .filter((video) => video.site === "YouTube")
      .map((video) => ({
        key: video.key,
        site: video.site,
        type: video.type,
        name: video.name,
        official: video.official,
        language: video.iso_639_1,
      })),
    providers: toProviders(details["watch/providers"]?.results, region),
    similar: (details.recommendations?.results ?? [])
      .slice(0, 12)
      .map((item) => normalizeListItem(item, "tv")),
    collection: null,
  };
};

export const getTitle = (
  mediaType: "movie" | "tv",
  id: number,
  locale: string,
  region: string,
): Promise<TitleDetails | null> =>
  mediaType === "tv"
    ? getShow(id, locale, region)
    : getMovie(id, locale, region);
