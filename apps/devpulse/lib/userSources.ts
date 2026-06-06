import { Category } from "./sources";
import { DbSource } from "./sourcesDb";
import { prisma } from "./prisma";

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
  const url = input.url.trim();
  if (!name) return { ok: false, error: "Give it a short name." };
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      return { ok: false, error: "URL must be http(s)." };
    }
  } catch {
    return { ok: false, error: "That URL doesn't look valid." };
  }

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

  // Reject if URL already exists — shared across users, so adding a
  // duplicate doesn't make sense (you'd just toggle the existing row).
  const existing = await prisma.devpulseSource.findUnique({
    where: { url },
    select: { id: true, isBuiltIn: true },
  });
  if (existing) {
    return {
      ok: false,
      error: existing.isBuiltIn
        ? "That feed is already in the curated list."
        : "Someone already added that feed.",
    };
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
