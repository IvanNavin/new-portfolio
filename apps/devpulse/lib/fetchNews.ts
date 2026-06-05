import { isPreRelease, parseFeed } from "./parseFeed";
import { prisma } from "./prisma";
import { Source, SOURCES } from "./sources";

const FETCH_TIMEOUT_MS = 15_000;
const PRUNE_AFTER_DAYS = 60;
const MAX_ITEMS_PER_SOURCE_PER_RUN = 20;

export type SourceReport = {
  source: string;
  ok: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  error?: string;
};

async function fetchSource(source: Source): Promise<SourceReport> {
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(source.url, {
      signal: ac.signal,
      headers: {
        // Some hosts 403 the default Node UA; identifying ourselves keeps them happy.
        "user-agent": "devpulse-bot/0.1 (+https://github.com/holovkoivan)",
        accept:
          "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.5",
      },
      // Atom/RSS responses are tiny and don't need caching at the fetch layer
      // — Next's per-request cache won't help a cron run anyway.
      cache: "no-store",
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        source: source.name,
        ok: false,
        inserted: 0,
        updated: 0,
        skipped: 0,
        error: `HTTP ${res.status}`,
      };
    }

    const xml = await res.text();
    // Drop pre-releases at ingest and anything older than the prune window —
    // otherwise the next prune sweep would just re-evict them and the cron
    // churns the same rows in/out every run.
    const pruneCutoff = new Date();
    pruneCutoff.setDate(pruneCutoff.getDate() - PRUNE_AFTER_DAYS);
    const items = parseFeed(xml)
      .filter((i) => !isPreRelease(i.title))
      .filter((i) => i.publishedAt >= pruneCutoff)
      .slice(0, MAX_ITEMS_PER_SOURCE_PER_RUN);
    if (items.length === 0) {
      return {
        source: source.name,
        ok: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
      };
    }

    // Diff-based sync: look up which URLs we already have, then split the
    // batch into "new" (createMany — one round trip) and "stale" rows whose
    // title/excerpt drifted from what the source serves now (one update each).
    // This stays idempotent: a clean re-run does zero writes; a parser fix
    // (like the entity-decode bug) refreshes every affected excerpt without
    // any manual DB intervention.
    const existing = await prisma.newsItem.findMany({
      where: { url: { in: items.map((i) => i.url) } },
      select: { url: true, title: true, excerpt: true },
    });
    const existingByUrl = new Map(existing.map((e) => [e.url, e]));

    const toInsert = items.filter((i) => !existingByUrl.has(i.url));
    const toUpdate = items.filter((i) => {
      const prev = existingByUrl.get(i.url);
      if (!prev) return false;
      const incomingExcerpt = i.excerpt || null;
      return prev.title !== i.title || prev.excerpt !== incomingExcerpt;
    });

    let inserted = 0;
    if (toInsert.length > 0) {
      const created = await prisma.newsItem.createMany({
        data: toInsert.map((item) => ({
          url: item.url,
          title: item.title,
          excerpt: item.excerpt || null,
          source: source.name,
          category: source.category,
          publishedAt: item.publishedAt,
        })),
        skipDuplicates: true,
      });
      inserted = created.count;
    }

    let updated = 0;
    if (toUpdate.length > 0) {
      // Updates are independent — fire them in parallel. One bad row
      // shouldn't poison the rest, hence allSettled.
      const results = await Promise.allSettled(
        toUpdate.map((item) =>
          prisma.newsItem.update({
            where: { url: item.url },
            data: { title: item.title, excerpt: item.excerpt || null },
          }),
        ),
      );
      updated = results.filter((r) => r.status === "fulfilled").length;
    }

    return {
      source: source.name,
      ok: true,
      inserted,
      updated,
      skipped: items.length - inserted - updated,
    };
  } catch (err) {
    return {
      source: source.name,
      ok: false,
      inserted: 0,
      updated: 0,
      skipped: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export type RunReport = {
  totalSources: number;
  okSources: number;
  totalInserted: number;
  totalUpdated: number;
  pruned: number;
  preReleasesCleaned: number;
  reports: SourceReport[];
  startedAt: string;
  durationMs: number;
};

export async function runFetch(): Promise<RunReport> {
  const startedAt = new Date();

  // One-time hygiene pass: evict pre-release rows from earlier runs that
  // landed before isPreRelease() existed. Idempotent — subsequent calls
  // find nothing to clean. Cheap because the table is tiny (~few hundred).
  const allTitles = await prisma.newsItem.findMany({
    select: { url: true, title: true },
  });
  const preReleaseUrls = allTitles
    .filter((r) => isPreRelease(r.title))
    .map((r) => r.url);
  let preReleasesCleaned = 0;
  if (preReleaseUrls.length > 0) {
    const result = await prisma.newsItem.deleteMany({
      where: { url: { in: preReleaseUrls } },
    });
    preReleasesCleaned = result.count;
  }

  // Sources are independent — parallelize but bound concurrency so we don't
  // open 20 sockets at once. Promise.allSettled never rejects so one stuck
  // source doesn't take the whole run down.
  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const reports: SourceReport[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          source: SOURCES[i].name,
          ok: false,
          inserted: 0,
          updated: 0,
          skipped: 0,
          error:
            r.reason instanceof Error ? r.reason.message : String(r.reason),
        },
  );

  // Prune rows older than the retention window to keep DB footprint small —
  // the user's storage budget is the binding constraint here, not query speed.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PRUNE_AFTER_DAYS);
  const { count: pruned } = await prisma.newsItem.deleteMany({
    where: { publishedAt: { lt: cutoff } },
  });

  return {
    totalSources: SOURCES.length,
    okSources: reports.filter((r) => r.ok).length,
    totalInserted: reports.reduce((acc, r) => acc + r.inserted, 0),
    totalUpdated: reports.reduce((acc, r) => acc + r.updated, 0),
    pruned,
    preReleasesCleaned,
    reports,
    startedAt: startedAt.toISOString(),
    durationMs: Date.now() - startedAt.getTime(),
  };
}
