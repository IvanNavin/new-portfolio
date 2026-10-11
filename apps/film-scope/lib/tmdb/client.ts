/**
 * Thin TMDB v3 wrapper.
 *
 * The access token never leaves the server: the browser only ever talks to our
 * own /api routes. When no token is configured the app transparently falls back
 * to the bundled fixtures so the whole UI is developable offline.
 */
const BASE_URL = "https://api.themoviedb.org/3";

export const IMAGE_BASE = "https://image.tmdb.org/t/p";

const HOUR = 60 * 60;

/** How long each class of response stays in the Next Data Cache. */
export const REVALIDATE = {
  /** Genres, countries, languages, provider lists — these barely ever move. */
  config: 7 * 24 * HOUR,
  /** Catalog pages. */
  discover: 6 * HOUR,
  /** A single title's details. */
  title: 24 * HOUR,
  /** Person filmographies, used to resolve cast include/exclude filters. */
  person: 24 * HOUR,
  /** Autocomplete. */
  search: HOUR,
} as const;

export const hasTmdbToken = (): boolean =>
  Boolean(process.env.TMDB_ACCESS_TOKEN?.trim());

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

export type TmdbParams = Record<
  string,
  string | number | boolean | undefined | null
>;

const buildUrl = (path: string, params: TmdbParams): string => {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
};

/**
 * TMDB occasionally answers a burst with 429. One retry honouring Retry-After
 * is enough in practice; anything past that is a real outage and should surface.
 */
export const tmdbFetch = async <T>(
  path: string,
  params: TmdbParams = {},
  revalidate: number = REVALIDATE.discover,
): Promise<T> => {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new TmdbError("TMDB_ACCESS_TOKEN is not set", 401, path);
  }

  const url = buildUrl(path, params);
  const request = () =>
    fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      next: { revalidate },
    });

  let response = await request();

  if (response.status === 429) {
    const retryAfter = Number.parseInt(
      response.headers.get("retry-after") ?? "1",
      10,
    );
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(retryAfter, 5) * 1000),
    );
    response = await request();
  }

  if (!response.ok) {
    throw new TmdbError(
      `TMDB ${response.status} on ${path}`,
      response.status,
      path,
    );
  }

  return (await response.json()) as T;
};

/**
 * Bounded-concurrency map. Backfilling origin countries or credits fans out
 * over a whole candidate window; firing 100 requests at once trips TMDB's
 * ~50 req/s ceiling, so keep a lid on it.
 */
export const mapLimit = async <In, Out>(
  items: readonly In[],
  limit: number,
  worker: (item: In, index: number) => Promise<Out>,
): Promise<Out[]> => {
  const results = new Array<Out>(items.length);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      for (;;) {
        const index = cursor++;
        if (index >= items.length) return;
        results[index] = await worker(items[index], index);
      }
    },
  );

  await Promise.all(runners);
  return results;
};

/** Never lets one failed enrichment call sink the whole page. */
export const tolerant = async <T>(
  promise: Promise<T>,
  fallback: T,
): Promise<T> => {
  try {
    return await promise;
  } catch {
    return fallback;
  }
};

export const posterUrl = (
  path: string | null,
  size: "w185" | "w342" | "w500" = "w342",
): string | null => (path ? `${IMAGE_BASE}/${size}${path}` : null);

export const backdropUrl = (
  path: string | null,
  size: "w780" | "w1280" = "w1280",
): string | null => (path ? `${IMAGE_BASE}/${size}${path}` : null);

export const profileUrl = (
  path: string | null,
  size: "w185" = "w185",
): string | null => (path ? `${IMAGE_BASE}/${size}${path}` : null);

export const logoUrl = (
  path: string | null,
  size: "w92" = "w92",
): string | null => (path ? `${IMAGE_BASE}/${size}${path}` : null);
