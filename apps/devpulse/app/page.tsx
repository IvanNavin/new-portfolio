import { CategoryTabs } from "@components/CategoryTabs";
import { FiltersBar } from "@components/FiltersBar";
import { KeyboardNav } from "@components/KeyboardNav";
import { MobileMenu } from "@components/MobileMenu";
import { NewsCard } from "@components/NewsCard";
import { PostMountFilters } from "@components/PostMountFilters";
import { ThemeToggle } from "@components/ThemeToggle";
import { UserChip } from "@components/UserChip";
import { auth } from "@lib/auth";
import {
  FeedParams,
  isFiltered,
  normalizeParams,
  windowCutoff,
} from "@lib/feedParams";
import { prisma } from "@lib/prisma";
import { mergeBoosts, scoreItem } from "@lib/score";
import { Category } from "@lib/sources";
import { getSourceWeightMap } from "@lib/sourcesDb";
import { listUserBoosts } from "@lib/userBoosts";
import { listUserMutes } from "@lib/userMutes";
import { DEFAULT_PREFS, getUserPrefs } from "@lib/userPrefs";
import { getUserEnabledSourceNames } from "@lib/userSources";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Item = {
  id: string;
  url: string;
  title: string;
  excerpt: string | null;
  source: string;
  category: string;
  publishedAt: Date;
  tags: string[];
  engagement: number | null;
  summary: string | null;
  referrers: string[];
};

type ScoredItem = Item & {
  score: number;
  boosted: boolean;
  matches: string[];
};

const VALID_CATEGORIES: ReadonlyArray<Category> = [
  "framework",
  "language",
  "browser",
  "tooling",
  "runtime",
  "platform",
  "community",
];

type FeedWhere = {
  category?: string;
  source?: string | { in: string[] };
  publishedAt?: { gte: Date };
  isPreRelease?: boolean;
  tags?: { has: string };
  engagement?: { gt: number };
  OR?: Array<{ title?: object; excerpt?: object }>;
};

function buildWhere(
  params: FeedParams,
  enabledSourceNames: string[] | null,
  showPreReleases: boolean,
): FeedWhere {
  const where: FeedWhere = {};
  if (!showPreReleases) {
    where.isPreRelease = false;
  }
  if (
    params.category &&
    VALID_CATEGORIES.includes(params.category as Category)
  ) {
    where.category = params.category;
  }
  if (params.source) {
    // Explicit single-source filter wins over the per-user enabled list —
    // the user is asking for one source specifically, respect that even
    // if they had it disabled in settings.
    where.source = params.source;
  } else if (enabledSourceNames) {
    // Signed-in: scope to whatever the user has enabled in /settings.
    // Empty list → nothing matches, which is the right "I disabled
    // everything" answer.
    where.source = { in: enabledSourceNames };
  }
  const cutoff = windowCutoff(params.window);
  if (cutoff) {
    where.publishedAt = { gte: cutoff };
  }
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { excerpt: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.tag) {
    where.tags = { has: params.tag };
  }
  if (params.sort === "trending") {
    // Trending only makes sense for items that carry an engagement signal
    // (HN points, Lobsters score). Everything else fades.
    where.engagement = { gt: 0 };
  }
  return where;
}

async function getFeed(
  params: FeedParams,
  enabledSourceNames: string[] | null,
  showPreReleases: boolean,
) {
  const where = buildWhere(params, enabledSourceNames, showPreReleases);
  const orderBy =
    params.sort === "trending"
      ? [{ engagement: "desc" as const }, { publishedAt: "desc" as const }]
      : { publishedAt: "desc" as const };
  const [items, groups] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      orderBy,
      take: 200,
    }),
    // Counts per category are computed without the category filter applied
    // — otherwise clicking "Frameworks" would show only that count and zero
    // out every other tab. Other filters (window, source, q) still apply so
    // the badges reflect the active scope.
    prisma.newsItem.groupBy({
      by: ["category"],
      where: (() => {
        const w = { ...where };
        delete w.category;
        return w;
      })(),
      _count: { _all: true },
    }),
  ]);
  const counts: Record<string, number> = { all: 0 };
  for (const g of groups) {
    counts[g.category] = g._count._all;
    counts.all += g._count._all;
  }
  return { items, counts };
}

type Bucket = { key: string; label: string; items: ScoredItem[] };

function bucketByDay(items: ScoredItem[]): Bucket[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 7);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(startOfToday.getDate() - 30);

  const today: ScoredItem[] = [];
  const yesterday: ScoredItem[] = [];
  const week: ScoredItem[] = [];
  const month: ScoredItem[] = [];
  const older: ScoredItem[] = [];

  for (const item of items) {
    const d = item.publishedAt;
    if (d >= startOfToday) today.push(item);
    else if (d >= startOfYesterday) yesterday.push(item);
    else if (d >= startOfWeek) week.push(item);
    else if (d >= startOfMonth) month.push(item);
    else older.push(item);
  }

  // Sort each bucket by importance: score desc, then date desc as tiebreak.
  // The bucket itself preserves chronological grouping; within a bucket we
  // surface the items that matter to you, not just the most recent.
  const sortBucket = (arr: ScoredItem[]) =>
    arr.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });

  return [
    { key: "today", label: "Today", items: sortBucket(today) },
    { key: "yesterday", label: "Yesterday", items: sortBucket(yesterday) },
    { key: "week", label: "This week", items: sortBucket(week) },
    { key: "month", label: "This month", items: sortBucket(month) },
    { key: "older", label: "Older", items: sortBucket(older) },
  ].filter((b) => b.items.length > 0);
}

type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const params = normalizeParams(raw);
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const [enabledSourceNames, prefs, userBoosts, userMutes] = userId
    ? await Promise.all([
        getUserEnabledSourceNames(userId),
        getUserPrefs(userId),
        listUserBoosts(userId),
        listUserMutes(userId),
      ])
    : [null, DEFAULT_PREFS, [], []];
  const [{ items, counts }, weights] = await Promise.all([
    getFeed(params, enabledSourceNames, prefs.showPreReleases),
    getSourceWeightMap(),
  ]);

  // Mute filter — runs in JS over the already-trimmed result set so we
  // don't have to build a dynamic NOT-ILIKE chain in SQL. With 200-item
  // pages and maybe 10 patterns per user this is sub-millisecond.
  const mutePatterns = userMutes.map((m) => m.pattern.toLowerCase());
  const visibleItems =
    mutePatterns.length === 0
      ? items
      : items.filter((it) => {
          const hay = (it.title + " " + (it.excerpt ?? "")).toLowerCase();
          return !mutePatterns.some((p) => hay.includes(p));
        });

  const boosts = mergeBoosts(userBoosts);
  const scored: ScoredItem[] = visibleItems.map((item) => ({
    ...item,
    ...scoreItem(item, weights, boosts),
  }));
  const trendingMode = params.sort === "trending";
  const buckets = trendingMode
    ? [{ key: "all", label: "Trending now", items: scored }]
    : bucketByDay(scored);
  const activeCategory =
    params.category && VALID_CATEGORIES.includes(params.category as Category)
      ? (params.category as Category)
      : "all";

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <PostMountFilters />
      <KeyboardNav />
      <header className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 text-[10px] tracking-widest text-[var(--text-dim)] uppercase sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>live feed</span>
          </div>
          <MobileMenu />
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            <Link
              href="/hidden"
              prefetch={false}
              aria-label="Hidden stories"
              className="rounded-md border border-[var(--border)] px-2 py-1 text-[var(--text)] normal-case tracking-normal hover:border-[var(--c-danger-fg)] hover:bg-[var(--c-danger-soft)] hover:text-[var(--c-danger-fg)]"
            >
              <span aria-hidden="true">↩</span>
              <span className="ml-1">Hidden</span>
            </Link>
            <Link
              href="/saved"
              prefetch={false}
              aria-label="Saved stories"
              className="rounded-md border border-[var(--border)] px-2 py-1 text-[var(--text)] normal-case tracking-normal hover:border-[var(--c-save-fg)] hover:bg-[var(--c-save-soft)] hover:text-[var(--c-save-fg)]"
            >
              <span aria-hidden="true">★</span>
              <span className="ml-1">Saved</span>
            </Link>
            <ThemeToggle />
            <UserChip />
          </div>
        </div>
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">devpulse</h1>
        <p className="max-w-xl text-[var(--text-dim)]">
          Releases, browser updates, and notes from the libraries I actually
          use.{" "}
          {isFiltered(params)
            ? `Showing ${items.length} stories matching your filters.`
            : `Aggregated from ${counts.all} stories across the curated feed list.`}{" "}
          <span className="text-[var(--text-dim)] opacity-60">
            (j/k to navigate, Enter to open)
          </span>
        </p>
      </header>

      <section className="mb-6 flex flex-col gap-4">
        <CategoryTabs active={activeCategory} counts={counts} params={params} />
        <FiltersBar params={params} />
      </section>

      {items.length === 0 ? (
        isFiltered(params) ? (
          <NoMatchState />
        ) : (
          <EmptyState />
        )
      ) : (
        <div className="flex flex-col gap-8">
          {buckets.map((bucket) => (
            <section key={bucket.key}>
              <h2 className="mb-3 text-xs font-medium tracking-widest text-[var(--text-dim)] uppercase">
                {bucket.label}{" "}
                <span className="ml-1 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums">
                  {bucket.items.length}
                </span>
              </h2>
              <ul className="flex flex-col gap-3">
                {bucket.items.map((item) => (
                  <li key={item.id}>
                    <NewsCard item={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <footer className="mt-16 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-dim)]">
        Pre-releases (canary / dev / rc / beta) auto-skipped. Items older than
        60 days are auto-pruned. Refreshes daily.
      </footer>
    </main>
  );
}

function NoMatchState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elev)]/40 p-10 text-center">
      <h2 className="mb-2 text-lg font-medium">Nothing matches</h2>
      <p className="text-sm text-[var(--text-dim)]">
        Try widening the time window or clearing a filter.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elev)]/40 p-10 text-center">
      <h2 className="mb-2 text-lg font-medium">No items yet</h2>
      <p className="text-sm text-[var(--text-dim)]">
        The first cron fetch hasn&rsquo;t run.
      </p>
    </div>
  );
}
