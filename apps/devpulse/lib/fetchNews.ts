import { analyzeItem } from "./aiAnalyze";
import { KEYWORD_BOOSTS } from "./keywords";
import { isPreRelease, parseFeed } from "./parseFeed";
import { prisma } from "./prisma";
import { safeFetch } from "./safeFetch";
import { DbSource, ensureSourcesSeeded, getAllSources } from "./sourcesDb";

const DEAD_SOURCE_THRESHOLD = 7;

/**
 * Pre-compute tag labels at ingest from the curated KEYWORD_BOOSTS.
 * Stored on the row so we can render clickable chips without re-scoring
 * every render and the SQL planner can use a GIN index someday if the
 * table grows enormous.
 */
function computeTags(title: string, excerpt: string): string[] {
  const haystack = (title + " " + excerpt).toLowerCase();
  const tags: string[] = [];
  for (const boost of KEYWORD_BOOSTS) {
    for (const term of boost.terms) {
      if (haystack.includes(term)) {
        tags.push(boost.label);
        break;
      }
    }
  }
  return tags;
}

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

async function fetchSource(source: DbSource): Promise<SourceReport> {
  try {
    // SSRF guard inside the cron too. A user could have managed to insert
    // a private-network URL before assertSafeUrl was added at the create
    // path; this ensures the runtime never reaches such a host.
    const res = await safeFetch(source.url, {
      headers: {
        // Some hosts 403 the default Node UA; identifying ourselves keeps them happy.
        "user-agent": "devpulse-bot/0.1 (+https://github.com/holovkoivan)",
        accept:
          "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.5",
      },
      // Atom/RSS responses are tiny and don't need caching at the fetch layer
      // — Next's per-request cache won't help a cron run anyway.
      cache: "no-store",
      timeoutMs: FETCH_TIMEOUT_MS,
    });

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
    // Drop items older than the prune window (otherwise prune just re-evicts
    // them next run and the cron churns the same rows). Pre-releases now
    // stay — flagged at ingest, hidden at view time by the user pref.
    const pruneCutoff = new Date();
    pruneCutoff.setDate(pruneCutoff.getDate() - PRUNE_AFTER_DAYS);
    const items = parseFeed(xml)
      .filter((i) => i.publishedAt >= pruneCutoff)
      .map((i) => ({ ...i, isPreRelease: isPreRelease(i.title) }))
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
      select: {
        id: true,
        url: true,
        title: true,
        excerpt: true,
        source: true,
        referrers: true,
      },
    });
    const existingByUrl = new Map(existing.map((e) => [e.url, e]));

    const toInsert = items.filter((i) => !existingByUrl.has(i.url));
    const toUpdate = items.filter((i) => {
      const prev = existingByUrl.get(i.url);
      if (!prev) return false;
      const incomingExcerpt = i.excerpt || null;
      return prev.title !== i.title || prev.excerpt !== incomingExcerpt;
    });
    // Cross-source clustering: existing rows whose primary source !=
    // this feed get tracked as referrers. UI surfaces this as a
    // "+ HN, + Lobsters" pill on the card so users see the same
    // story shared across sources without three duplicate entries.
    const toCluster = items.filter((i) => {
      const prev = existingByUrl.get(i.url);
      if (!prev) return false;
      if (prev.source === source.name) return false;
      if (prev.referrers.includes(source.name)) return false;
      return true;
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
          isPreRelease: item.isPreRelease,
          engagement: item.engagement,
          tags: computeTags(item.title, item.excerpt),
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

    if (toCluster.length > 0) {
      // Push this feed's name into referrers[] of every existing row
      // whose URL we're also serving. Idempotent because we filtered
      // out rows that already have the source in either primary or
      // referrers.
      await Promise.allSettled(
        toCluster.map((item) =>
          prisma.newsItem.update({
            where: { url: item.url },
            data: { referrers: { push: source.name } },
          }),
        ),
      );
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
  seedInserted: number;
  /** Items whose summary + tags filled in via Gemini this run. */
  aiAnalyzed: number;
  /** Sources that crossed the failure threshold and got auto-disabled. */
  autoDisabled: number;
  reports: SourceReport[];
  startedAt: string;
  durationMs: number;
};

export async function runFetch(): Promise<RunReport> {
  const startedAt = new Date();

  // Bring the curated baseline into the DB if it's not there yet (first cron
  // run after the migration, or after manually clearing the table). After
  // that, the DB is the source of truth — including any user-added URLs.
  const { inserted: seedInserted } = await ensureSourcesSeeded();
  const sources = await getAllSources();

  // Skip sources that prior runs auto-disabled. They stay in the table
  // (so admin can re-enable from /settings) but the cron ignores them.
  const liveSources = sources.filter((s) => !s.disabledAt);

  // Sources are independent — parallelize but bound concurrency so we don't
  // open 20 sockets at once. Promise.allSettled never rejects so one stuck
  // source doesn't take the whole run down.
  const results = await Promise.allSettled(liveSources.map(fetchSource));
  const reports: SourceReport[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          source: liveSources[i].name,
          ok: false,
          inserted: 0,
          updated: 0,
          skipped: 0,
          error:
            r.reason instanceof Error ? r.reason.message : String(r.reason),
        },
  );

  // Dead-source bookkeeping. Increment failureCount on any source whose
  // fetch returned ok:false, reset to 0 on success. Cross the threshold
  // → set disabledAt so next run skips it entirely.
  const reportBySource = new Map(reports.map((r) => [r.source, r]));
  const sourceUpdates = liveSources.map(async (s) => {
    const r = reportBySource.get(s.name);
    if (!r) return false;
    if (r.ok) {
      if (s.failureCount > 0) {
        await prisma.devpulseSource.update({
          where: { id: s.id },
          data: { failureCount: 0 },
        });
      }
      return false;
    }
    const next = s.failureCount + 1;
    const disable = next >= DEAD_SOURCE_THRESHOLD;
    await prisma.devpulseSource.update({
      where: { id: s.id },
      data: {
        failureCount: next,
        disabledAt: disable ? new Date() : null,
      },
    });
    return disable;
  });
  const disableResults = await Promise.allSettled(sourceUpdates);
  const autoDisabled = disableResults.filter(
    (r) => r.status === "fulfilled" && r.value,
  ).length;

  // Prune rows older than the retention window to keep DB footprint small —
  // the user's storage budget is the binding constraint here, not query speed.
  // But items referenced by any user's saved or dismissed list stay forever:
  // a saved story should survive the prune cutoff, and a dismissed one needs
  // to stick around so the /hidden view can offer to restore it.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PRUNE_AFTER_DAYS);
  const [savedUrls, dismissedUrls] = await Promise.all([
    prisma.devpulseSavedItem.findMany({ select: { url: true } }),
    prisma.devpulseDismissedItem.findMany({ select: { url: true } }),
  ]);
  const protectedUrls = Array.from(
    new Set([
      ...savedUrls.map((r) => r.url),
      ...dismissedUrls.map((r) => r.url),
    ]),
  );
  const { count: pruned } = await prisma.newsItem.deleteMany({
    where: {
      publishedAt: { lt: cutoff },
      url: { notIn: protectedUrls },
    },
  });

  // Single Gemini pass that fills both summary + AI tags for every
  // row that's still missing a summary. Runs after fetch + prune so
  // we hit it once per row, including stragglers from previous runs.
  const aiAnalyzed = await backfillAnalysis();

  return {
    totalSources: sources.length,
    okSources: reports.filter((r) => r.ok).length,
    totalInserted: reports.reduce((acc, r) => acc + r.inserted, 0),
    totalUpdated: reports.reduce((acc, r) => acc + r.updated, 0),
    pruned,
    seedInserted,
    aiAnalyzed,
    autoDisabled,
    reports,
    startedAt: startedAt.toISOString(),
    durationMs: Date.now() - startedAt.getTime(),
  };
}

/** Pull up to MAX_PER_RUN items that lack a summary and run them
 *  through the Gemini analyzer — fills summary + tags in one call.
 *  Existing curated tags merge with AI tags (deduped); the AI doesn't
 *  overwrite a curated match. */
async function backfillAnalysis(): Promise<number> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return 0;
  // Parallel batches of 3 against Gemini Flash Lite. The 30 RPM
  // free-tier ceiling is per-minute, not per-second; with retries
  // disabled (see aiAnalyze) a batch of 3 gives 30+ s of headroom
  // before the next batch hits and we coast under the limit.
  const MAX_PER_RUN = 24;
  const BATCH = 3;
  // Hold off between batches so Gemini's per-minute window resets.
  const PAUSE_MS = 4_000;
  // Filter eligibles at SQL level — most null-summary items are HN
  // link posts whose excerpt was stripped to nothing, or release
  // notes that are just version strings. Skipping them in the query
  // means the per-run budget isn't wasted on rows analyzeItem would
  // immediately reject.
  type R = { id: string; title: string; excerpt: string; tags: string[] };
  const rows = await prisma.$queryRaw<R[]>`
    SELECT id, title, excerpt, tags
    FROM devpulse_news_item
    WHERE summary IS NULL
      AND excerpt IS NOT NULL
      AND LENGTH(excerpt) >= 40
    ORDER BY "publishedAt" DESC
    LIMIT ${MAX_PER_RUN}
  `;
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      chunk.map(async (r) => {
        const analysis = await analyzeItem(r.title, r.excerpt);
        if (!analysis) return false;
        const mergedTags = Array.from(new Set([...r.tags, ...analysis.tags]));
        await prisma.newsItem.update({
          where: { id: r.id },
          data: { summary: analysis.summary, tags: mergedTags },
        });
        return true;
      }),
    );
    done += results.filter(
      (x) => x.status === "fulfilled" && x.value === true,
    ).length;
    // Pause between batches except the last one.
    if (i + BATCH < rows.length) {
      await new Promise((r) => setTimeout(r, PAUSE_MS));
    }
  }
  return done;
}
