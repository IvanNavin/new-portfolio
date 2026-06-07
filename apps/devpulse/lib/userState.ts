import { prisma } from "./prisma";

/**
 * Per-user personal state (saved, dismissed, last-visit) backed by Postgres.
 * Counterpart to lib/storage.ts which keeps the same shape in localStorage
 * for unauthenticated visitors. The two paths converge through
 * AuthedStateSync, which mirrors DB → localStorage on sign-in.
 */

export async function getUserSavedUrls(userId: string): Promise<string[]> {
  const rows = await prisma.devpulseSavedItem.findMany({
    where: { userId },
    select: { url: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => r.url);
}

/** Per-user caps. Upsert dedupes same-url adds, so the only way to
 *  grow these is to save/dismiss/read distinct stories — bounded
 *  organically by ingestion, but a malicious actor could still
 *  enumerate every news_item URL we've ever stored. Hard cap stops
 *  any single user from claiming a runaway slice of the 500MB Hobby
 *  database. */
const MAX_SAVED = 2000;
const MAX_DISMISSED = 10000;

export async function addSaved(userId: string, url: string): Promise<void> {
  // Cheap count check before the upsert. If the user is already at
  // cap we silently no-op — the UI doesn't surface this case (the
  // visible affordance is just a star toggle) and a soft drop reads
  // less broken than an error toast in this edge case.
  const count = await prisma.devpulseSavedItem.count({ where: { userId } });
  if (count >= MAX_SAVED) {
    const exists = await prisma.devpulseSavedItem.findUnique({
      where: { userId_url: { userId, url } },
      select: { id: true },
    });
    if (!exists) return;
  }
  await prisma.devpulseSavedItem.upsert({
    where: { userId_url: { userId, url } },
    create: { userId, url },
    update: {},
  });
}

export async function removeSaved(userId: string, url: string): Promise<void> {
  await prisma.devpulseSavedItem.deleteMany({ where: { userId, url } });
}

export async function getUserDismissedUrls(userId: string): Promise<string[]> {
  const rows = await prisma.devpulseDismissedItem.findMany({
    where: { userId },
    select: { url: true },
  });
  return rows.map((r) => r.url);
}

export async function addDismissed(userId: string, url: string): Promise<void> {
  const count = await prisma.devpulseDismissedItem.count({ where: { userId } });
  if (count >= MAX_DISMISSED) {
    const exists = await prisma.devpulseDismissedItem.findUnique({
      where: { userId_url: { userId, url } },
      select: { id: true },
    });
    if (!exists) return;
  }
  await prisma.devpulseDismissedItem.upsert({
    where: { userId_url: { userId, url } },
    create: { userId, url },
    update: {},
  });
}

/**
 * Returns the *previous* lastVisitAt (used by the NEW-pill logic to
 * highlight items published since the last visit) and immediately stamps
 * a fresh timestamp. Mirrors readAndBumpLastVisit() from lib/storage.ts.
 */
export async function bumpLastVisit(userId: string): Promise<Date | null> {
  const user = await prisma.devpulseUser.findUnique({
    where: { id: userId },
    select: { lastVisitAt: true },
  });
  await prisma.devpulseUser.update({
    where: { id: userId },
    data: { lastVisitAt: new Date() },
  });
  return user?.lastVisitAt ?? null;
}
