import { prisma } from "./prisma";
import { Category, DEFAULT_SOURCE_WEIGHT, SEED_SOURCES } from "./sources";

export type DbSource = {
  id: string;
  name: string;
  url: string;
  category: string;
  weight: number;
  isBuiltIn: boolean;
  createdByUserId: string | null;
};

/**
 * Seeds the curated baseline (SEED_SOURCES) into the DB the first time the
 * app finds an empty source table. Idempotent: only inserts URLs that
 * aren't already present, so adding a new seed entry later will quietly
 * land it without disturbing user-added or already-seeded rows.
 *
 * Called from runFetch() at the top of every cron invocation — costs one
 * SELECT count + at most one createMany batch.
 */
export async function ensureSourcesSeeded(): Promise<{ inserted: number }> {
  const count = await prisma.devpulseSource.count();
  if (count >= SEED_SOURCES.length) return { inserted: 0 };

  const existing = await prisma.devpulseSource.findMany({
    where: { url: { in: SEED_SOURCES.map((s) => s.url) } },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((r) => r.url));
  const toInsert = SEED_SOURCES.filter((s) => !existingUrls.has(s.url));
  if (toInsert.length === 0) return { inserted: 0 };

  const result = await prisma.devpulseSource.createMany({
    data: toInsert.map((s) => ({
      name: s.name,
      url: s.url,
      category: s.category,
      weight: s.weight ?? DEFAULT_SOURCE_WEIGHT,
      isBuiltIn: true,
    })),
    skipDuplicates: true,
  });
  return { inserted: result.count };
}

/**
 * Every source the cron should fetch — built-in + every user-added URL.
 * Items collected from any source land in the shared devpulse_news_item
 * table; per-user filtering happens at view time.
 */
export async function getAllSources(): Promise<DbSource[]> {
  const rows = await prisma.devpulseSource.findMany({
    orderBy: [{ weight: "desc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    url: r.url,
    category: r.category,
    weight: r.weight,
    isBuiltIn: r.isBuiltIn,
    createdByUserId: r.createdByUserId,
  }));
}

/**
 * Map keyed by source NAME (not id) — that's what news_item.source stores,
 * so it lets score.ts and the admin page do O(1) weight lookups per news
 * row without joining.
 */
export type SourceWeightMap = Map<string, number>;

export async function getSourceWeightMap(): Promise<SourceWeightMap> {
  const rows = await prisma.devpulseSource.findMany({
    select: { name: true, weight: true },
  });
  return new Map(rows.map((r) => [r.name, r.weight]));
}

export function sourceWeightFromMap(
  map: SourceWeightMap,
  name: string,
): number {
  return map.get(name) ?? DEFAULT_SOURCE_WEIGHT;
}

/**
 * Lightweight list for filter dropdowns — name+category, nothing else.
 * Used by FiltersBar to render the source <select>.
 */
export async function getSourceFilterList(): Promise<
  { name: string; category: Category }[]
> {
  const rows = await prisma.devpulseSource.findMany({
    orderBy: [{ name: "asc" }],
    select: { name: true, category: true },
  });
  return rows.map((r) => ({ name: r.name, category: r.category as Category }));
}
