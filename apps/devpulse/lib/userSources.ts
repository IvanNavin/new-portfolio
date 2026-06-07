import { parseFeed } from "./parseFeed";
import { prisma } from "./prisma";
import { isBlockedHost, safeFetch } from "./safeFetch";
import { Category } from "./sources";
import { DbSource } from "./sourcesDb";

/**
 * Per-user source resolution.
 *
 * Default policy:
 *  - Built-in sources are ENABLED unless the user has an explicit
 *    UserSourcePref row with enabled=false.
 *  - Custom sources are visible ONLY to the user who added them.
 *    Other users never see them, even with the same toggle table.
 *
 * Cron still fetches ALL sources (built-in + every user-added URL) into
 * the shared news_item table; per-user filtering happens at view time
 * through getUserEnabledSourceNames().
 */

/** Names of every source the user has effectively enabled — built-ins
 *  minus their disabled prefs, plus their own custom sources. Used as
 *  the IN-list in NewsItem queries to scope the feed. */
export async function getUserEnabledSourceNames(
  userId: string,
): Promise<string[]> {
  const [builtIns, disabledPrefs, myCustom] = await Promise.all([
    prisma.devpulseSource.findMany({
      where: { isBuiltIn: true },
      select: { id: true, name: true },
    }),
    prisma.devpulseUserSourcePref.findMany({
      where: { userId, enabled: false },
      select: { sourceId: true },
    }),
    prisma.devpulseSource.findMany({
      where: { isBuiltIn: false, createdByUserId: userId },
      select: { name: true },
    }),
  ]);
  const disabledIds = new Set(disabledPrefs.map((p) => p.sourceId));
  const enabledBuiltIns = builtIns
    .filter((s) => !disabledIds.has(s.id))
    .map((s) => s.name);
  return [...enabledBuiltIns, ...myCustom.map((s) => s.name)];
}

export type SourceWithToggle = DbSource & { enabled: boolean };

/** List for the /settings UI — built-ins + the user's own custom sources,
 *  each annotated with `enabled` (current effective state). */
export async function listUserSettingsSources(
  userId: string,
): Promise<SourceWithToggle[]> {
  const [builtIns, disabledPrefs, myCustom] = await Promise.all([
    prisma.devpulseSource.findMany({
      where: { isBuiltIn: true },
      orderBy: [{ category: "asc" }, { weight: "desc" }, { name: "asc" }],
    }),
    prisma.devpulseUserSourcePref.findMany({
      where: { userId, enabled: false },
      select: { sourceId: true },
    }),
    prisma.devpulseSource.findMany({
      where: { isBuiltIn: false, createdByUserId: userId },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);
  const disabledIds = new Set(disabledPrefs.map((p) => p.sourceId));
  const mapRow = (
    r: (typeof builtIns)[number],
    enabled: boolean,
  ): SourceWithToggle => ({
    id: r.id,
    name: r.name,
    url: r.url,
    category: r.category,
    weight: r.weight,
    isBuiltIn: r.isBuiltIn,
    createdByUserId: r.createdByUserId,
    disabledAt: r.disabledAt,
    failureCount: r.failureCount,
    enabled,
  });
  return [
    ...builtIns.map((r) => mapRow(r, !disabledIds.has(r.id))),
    ...myCustom.map((r) => mapRow(r, true)),
  ];
}

export type AddSourceInput = {
  name: string;
  url: string;
  category: Category;
};

/**
 * If the URL doesn't immediately look like a feed (parseFeed returns 0
 * items from its HTML body), fetch it and look for the canonical
 *   <link rel="alternate" type="application/rss+xml" href="..."> tag
 * that every reasonable blog/CMS emits in its <head>. Returns the
 * resolved feed URL, or the original URL if discovery fails — addCustom-
 * Source's normal parseFeed validation will then surface the error.
 */
export async function resolveFeedUrl(rawUrl: string): Promise<string> {
  let initialUrl: URL;
  try {
    initialUrl = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  // SSRF guard: refuse to even probe URLs that point at our own
  // network — RFC1918, loopback, link-local, cloud metadata. Otherwise
  // a user could add `http://169.254.169.254/...` as a "custom feed"
  // and trick our server into fetching internal endpoints.
  if (isBlockedHost(initialUrl.hostname)) return rawUrl;

  let html: string;
  try {
    const res = await safeFetch(rawUrl, {
      headers: {
        "user-agent": "devpulse-bot/0.1 (+https://github.com/holovkoivan)",
        accept:
          "application/atom+xml, application/rss+xml, text/html;q=0.9, */*;q=0.5",
      },
      timeoutMs: 10_000,
    });
    if (!res.ok) return rawUrl;
    const contentType = res.headers.get("content-type") ?? "";
    html = await res.text();
    // If the URL already returns a parseable feed, skip discovery.
    if (
      /xml|rss|atom/i.test(contentType) ||
      /<(rss|feed)\b/i.test(html.slice(0, 1000))
    ) {
      if (parseFeed(html).length > 0) return rawUrl;
    }
  } catch {
    return rawUrl;
  }

  // Look for any RSS/Atom <link> alternate. Take the first match — most
  // sites only declare one anyway, and ranking RSS-vs-Atom isn't worth
  // the complexity.
  const re =
    /<link\b[^>]*rel=["']alternate["'][^>]*type=["'](application\/(?:rss|atom)\+xml)["'][^>]*href=["']([^"']+)["']/gi;
  // <link href="..."> with type/rel ordering reversed shows up in the wild too.
  const reAlt =
    /<link\b[^>]*type=["'](application\/(?:rss|atom)\+xml)["'][^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/gi;
  for (const r of [re, reAlt]) {
    const m = r.exec(html);
    if (m) {
      try {
        return new URL(m[2], initialUrl).toString();
      } catch {
        /* malformed href — try the other regex */
      }
    }
  }
  return rawUrl;
}

export type AddSourceResult =
  | { ok: true; sourceId: string }
  | { ok: false; error: string };

/** Validate + persist a new user-added source. Returns the new id on
 *  success; reports a friendly error otherwise. Called from a server
 *  action — never trust the caller to have already validated. */
export async function addCustomSource(
  userId: string,
  input: AddSourceInput,
): Promise<AddSourceResult> {
  const name = input.name.trim().slice(0, 80);
  const rawUrl = input.url.trim();
  if (!name) return { ok: false, error: "Give it a short name." };
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { ok: false, error: "URL must be http(s)." };
    }
  } catch {
    return { ok: false, error: "That URL doesn't look valid." };
  }
  // SSRF guard at the create path. Final defence is in the fetch
  // helper, but rejecting up-front gives the user a clear message
  // rather than silently failing in cron.
  if (isBlockedHost(parsed.hostname)) {
    return { ok: false, error: "That URL is on a private network." };
  }

  // Auto-discover: pasting "https://antfu.me" should land the RSS feed
  // at /feed/index.xml, not the homepage HTML.
  const url = await resolveFeedUrl(rawUrl);

  const VALID_CATEGORIES = new Set<Category>([
    "framework",
    "language",
    "browser",
    "tooling",
    "runtime",
    "platform",
    "community",
  ]);
  if (!VALID_CATEGORIES.has(input.category)) {
    return { ok: false, error: "Pick a valid category." };
  }

  // Per-user cap: a malicious (or just over-enthusiastic) signup
  // could otherwise add 10k garbage feeds, each of which the cron
  // dutifully fetches on every run, blowing through the Hobby DB
  // quota and outbound bandwidth. 25 is generous for a personal
  // reader — the curated built-in list is ~30 and most users add a
  // handful.
  const MAX_CUSTOM_SOURCES = 25;
  const myCount = await prisma.devpulseSource.count({
    where: { isBuiltIn: false, createdByUserId: userId },
  });
  if (myCount >= MAX_CUSTOM_SOURCES) {
    return {
      ok: false,
      error: `You've hit the ${MAX_CUSTOM_SOURCES}-feed cap. Remove one before adding another.`,
    };
  }

  // Per-user uniqueness: reject built-in dupes globally (they're
  // curated), but for custom sources only check against THIS user's
  // rows. We never leak whether some other user added the same URL —
  // they get their own row with their own name/category.
  const builtinDup = await prisma.devpulseSource.findFirst({
    where: { url, isBuiltIn: true },
    select: { id: true },
  });
  if (builtinDup) {
    return { ok: false, error: "That feed is already in the curated list." };
  }
  const mineDup = await prisma.devpulseSource.findFirst({
    where: { url, isBuiltIn: false, createdByUserId: userId },
    select: { id: true },
  });
  if (mineDup) {
    return { ok: false, error: "You already added this feed." };
  }

  const created = await prisma.devpulseSource.create({
    data: {
      name,
      url,
      category: input.category,
      weight: 5,
      isBuiltIn: false,
      createdByUserId: userId,
    },
    select: { id: true },
  });
  return { ok: true, sourceId: created.id };
}

/** Toggle a source on/off for a user. Built-ins use UserSourcePref rows
 *  (absence = enabled). For the user's own custom sources we don't
 *  bother — toggling a custom one effectively means deleting it. */
export async function toggleSource(
  userId: string,
  sourceId: string,
  enabled: boolean,
): Promise<void> {
  const source = await prisma.devpulseSource.findUnique({
    where: { id: sourceId },
    select: { isBuiltIn: true, createdByUserId: true },
  });
  if (!source) return;
  if (!source.isBuiltIn) return; // custom sources don't have prefs
  await prisma.devpulseUserSourcePref.upsert({
    where: { userId_sourceId: { userId, sourceId } },
    create: { userId, sourceId, enabled },
    update: { enabled },
  });
}

/** Remove a user's own custom source. No-ops if the source is built-in
 *  or belongs to someone else — only the creator can delete it. */
export async function removeCustomSource(
  userId: string,
  sourceId: string,
): Promise<void> {
  await prisma.devpulseSource.deleteMany({
    where: { id: sourceId, isBuiltIn: false, createdByUserId: userId },
  });
}
