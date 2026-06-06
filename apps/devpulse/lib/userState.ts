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

export async function addSaved(userId: string, url: string): Promise<void> {
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
