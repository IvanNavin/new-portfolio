import { prisma } from "./prisma";

export type UserPrefs = {
  /** When false (default), the home feed and Atom export hide rows where
   *  isPreRelease=true. Flip on from /settings to surface canary / beta /
   *  rc / dev releases inline with the curated baseline. */
  showPreReleases: boolean;
};

export const DEFAULT_PREFS: UserPrefs = {
  showPreReleases: false,
};

export async function getUserPrefs(userId: string): Promise<UserPrefs> {
  const row = await prisma.devpulseUser.findUnique({
    where: { id: userId },
    select: { showPreReleases: true },
  });
  if (!row) return DEFAULT_PREFS;
  return { showPreReleases: row.showPreReleases };
}
